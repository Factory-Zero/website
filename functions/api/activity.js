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

// GitHub REST, authenticated as `auth` (an installation token) or, failing
// that, GITHUB_TOKEN. Error messages carry the status only, never a repository
// name, since they can reach the response body and a private name must not.
function github(env) {
  return (path, auth) =>
    fetch(`https://api.github.com${path}`, {
      method: 'GET',
      headers: {
        accept: 'application/vnd.github+json',
        'user-agent': 'factory0.ventures',
        'x-github-api-version': '2022-11-28',
        ...(auth || env.GITHUB_TOKEN ? { authorization: `Bearer ${auth || env.GITHUB_TOKEN}` } : {}),
      },
    });
}

async function fetchActivity(env, id, sources) {
  const gh = github(env);
  const app = await appTokens(env, sources.owners.concat(sources.repos.map(r => r.split('/')[0])));

  // Every repository to count, with the token that can read it. `publicRepos`
  // is the subset whose names and issues may be shown; private ones only ever
  // contribute to totals.
  const repos = new Map();          // full name -> auth (installation token or null)
  const publicRepos = new Set();
  for (const owner of sources.owners) {
    const auth = app.get(owner);
    if (auth) {
      // The installation lists everything it was granted, private included.
      for (let page = 1; page <= 5; page++) {
        const r = await gh(`/installation/repositories?per_page=100&page=${page}`, auth);
        if (!r.ok) throw new Error(`installation repositories: ${r.status}`);
        const { repositories = [] } = await r.json();
        for (const repo of repositories) {
          if (repo.fork || repo.owner.login.toLowerCase() !== owner) continue;
          repos.set(repo.full_name.toLowerCase(), auth);
          if (!repo.private) publicRepos.add(repo.full_name.toLowerCase());
        }
        if (repositories.length < 100) break;
      }
    } else {
      // An owner-only source without the app means every public, non-fork repository it has.
      const r = await gh(`/users/${owner}/repos?type=owner&per_page=100`);
      if (!r.ok) throw new Error(`list repositories: ${r.status}`);
      for (const repo of await r.json()) {
        if (repo.fork || repo.private) continue;
        repos.set(repo.full_name.toLowerCase(), null);
        publicRepos.add(repo.full_name.toLowerCase());
      }
    }
  }
  // Repositories linked from fz-data.js are public by the rule stated there.
  for (const full of sources.repos) {
    if (!repos.has(full)) repos.set(full, app.get(full.split('/')[0]) || null);
    publicRepos.add(full);
  }

  const list = [...repos.keys()].slice(0, MAX_REPOS);
  const weekly = new Array(WEEKS).fill(0);
  let pending = false;
  await Promise.all(list.map(async full => {
    const r = await gh(`/repos/${full}/stats/participation`, repos.get(full));
    // 202: GitHub is still computing the stats for this repository
    if (r.status === 202) { pending = true; return; }
    // 204/404: empty or vanished repository, which has no activity to add
    if (r.status === 204 || r.status === 404) return;
    if (!r.ok) throw new Error(`stats: ${r.status}`);
    const all = ((await r.json()).all || []).slice(-WEEKS);
    all.forEach((n, i) => { weekly[WEEKS - all.length + i] += n; });
  }));

  const start = weekStart(new Date());
  const weeks = weekly.map((commits, i) => {
    const d = new Date(start);
    d.setUTCDate(d.getUTCDate() - 7 * (WEEKS - 1 - i));
    return { week: d.toISOString().slice(0, 10), commits };
  });

  // Issues come from search. A failure here leaves the commit chart standing.
  let issues = null;
  try {
    issues = await issueActivity(gh, sources, app, publicRepos, weeks);
  } catch (e) {
    console.log('activity issues', id, e.message);
  }

  return {
    id,
    repos: list.length,
    private: list.filter(r => !publicRepos.has(r)).length,
    total: weekly.reduce((a, b) => a + b, 0),
    weeks,
    issues,
    pending,
    updated: new Date().toISOString(),
  };
}

