/**
 * GET /api/authors[?id=FZ-001]: who wrote the code, over the last 12 weeks.
 * Merged pull requests, bucketed into Sunday weeks and split into colonizer
 * (head on a `colonizer/` branch), people, and bots. Without `id` every venture
 * is summed; with it, only that venture. The ventures come from
 * activity-sources.json, so this cannot be pointed at arbitrary repositories.
 *
 * Private repositories, read through the optional GitHub App, add to the totals
 * and to their venture but never to the weekly series the chart draws. No
 * repository name — public or private — reaches the payload, and nothing logged
 * here names one. Two failure paths are handled so they cannot leak: transport
 * failures (workerd's message embeds the request URL) and unparseable bodies
 * (V8's message embeds a fragment of the body) are both caught and turned into a
 * not-ok response, leaving only the status to log. A failure GitHub reports in
 * the response body itself is not covered by this.
 *
 * Caching mirrors /api/activity, in two parts. The last good result sits under
 * `authors:v1`, is served stale, and is refreshed in the background at most
 * every 30 minutes. The repository list sits separately under `authors:repos:v1`
 * for 6 hours: enumerating it per venture cost more subrequests than one
 * invocation has, which left the refresh permanently incomplete. A refresh that
 * runs out of budget, or that had to truncate a busy repository, keeps the old
 * copy; only a cold cache can answer 503.
 */
import SOURCES from './activity-sources.json';
import { MAX_PAGES, SUBREQUESTS, weekDates, collectPages, truncated, summarize, payload } from './_authors-core.js';

const RETRY = 30 * 60e3;   // do not refetch the pull requests more often than this
const REPO_AGE = 6 * 3600e3; // the repository list barely moves; hours, not minutes
const TOKEN_AGE = 50 * 60e3; // an installation token lives one hour
const TOKEN_BUDGET = 24;  // skip the app this pass rather than crowd out the repositories
const KEY = 'authors:v1';
const REPOS = 'authors:repos:v1';
const TOKENS = 'authors:tokens:v1';

const json = (status, obj, maxAge) =>
  new Response(JSON.stringify(obj), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': `public, max-age=${maxAge}`,
      'x-content-type-options': 'nosniff',
    },
  });

// A body that will not parse costs that one call and nothing else. V8 puts a
// fragment of the body in the message it throws, which for a private repository
// is a fragment of its name, so this must never be logged or rethrown: it is
// swallowed here and reported as the empty body it effectively is.
async function body(res, fallback) {
  try {
    return await res.json();
  } catch {
    return fallback;
  }
}

export async function onRequestGet(context) {
  const { request, env } = context;
  const id = new URL(request.url).searchParams.get('id') || '';
  if (id && !Object.prototype.hasOwnProperty.call(SOURCES, id)) {
    return json(404, { error: 'unknown venture' }, 3600);
  }

  const kv = env.ACTIVITY;
  const stored = kv ? await kv.get(KEY, { type: 'json', cacheTtl: 60 }) : null;
  if (stored && stored.data) {
    if (Date.now() >= stored.next) {
      // Claim the refresh first, so the next few visitors do not start their own.
      context.waitUntil((async () => {
        await kv.put(KEY, JSON.stringify({ data: stored.data, next: Date.now() + RETRY }));
        await refresh(env, stored.data);
      })().catch(e => console.log('authors refresh', e.message)));
    }
    return json(200, payload(stored.data, id), 300);
  }

  try { // never fetched, or no KV bound (plain local dev)
    return json(200, payload(await refresh(env, null), id), 300);
  } catch (e) {
    console.log('authors', e.message);
    // 503, not 502: on the custom domain Cloudflare swaps a 502 body for its own page
    return json(503, { error: 'unavailable' }, 60);
  }
}

async function refresh(env, previous) {
  const { data, complete } = await fetchAuthors(env);
  const keep = complete || !previous ? data : previous;
  if (env.ACTIVITY) await env.ACTIVITY.put(KEY, JSON.stringify({ data: keep, next: Date.now() + RETRY }));
  return keep;
}

