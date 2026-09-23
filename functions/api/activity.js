/**
 * GET /api/activity?id=FZ-001: one venture's public GitHub activity for the
 * last 52 weeks: weekly commits summed across its repositories, and its issues
 * (open count, the latest open ones, and opened/closed per week).
 *
 * Caching (stale-while-revalidate, in Workers KV bound as ACTIVITY):
 *  - Every request is answered from the last good result in KV, one copy for
 *    every data centre, so a visitor never waits on GitHub once a venture has
 *    been fetched once.
 *  - When that copy is due (24 hours after a complete fetch, 10 minutes after
 *    a partial one), the request that notices refreshes it in the background.
 *  - A refresh that fails leaves the old copy in place and tries again in 10
 *    minutes. A GitHub outage, a rate limit or an expired GITHUB_TOKEN makes
 *    the chart older, never empty. Only a venture that has never been fetched
 *    successfully can show an error.
 *
 * Security posture:
 *  - The caller names a venture id, never a GitHub owner or repo. The sources
 *    come from activity-sources.json, generated from assets/fz-data.js by
 *    tools/sync-ventures.js, so this cannot be used to proxy arbitrary GitHub
 *    lookups through our rate limit.
 *  - GITHUB_TOKEN is a Cloudflare Pages secret. It only raises the rate limit;
 *    it needs no permissions, since everything read here is public.
 */

import SOURCES from './activity-sources.json';

const WEEKS = 52;
const DAY = 86400e3;
const RETRY = 600e3;   // after a failed or partial refresh
const MAX_REPOS = 40;  // Workers allow 50 subrequests per invocation on the free plan
const ISSUE_PAGES = 2; // up to 200 issues touched in the window, which covers every venture today

const json = (status, obj, maxAge) =>
  new Response(JSON.stringify(obj), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      // short on purpose: KV holds the real copy, this only spares repeat views
      'cache-control': `public, max-age=${maxAge}`,
      'x-content-type-options': 'nosniff',
    },
  });

// Sunday 00:00 UTC of the current week, which is where GitHub's stats weeks start.
function weekStart(now) {
  const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  d.setUTCDate(d.getUTCDate() - d.getUTCDay());
  return d;
}

export async function onRequestGet(context) {
  const { request, env } = context;
  const id = new URL(request.url).searchParams.get('id') || '';
  const sources = Object.prototype.hasOwnProperty.call(SOURCES, id) ? SOURCES[id] : null;
  if (!sources) return json(404, { error: 'unknown venture' }, 3600);

  const key = `activity:${id}`;
  const kv = env.ACTIVITY;
  // KV caches reads at the edge for cacheTtl seconds; a minute is plenty
  const stored = kv ? await kv.get(key, { type: 'json', cacheTtl: 60 }) : null;

  if (stored && stored.data) {
    if (Date.now() >= stored.next) {
      // Claim the refresh first so the next few visitors do not start their
      // own; KV is eventually consistent, so this narrows the race, no more.
      context.waitUntil((async () => {
        await kv.put(key, JSON.stringify({ data: stored.data, next: Date.now() + RETRY }));
        await refresh(env, id, sources, stored.data);
      })().catch(e => console.log('activity refresh', id, e.message)));
    }
    return json(200, stored.data, 300);
  }

  // Never fetched (or no KV bound, as in plain local dev): fetch while the visitor waits.
  try {
    return json(200, await refresh(env, id, sources, null), 300);
  } catch (e) {
    console.log('activity', id, e.message);
    // 503, not 502: on the custom domain Cloudflare swaps a 502 body for its own error page
    return json(503, { error: 'unavailable', upstream: e.message }, 60);
  }
}

// Fetch from GitHub and store the result. A partial result (stats still being
// computed, or issues unavailable) is stored only if it is all we have, and
// either way is retried soon. Throws if GitHub could not be read at all.
async function refresh(env, id, sources, previous) {
  const data = await fetchActivity(env, id, sources);
  const complete = !data.pending && data.issues;
  const keep = complete || !previous ? data : previous;
  if (env.ACTIVITY) {
    await env.ACTIVITY.put(`activity:${id}`, JSON.stringify({
      data: keep,
      next: Date.now() + (complete ? DAY : RETRY),
    }));
  }
  return keep;
}