// Open issues (count, and the five newest in PUBLIC repositories) and, per
// week in `weeks`, how many were opened and closed. Adds `opened` and `closed`
// to each week in place. Search ORs user:/repo: qualifiers but only sees
// private repositories through that owner's installation token, so there is
// one search per token: one per installed owner, plus one for the rest.
async function issueActivity(gh, sources, app, publicRepos, weeks) {
  const groups = new Map();         // auth -> qualifiers
  const add = (owner, q) => {
    const auth = app.get(owner) || null;
    if (!groups.has(auth)) groups.set(auth, new Set());
    groups.get(auth).add(q);
  };
  sources.owners.forEach(o => add(o, `user:${o}`));
  sources.repos.forEach(r => { if (!sources.owners.includes(r.split('/')[0])) add(r.split('/')[0], `repo:${r}`); });

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

  let open = 0;
  const candidates = [];
  for (const [auth, quals] of groups) {
    const q = [...quals, 'is:issue'].join(' ');
    const search = (extra, params) =>
      gh(`/search/issues?q=${encodeURIComponent(`${q} ${extra}`)}&${params}`, auth).then(r => {
        if (!r.ok) throw new Error(`search: ${r.status}`);
        return r.json();
      });

    // 30, not 5: the list below drops some before keeping the newest five
    const o = await search('is:open', 'sort=created&order=desc&per_page=30');
    open += o.total_count || 0;
    candidates.push(...(o.items || []));

    for (let page = 1; page <= ISSUE_PAGES; page++) {
      const r = await search(`updated:>=${from}`, `sort=updated&order=desc&per_page=100&page=${page}`);
      for (const it of r.items || []) {
        bucket(it.created_at, 'opened');
        bucket(it.closed_at, 'closed');
      }
      if ((r.items || []).length < 100) break;
    }
  }

  const repoOf = it => it.repository_url.split('/').slice(-2).join('/');
  return {
    open,
    // Only public repositories, and not open security reports: those are public
    // on GitHub but not advertised here. Everything still counts in `open`.
    latest: candidates
      .filter(it => publicRepos.has(repoOf(it).toLowerCase()))
      .filter(it => /^https:\/\/github\.com\//.test(it.html_url) && !sensitive(it))
      .sort((a, b) => (a.created_at < b.created_at ? 1 : -1))
      .slice(0, 5)
      .map(it => ({
        title: String(it.title || '').slice(0, 200),
        url: it.html_url,
        repo: repoOf(it),
        number: it.number,
        created: it.created_at,
      })),
  };
}

const SENSITIVE = /secur|vulnerab|\bcve\b|exploit|\bauth\b|unauth|leak|injection|\bxss\b|\bssrf\b|\brce\b/i;
const sensitive = it =>
  SENSITIVE.test(it.title || '') || (it.labels || []).some(l => SENSITIVE.test(l.name || ''));

/* ---------- GitHub App: read-only access to private repositories ----------
   Optional. With GH_APP_ID and GH_APP_PRIVATE_KEY (PKCS#8 PEM) set, owners that
   installed the app are read through an installation token, so private
   repositories count toward the numbers. Owners without it fall back to
   GITHUB_TOKEN and public repositories only. The app needs Metadata: read and
   Issues: read; it can read nothing else. */

async function appTokens(env, owners) {
  const tokens = new Map();         // owner (lowercase) -> installation token
  if (!env.GH_APP_ID || !env.GH_APP_PRIVATE_KEY) return tokens;
  const wanted = new Set(owners.map(o => o.toLowerCase()));
  const jwt = await appJwt(env.GH_APP_ID, env.GH_APP_PRIVATE_KEY);
  const call = (path, method = 'GET') =>
    fetch(`https://api.github.com${path}`, {
      method,
      headers: {
        accept: 'application/vnd.github+json',
        authorization: `Bearer ${jwt}`,
        'user-agent': 'factory0.ventures',
        'x-github-api-version': '2022-11-28',
      },
    });

  const r = await call('/app/installations?per_page=100');
  if (!r.ok) throw new Error(`app installations: ${r.status}`);
  for (const inst of await r.json()) {
    const owner = inst.account.login.toLowerCase();
    if (!wanted.has(owner)) continue;
    const t = await call(`/app/installations/${inst.id}/access_tokens`, 'POST');
    if (!t.ok) throw new Error(`installation token: ${t.status}`);
    tokens.set(owner, (await t.json()).token);
  }
  return tokens;
}

// RS256 JWT for the app itself, valid ten minutes (GitHub's maximum).
async function appJwt(appId, pem) {
  const b64url = buf => btoa(String.fromCharCode(...new Uint8Array(buf)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  const enc = obj => b64url(new TextEncoder().encode(JSON.stringify(obj)));
  const now = Math.floor(Date.now() / 1000);
  const body = `${enc({ alg: 'RS256', typ: 'JWT' })}.${enc({ iat: now - 60, exp: now + 540, iss: String(appId) })}`;
  const der = Uint8Array.from(atob(pem.replace(/-----[^-]+-----|\s/g, '')), c => c.charCodeAt(0));
  const key = await crypto.subtle.importKey('pkcs8', der, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['sign']);
  return `${body}.${b64url(await crypto.subtle.sign('RSASSA-PKCS1-v1_5', key, new TextEncoder().encode(body)))}`;
}