// One entry per repository, split by public or private, then counted.
//
// The repository list is resolved ONCE for the whole endpoint and cached under
// its own key: enumerating per venture meant 22 owner listings (plus, with the
// app, an /app/installations call per venture), which spent the entire
// subrequest budget before a single pull request was read and left the refresh
// permanently incomplete. Steady state now costs one call per repository.
async function fetchAuthors(env) {
  const now = new Date();
  const cutoff = weekDates(now)[0]; // the Sunday the series opens
  const { gh, repos, left } = await repoList(env);
  const jobs = [];
  let budget = left;

  for (const [venture, sources] of Object.entries(SOURCES)) {
    for (const [full, meta] of reposFor(repos, sources)) {
      if (budget <= 1) return { data: summarize(jobs, now), complete: false };
      const cap = Math.min(MAX_PAGES, budget);
      let pages = 0;
      const job = { venture, private: !meta.public, pulls: [], truncated: false };
      job.pulls = await collectPages(async page => {
        budget--;
        pages++;
        const r = await gh(`/repos/${full}/pulls?state=closed&sort=updated&direction=desc&per_page=100&page=${page}`, meta.auth);
        if (!r.ok) {
          // Unreadable — a repository the installation token cannot see, say.
          // Skipped like activity.js does for 202/204/404: one repo must not
          // cost the whole refresh, or the stored copy never improves. The
          // status is logged; the name never is.
          console.log('authors pulls', r.status);
          return [];
        }
        return body(r, []);
      }, cutoff, cap);
      // A repository that filled every page we allowed may hold more merges
      // than we read, so this snapshot is not authoritative.
      job.truncated = truncated(job.pulls, pages, cap);
      jobs.push(job);
    }
  }

  return { data: summarize(jobs, now), complete: !jobs.some(j => j.truncated) };
}

// Every repository to count, with the token that can read it and whether it is
// public.
//
// Both halves are cached, because both are what burn the subrequest budget while
// the pull requests are the only thing that really changes:
//  - `authors:repos:v1`, per owner for 6 hours. Owners are enumerated
//    incrementally, one at a time, and each result is stored as it arrives, so a
//    cold cache fills over a few passes instead of demanding the whole fleet in
//    one invocation.
//  - `authors:tokens:v1`, for 50 minutes. An installation token lasts an hour, so
//    caching it a little under that is safe; caching it for six like the repo
//    list would silently stop reading private repositories.
async function repoList(env) {
  const kv = env.ACTIVITY;
  const stored = kv ? await kv.get(REPOS, { type: 'json', cacheTtl: 60 }) : null;
  const listed = stored && stored.data && Date.now() < stored.next ? stored.data : {};

  // One counter for the whole pass: tokens, owner enumeration and pull requests
  // all spend from it, so no combination of them can exceed the cap.
  let left = SUBREQUESTS;
  const gh = (path, auth) => (left--, fetchGh(env)(path, auth));
  const tokens = await tokenCache(env, kv, () => { left--; return left; });
  const repos = new Map();   // full name (lowercase) -> { auth, public, owner }
  const put = (full, public_, owner, auth) => repos.set(full, { public: public_, owner, auth });

  for (const owner of allOwners()) {
    if (Object.prototype.hasOwnProperty.call(listed, owner)) {
      for (const [full, public_] of listed[owner]) put(full, public_, owner, tokens.get(owner) || null);
      continue;
    }
    if (left <= 1) break; // a cold cache fills over several passes, never a 503
    const auth = tokens.get(owner);
    if (auth) {
      for (let page = 1; page <= MAX_PAGES && left > 1; page++) {
        const r = await gh(`/installation/repositories?per_page=100&page=${page}`, auth);
        if (!r.ok) break;
        const { repositories = [] } = await body(r, {});
        for (const repo of repositories) {
          if (repo.fork || repo.owner.login.toLowerCase() !== owner) continue;
          put(repo.full_name.toLowerCase(), !repo.private, owner, auth);
        }
        if (repositories.length < 100) break;
      }
    } else {
      // An owner without the app means every public, non-fork repository it has.
      const r = await gh(`/users/${owner}/repos?type=owner&per_page=100`);
      if (!r.ok) break;
      for (const repo of await body(r, [])) {
        if (repo.fork || repo.private) continue;
        put(repo.full_name.toLowerCase(), true, owner, null);
      }
    }
    listed[owner] = [...repos].filter(([, m]) => m.owner === owner).map(([f, m]) => [f, m.public]);
  }

  // Repositories linked from fz-data.js are public by the rule stated there, and
  // are counted even if their owner could not be enumerated this pass.
  for (const full of allLinked()) {
    const owner = full.split('/')[0].toLowerCase();
    if (!repos.has(full)) put(full, true, owner, tokens.get(owner) || null);
  }

  if (kv) {
    await kv.put(REPOS, JSON.stringify({ data: listed, next: Date.now() + REPO_AGE }));
  }
  return { gh, repos, left };
}

