/**
 * GET /api/activity?id=FZ-001: weekly commit counts for one venture's public
 * GitHub repositories, summed, for the last 52 weeks.
 *
 * Caching: the result is stored in Cloudflare's edge cache for 24 hours
 * (s-maxage). The first request after it expires refetches from GitHub, so the
 * chart refreshes at most once a day per data centre and GitHub sees a handful
 * of calls a day, not one per visitor.
 *
 * Security posture:
 *  - The caller names a venture id, never a GitHub owner or repo. The sources
 *    come from activity-sources.json, generated from assets/fz-data.js by
 *    tools/sync-ventures.js, so this cannot be used to proxy arbitrary GitHub
 *    lookups through our rate limit.
 *  - GITHUB_TOKEN is optional and a Cloudflare Pages secret. It only raises the
 *    rate limit; it needs no scopes, since everything read here is public.
 *  - Failures are cached briefly, so a GitHub outage or rate limit is not
 *    retried on every page view.
 */

import SOURCES from './activity-sources.json';

const WEEKS = 52;
const DAY = 86400;
const MAX_REPOS = 40; // Workers allow 50 subrequests per invocation on the free plan

const json = (status, obj, ttl) =>
  new Response(JSON.stringify(obj), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      // browsers keep it an hour; the edge keeps it for `ttl`
      'cache-control': `public, max-age=${Math.min(ttl, 3600)}, s-maxage=${ttl}`,
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

  // Normalised key, so extra query parameters cannot fragment or bypass the cache.
  const cache = caches.default;
  const key = new Request(new URL(`/api/activity?id=${encodeURIComponent(id)}`, request.url).toString());
  const hit = await cache.match(key);
  if (hit) return hit;

  const gh = path =>
    fetch(`https://api.github.com${path}`, {
      headers: {
        accept: 'application/vnd.github+json',
        'user-agent': 'factory0.ventures',
        'x-github-api-version': '2022-11-28',
        ...(env.GITHUB_TOKEN ? { authorization: `Bearer ${env.GITHUB_TOKEN}` } : {}),
      },
    });

  let res;
  try {
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
      const all = (await r.json()).all || [];
      all.slice(-WEEKS).forEach((n, i) => { weekly[WEEKS - all.slice(-WEEKS).length + i] += n; });
    }));

    const start = weekStart(new Date());
    const weeks = weekly.map((commits, i) => {
      const d = new Date(start);
      d.setUTCDate(d.getUTCDate() - 7 * (WEEKS - 1 - i));
      return { week: d.toISOString().slice(0, 10), commits };
    });

    // A partial answer is cached for minutes, not a day, so it fills in soon.
    const ttl = pending ? 600 : DAY;
    res = json(200, {
      id,
      repos: list.length,
      total: weekly.reduce((a, b) => a + b, 0),
      weeks,
      pending,
      updated: new Date().toISOString(),
    }, ttl);
  } catch (e) {
    console.log('activity', id, e.message);
    res = json(502, { error: 'unavailable' }, 900);
  }

  context.waitUntil(cache.put(key, res.clone()));
  return res;
}
