/*
 * GET /api/log: the latest real public GitHub activity across the ventures,
 * for the FZ/LOG panel on the home page. Merged pull requests and opened
 * issues in the last 30 days, newest first, plus the count of merged pull
 * requests in that window.
 *
 * Only public repositories are searched (`is:public`), so a private
 * repository's name or title can never reach this response. The owners and
 * repositories come from activity-sources.json (generated from fz-data.js),
 * the same allowlist /api/activity uses.
 *
 * Caching mirrors /api/activity: the last good result lives in Workers KV
 * (binding ACTIVITY, key `log:v1`) and is refreshed in the background when it
 * is 15 minutes old; a failed refresh keeps the old copy and retries in 5.
 */
import SOURCES from './activity-sources.json';

const DAY = 86400e3;
const FRESH = 15 * 60e3;
const RETRY = 5 * 60e3;
const KEY = 'log:v1';
const ITEMS = 60;
const MAX_QUERY = 200; // GitHub search allows 256 characters of query; stay well under

const json = (status, obj, maxAge) =>
  new Response(JSON.stringify(obj), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': `public, max-age=${maxAge}`,
      'x-content-type-options': 'nosniff',
    },
  });

export async function onRequestGet(context) {
  const { env } = context;
  const kv = env.ACTIVITY;
  const stored = kv ? await kv.get(KEY, { type: 'json', cacheTtl: 60 }) : null;

  if (stored && stored.data) {
    if (Date.now() >= stored.next) {
      context.waitUntil((async () => {
        await kv.put(KEY, JSON.stringify({ data: stored.data, next: Date.now() + RETRY }));
        await refresh(env);
      })().catch(e => console.log('log refresh', e.message)));
    }
    return json(200, stored.data, 120);
  }

  try {
    return json(200, await refresh(env), 120);
  } catch (e) {
    console.log('log', e.message);
    return json(503, { error: 'unavailable' }, 60);
  }
}

async function refresh(env) {
  const data = await fetchLog(env);
  if (env.ACTIVITY) await env.ACTIVITY.put(KEY, JSON.stringify({ data, next: Date.now() + FRESH }));
  return data;
}

// owner (lowercase) -> venture id, and "owner/repo" -> venture id
function ventureIndex() {
  const owners = new Map(), repos = new Map();
  for (const [id, s] of Object.entries(SOURCES)) {
    for (const o of s.owners) owners.set(o.toLowerCase(), id);
    for (const r of s.repos) repos.set(r.toLowerCase(), id);
  }
  return { owners, repos };
}

// Split the qualifiers into search queries that stay under GitHub's length limit.
function batches(qualifiers, prefix) {
  const out = [];
  let cur = [];
  for (const q of qualifiers) {
    const next = [...cur, q];
    if (cur.length && (prefix + ' ' + next.join(' ')).length > MAX_QUERY) { out.push(cur); cur = [q]; }
    else cur = next;
  }
  if (cur.length) out.push(cur);
  return out.map(b => `${prefix} ${b.join(' ')}`);
}

async function search(env, q) {
  const r = await fetch(`https://api.github.com/search/issues?q=${encodeURIComponent(q)}&sort=updated&order=desc&per_page=50`, {
    headers: {
      accept: 'application/vnd.github+json',
      'user-agent': 'factory0.ventures',
      'x-github-api-version': '2022-11-28',
      ...(env.GITHUB_TOKEN ? { authorization: `Bearer ${env.GITHUB_TOKEN}` } : {}),
    },
  });
  if (!r.ok) throw new Error(`search ${r.status}`);
  return r.json();
}

async function fetchLog(env) {
  const { owners, repos } = ventureIndex();
  const since = new Date(Date.now() - 30 * DAY).toISOString().slice(0, 10);
  const quals = [...[...owners.keys()].map(o => `org:${o}`), ...[...repos.keys()].map(r => `repo:${r}`)];
  if (!quals.length) return { updated: new Date().toISOString(), merged30d: 0, items: [] };

  const prQueries = batches(quals, `is:public is:pr is:merged merged:>=${since}`);
  const issueQueries = batches(quals, `is:public is:issue created:>=${since}`);

  const seen = new Set();
  const items = [];
  let merged30d = 0;
  const ventureOf = (repoUrl) => {
    const full = repoUrl.replace('https://api.github.com/repos/', '').toLowerCase();
    return repos.get(full) || owners.get(full.split('/')[0]) || null;
  };

  for (const q of prQueries) {
    const res = await search(env, q);
    merged30d += res.total_count || 0;
    for (const it of res.items || []) {
      if (seen.has(it.html_url)) continue;
      seen.add(it.html_url);
      items.push({
        t: it.pull_request && it.pull_request.merged_at ? it.pull_request.merged_at : it.closed_at,
        kind: 'merged', venture: ventureOf(it.repository_url),
        repo: it.repository_url.replace('https://api.github.com/repos/', ''),
        number: it.number, title: it.title, url: it.html_url,
      });
    }
  }
  for (const q of issueQueries) {
    const res = await search(env, q);
    for (const it of res.items || []) {
      if (seen.has(it.html_url)) continue;
      seen.add(it.html_url);
      items.push({
        t: it.created_at, kind: 'opened', venture: ventureOf(it.repository_url),
        repo: it.repository_url.replace('https://api.github.com/repos/', ''),
        number: it.number, title: it.title, url: it.html_url,
      });
    }
  }

  items.sort((a, b) => (a.t < b.t ? 1 : -1));
  // At most three entries per repository, so a busy repository or a batch of
  // filed issues cannot crowd the others out of the feed.
  const perRepo = new Map();
  const spread = items.filter(it => {
    const n = (perRepo.get(it.repo) || 0) + 1;
    perRepo.set(it.repo, n);
    return n <= 3;
  });
  return { updated: new Date().toISOString(), since, merged30d, items: spread.slice(0, ITEMS) };
}