// Installation tokens, refetched just before the hour they expire. Without one no
// private repository can be read at all, so these are minted before the owner
// enumeration. They are bounded twice over: by TOKEN_BUDGET, so a fleet whose
// tokens would crowd out the pull requests still counts public repositories, and
// by the shared subrequest counter, so minting can never take the pass past the
// cap on its own.
async function tokenCache(env, kv, spend) {
  if (!env.GH_APP_ID || !env.GH_APP_PRIVATE_KEY) return new Map();
  const stored = kv ? await kv.get(TOKENS, { type: 'json', cacheTtl: 60 }) : null;
  if (stored && stored.data && Date.now() < stored.next) return new Map(Object.entries(stored.data));

  // spend() decrements the pass budget and returns what is left. Stop when there
  // is nothing left, or when the token allowance is used up.
  const { tokens } = await appTokens(env, allOwners(), spend, TOKEN_BUDGET);
  if (kv && tokens.size) {
    await kv.put(TOKENS, JSON.stringify({ data: Object.fromEntries(tokens), next: Date.now() + TOKEN_AGE }));
  }
  return tokens;
}

// The repositories belonging to one venture, from the endpoint-wide list.
function reposFor(all, sources) {
  const out = [];
  for (const owner of sources.owners) {
    for (const [full, m] of all) {
      if (m.owner === owner.toLowerCase()) out.push([full, m]);
    }
  }
  for (const full of sources.repos) {
    const m = all.get(full);
    if (m && !out.some(([f]) => f === full)) out.push([full, m]);
  }
  return out;
}

const allOwners = () => {
  const seen = new Set();
  for (const s of Object.values(SOURCES)) {
    s.owners.forEach(o => seen.add(o.toLowerCase()));
    s.repos.forEach(r => seen.add(r.split('/')[0].toLowerCase()));
  }
  return [...seen];
};
const allLinked = () => Object.values(SOURCES).flatMap(s => s.repos);

// GitHub REST, authenticated as `auth` (an installation token) or, failing that,
// GITHUB_TOKEN.
//
// A transport failure is turned into a not-ok response rather than being thrown.
// workerd's rejection message embeds the request URL, and that URL can hold a
// private repository name, which would then land in a log line. Callers already
// treat !ok as "skip and log the status", so this keeps that discipline on the
// throwing path too. activity.js awaits its fetches bare and has the same hole;
// it is left alone, but not inherited here.
function fetchGh(env) {
  return async (path, auth) => {
    try {
      return await fetch(`https://api.github.com${path}`, {
        method: 'GET',
        headers: {
          accept: 'application/vnd.github+json',
          'user-agent': 'factory0.ventures',
          'x-github-api-version': '2022-11-28',
          ...(auth || env.GITHUB_TOKEN ? { authorization: `Bearer ${auth || env.GITHUB_TOKEN}` } : {}),
        },
      });
    } catch {
      return { ok: false, status: 0 };
    }
  };
}

/* ---------- GitHub App: read-only access to private repositories ----------
   Optional, as in activity.js: with GH_APP_ID and GH_APP_PRIVATE_KEY (PKCS#8
   PEM) set, owners that installed the app are read through an installation
   token. /app/installations is global, so it is listed ONCE for the whole
   endpoint rather than once per venture. */

// Mint an installation token per installed owner.
//
// Every call spends from the pass budget via `spend`, exactly as a pulls call
// does, so the app cannot escape the subrequest cap. `maxCalls` is a second,
// tighter bound: tokens are worth having but not worth starving the pull
// requests, so a fleet bigger than this reads public repositories this pass and
// picks the rest up on a later one.
async function appTokens(env, owners, spend, maxCalls) {
  const tokens = new Map();
  if (!env.GH_APP_ID || !env.GH_APP_PRIVATE_KEY) return { tokens, calls: 0 };
  const wanted = new Set(owners.map(o => o.toLowerCase()));
  const jwt = await appJwt(env.GH_APP_ID, env.GH_APP_PRIVATE_KEY);
  let calls = 0;
  const call = async (path, method = 'GET') => {
    if (calls >= maxCalls || spend() <= 0) return { ok: false, status: 0 };
    calls++;
    try {
      return await fetch(`https://api.github.com${path}`, {
        method,
        headers: {
          accept: 'application/vnd.github+json',
          authorization: `Bearer ${jwt}`,
          'user-agent': 'factory0.ventures',
          'x-github-api-version': '2022-11-28',
        },
      });
    } catch {
      return { ok: false, status: 0 };
    }
  };

  const r = await call('/app/installations?per_page=100');
  if (!r.ok) throw new Error(`app installations: ${r.status}`);
  for (const inst of await body(r, [])) {
    const owner = inst.account.login.toLowerCase();
    if (!wanted.has(owner)) continue;
    const t = await call(`/app/installations/${inst.id}/access_tokens`, 'POST');
    if (!t.ok) continue; // this owner reads public repositories this pass
    tokens.set(owner, (await body(t, {})).token);
  }
  return { tokens, calls };
}

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