async function fetchActivity(env, id, sources) {
  const gh = path =>
    fetch(`https://api.github.com${path}`, {
      headers: {
        accept: 'application/vnd.github+json',
        'user-agent': 'factory0.ventures',
        'x-github-api-version': '2022-11-28',
        ...(env.GITHUB_TOKEN ? { authorization: `Bearer ${env.GITHUB_TOKEN}` } : {}),
      },
    });

  // An owner-only source means every public, non-fork repository it has.
  const repos = new Set(sources.repos);
  for (const owner of sources.owners) {
    const r = await gh(`/users/${owner}/repos?type=owner&per_page=100`);
    if (!r.ok) throw new Error(`list ${owner}: ${r.status}`);
    for (const repo of await r.json()) {
      if (!repo.fork && !repo.private) repos.add(repo.full_name.toLowerCase());
    }
  }

  const list = [...repos].slice(0, MAX_REPOS);
  const weekly = new Array(WEEKS).fill(0);
  let pending = false;
  await Promise.all(list.map(async full => {
    const r = await gh(`/repos/${full}/stats/participation`);
    // 202: GitHub is still computing the stats for this repository
    if (r.status === 202) { pending = true; return; }
    // 204/404: empty or vanished repository, which has no activity to add
    if (r.status === 204 || r.status === 404) return;
    if (!r.ok) throw new Error(`stats ${full}: ${r.status}`);
    const all = ((await r.json()).all || []).slice(-WEEKS);
    all.forEach((n, i) => { weekly[WEEKS - all.length + i] += n; });
  }));

  const start = weekStart(new Date());
  const weeks = weekly.map((commits, i) => {
    const d = new Date(start);
    d.setUTCDate(d.getUTCDate() - 7 * (WEEKS - 1 - i));
    return { week: d.toISOString().slice(0, 10), commits };
  });

  // Issues come from search, which ORs user:/repo: qualifiers, so one query
  // covers every source. A failure here leaves the commit chart standing.
  let issues = null;
  try {
    issues = await issueActivity(gh, sources, weeks);
  } catch (e) {
    console.log('activity issues', id, e.message);
  }

  return {
    id,
    repos: list.length,
    total: weekly.reduce((a, b) => a + b, 0),
    weeks,
    issues,
    pending,
    updated: new Date().toISOString(),
  };
}

// Open issues (count and the five newest) and, per week in `weeks`, how many
// were opened and closed. Adds `opened` and `closed` to each week in place.
async function issueActivity(gh, sources, weeks) {
  const q = [...sources.owners.map(o => `user:${o}`), ...sources.repos.map(r => `repo:${r}`), 'is:issue'].join(' ');
  const search = (extra, params) =>
    gh(`/search/issues?q=${encodeURIComponent(`${q} ${extra}`)}&${params}`).then(r => {
      if (!r.ok) throw new Error(`search ${r.status}`);
      return r.json();
    });

  // 30, not 5: the list below drops some before keeping the newest five
  const open = await search('is:open', 'sort=created&order=desc&per_page=30');

  const from = weeks[0].week;
  const index = new Map(weeks.map((w, i) => [w.week, i]));
  weeks.forEach(w => { w.opened = 0; w.closed = 0; });
  const bucket = (iso, field) => {
    if (!iso || iso.slice(0, 10) < from) return;
    const d = new Date(iso);
    d.setUTCDate(d.getUTCDate() - d.getUTCDay());
    const i = index.get(d.toISOString().slice(0, 10));
    if (i !== undefined) weeks[i][field]++;
  };
  for (let page = 1; page <= ISSUE_PAGES; page++) {
    const r = await search(`updated:>=${from}`, `sort=updated&order=desc&per_page=100&page=${page}`);
    for (const it of r.items || []) {
      bucket(it.created_at, 'opened');
      bucket(it.closed_at, 'closed');
    }
    if ((r.items || []).length < 100) break;
  }

  return {
    open: open.total_count || 0,
    // Open security reports are public on GitHub but are not advertised here:
    // they still count in `open` and the weekly bars, just not in the list.
    latest: (open.items || [])
      .filter(it => /^https:\/\/github\.com\//.test(it.html_url) && !sensitive(it))
      .slice(0, 5)
      .map(it => ({
        title: String(it.title || '').slice(0, 200),
        url: it.html_url,
        repo: it.repository_url.split('/').slice(-2).join('/'),
        number: it.number,
        created: it.created_at,
      })),
  };
}

const SENSITIVE = /secur|vulnerab|\bcve\b|exploit|\bauth\b|unauth|leak|injection|\bxss\b|\bssrf\b|\brce\b/i;
const sensitive = it =>
  SENSITIVE.test(it.title || '') || (it.labels || []).some(l => SENSITIVE.test(l.name || ''));
