#!/usr/bin/env node
/* Checks the pure logic behind GET /api/authors against fixture pull requests:
 * classification, the 12 Sunday week buckets, the window, pagination, and the
 * promise that no repository name — private least of all — reaches the payload.
 *
 *   node tools/test-authors.mjs
 */
import { readFileSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { generateKeyPairSync } from 'node:crypto';
import { WEEKS, SUBREQUESTS, weekStart, weekDates, classify, collectPages, truncated, summarize, payload } from '../functions/api/_authors-core.js';

const NOW = new Date('2026-10-08T12:00:00.000Z'); // a Thursday
const FIRST = '2026-07-19';                        // the Sunday the window opens
const PRIVATE = ['acme-org/secret-hushhush', 'acme-org/secret-hushhush-api'];
// A throwaway key: appJwt really signs with it, so the token path is exercised
// rather than stubbed out.
const TEST_KEY = generateKeyPairSync('rsa', {
  modulusLength: 2048,
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
  publicKeyEncoding: { type: 'spki', format: 'pem' },
}).privateKey;

let checks = 0;
const eq = (what, got, want) => {
  checks++;
  const g = JSON.stringify(got), w = JSON.stringify(want);
  if (g !== w) throw new Error(`${what}: got ${g}, want ${w}`);
};
const ok = (what, cond) => eq(what, !!cond, true);

// A pull request as the REST API returns it. `at` is when it merged; `touched`
// is when it was last updated, which is what the pulls list sorts on.
const pr = (at, ref, type = 'User', number = 1, touched = at) => ({
  number, state: 'closed', merged_at: at, updated_at: touched,
  user: { type, login: 'someone' }, head: { ref },
});

const API = new URL('../functions/api/authors.js', import.meta.url);
const CORE = new URL('../functions/api/_authors-core.js', import.meta.url);

// Load authors.js with only its JSON import inlined, so the endpoint under test
// is the real file rather than a copy that could drift from it.
async function loadAuthors() {
  const src = readFileSync(API, 'utf8')
    .replace(/^import SOURCES from .*$/m,
      `const SOURCES = ${JSON.stringify(JSON.parse(readFileSync(new URL('activity-sources.json', API), 'utf8')))};`)
    .replace(/^import \{ ([^}]*) \} from '\.\/_authors-core\.js';$/m,
      `import { $1 } from '${CORE.href}';`);
  const tmp = join(tmpdir(), `authors-under-test-${process.pid}.mjs`);
  writeFileSync(tmp, src);
  try {
    return await import(pathToFileURL(tmp).href);
  } finally {
    rmSync(tmp, { force: true });
  }
}

eq('WEEKS', WEEKS, 12);
eq('weekStart of a Thursday', weekStart(NOW), '2026-10-04');
eq('weekStart of a Sunday stays put', weekStart(new Date('2026-10-04T00:00:00Z')), '2026-10-04');
eq('weekDates', weekDates(NOW).length, 12);
eq('weekDates open on a Sunday', weekDates(NOW)[0], FIRST);
eq('weekDates end on this week', weekDates(NOW)[11], '2026-10-04');

/* ---------- classification: a bot is a bot, whatever its branch is called --- */
eq('colonizer issue branch', classify(pr(null, 'colonizer/issue-582-32dc3bab')), 'colonizer');
eq('colonizer session branch', classify(pr(null, 'colonizer/session-9f2c1a4e')), 'colonizer');
eq('main', classify(pr(null, 'main')), 'people');
eq('feature branch', classify(pr(null, 'feature-x')), 'people');
eq('dependabot', classify(pr(null, 'dependabot/npm_and_yarn/lodash-4.17.21', 'Bot')), 'bots');
eq('a bot on a colonizer/ branch is still a bot', classify(pr(null, 'colonizer/renovate', 'Bot')), 'bots');
eq('a PR with no head', classify({}), 'people');

/* ---------- pagination: stop on a short page, and on a page past the cutoff --- */
const full = Array.from({ length: 100 }, (_, i) => pr(`2026-10-0${1 + (i % 8)}T00:00:00Z`, 'colonizer/x'));
const older = Array.from({ length: 100 }, () => pr('2026-06-01T00:00:00Z', 'main'));
const seen = [];
const twoPages = await collectPages(async page => { seen.push(page); return page === 1 ? full : [pr('2026-10-01T00:00:00Z', 'main')]; }, FIRST);
eq('a full page is followed by the next one', seen.length, 2);
eq('both pages are collected', twoPages.length, 101);

seen.length = 0;
await collectPages(async page => { seen.push(page); return older; }, FIRST);
eq('a full page older than the cutoff ends the walk', seen.length, 1);

seen.length = 0;
await collectPages(async page => { seen.push(page); return page < 9 ? full : []; }, FIRST, 8);
eq('the page cap holds', seen.length, 8);

/* ---------- totals and weeks are one set, keyed on merged_at alone ----------
   A PR merged inside the window but touched long afterwards survives the
   pagination cutoff and must land in both. One merged outside the window must
   land in neither. Before this was pinned, the totals counted a PR that the
   bars did not, and the headline disagreed with the chart. */
const touch = summarize([{ venture: 'FZ-001', private: false, pulls: [
  pr('2026-10-06T09:00:00Z', 'colonizer/issue-1', 'User', 1, '2026-12-31T00:00:00Z'), // in window, touched far later
  pr('2026-10-05T09:00:00Z', 'main', 'User', 2, '2026-11-30T00:00:00Z'),               // in window, touched later
  pr('2026-07-18T23:59:59Z', 'colonizer/merged-before', 'User', 3, '2026-10-08T00:00:00Z'), // out of window, touched recently
  pr('2026-10-11T00:00:00Z', 'colonizer/merged-after', 'User', 4, '2026-10-11T00:00:00Z'),   // past the newest week
] }], NOW);
const touchOut = payload(touch);
eq('a merge inside the window counts however late it was touched',
  touchOut.weeks[11], { week: '2026-10-04', colonizer: 1, people: 1, bots: 0 });
eq('and appears in the totals too',
  touchOut.totals, { colonizer: 1, people: 1, bots: 0, prs: 2, colonizerShare: 0.5 });
eq('a merge outside the window appears in neither',
  touchOut.totals.prs - touchOut.weeks.reduce((a, w) => a + w.colonizer + w.people + w.bots, 0), 0);

// The invariant the chart depends on: for a public-only payload, the series and
// the totals are the same set of merges, so the bars sum to the headline. This
// is the assertion that fails if totals and weeks ever diverge again — a merge
// dated past the newest week used to land in the totals but in no bucket.
const series = touchOut.weeks.reduce((a, w) => a + w.colonizer + w.people + w.bots, 0);
eq('public weeks sum to public totals', series, touchOut.totals.prs);

/* ---------- the payload ---------- */
const entries = [
  { venture: 'FZ-001', private: false, pulls: [
    pr('2026-10-06T09:00:00Z', 'colonizer/issue-582-32dc3bab'),   // this week
    pr('2026-10-06T10:00:00Z', 'colonizer/session-9f2c1a4e'),     // this week
    pr('2026-10-07T11:00:00Z', 'dependabot/npm_and_yarn/x-1.0.0', 'Bot'),
    pr('2026-10-03T23:59:00Z', 'main'),                           // a Saturday, so the week before
    pr('2026-09-27T00:00:00Z', 'feature-x'),                      // the Sunday opens its own week
    pr('2026-09-26T23:59:59Z', 'feature-y'),                      // a second earlier
    pr('2026-10-06T12:00:00Z', 'main', 'User', 2),
    pr(null, 'colonizer/never-merged'),                           // closed, not merged
    pr('2026-07-18T23:59:59Z', 'colonizer/too-old'),              // one second before the window
  ] },
  { venture: 'FZ-002', private: false, pulls: [pr('2026-10-07T12:00:00Z', 'colonizer/issue-9-abc')] },
  { venture: 'FZ-002', private: true, pulls: [
    pr('2026-10-07T13:00:00Z', 'colonizer/secret-branch'),
    pr('2026-10-05T13:00:00Z', 'main', 'User', 7),
    pr('2026-10-05T14:00:00Z', 'dependabot/npm_and_yarn/y-2.0.0', 'Bot'),
  ] },
];

const all = payload(summarize(entries, NOW));
eq('12 week buckets', all.weeks.length, 12);
eq('oldest first', all.weeks[0].week, FIRST);
eq('newest is this week', all.weeks[11].week, '2026-10-04');
ok('every bucket is a Sunday', all.weeks.every(w => new Date(w.week).getUTCDay() === 0));
eq('this week', all.weeks[11], { week: '2026-10-04', colonizer: 3, people: 1, bots: 1 });
eq('a Saturday lands in the week before the Sunday', all.weeks[10], { week: '2026-09-27', colonizer: 0, people: 2, bots: 0 });
eq('and the Sunday opens its own week', all.weeks[9], { week: '2026-09-20', colonizer: 0, people: 1, bots: 0 });
eq('an empty week', all.weeks[0], { week: FIRST, colonizer: 0, people: 0, bots: 0 });
eq('public total', all.totals, { colonizer: 4, people: 5, bots: 2, prs: 11, colonizerShare: 0.44 });
eq('ventures', all.ventures, {
  'FZ-001': { colonizer: 2, people: 4, bots: 1, prs: 7 },
  'FZ-002': { colonizer: 2, people: 1, bots: 1, prs: 4 },
});
eq('updated', all.updated, NOW.toISOString());
eq('the exact response keys', Object.keys(all), ['updated', 'weeks', 'totals', 'ventures']);
eq('the exact week keys', Object.keys(all.weeks[0]), ['week', 'colonizer', 'people', 'bots']);

// Private repositories count in the totals and in their venture, nowhere else.
// So the series is public-only and does NOT sum to the totals: the gap is
// exactly the private pulls, which the coordinator confirmed is intended.
ok('private totals beat the public series', all.totals.colonizer > all.weeks.reduce((a, w) => a + w.colonizer, 0));
eq('the series counts public pull requests only', all.weeks.reduce((a, w) => a + w.colonizer + w.people + w.bots, 0), 8);
eq('the gap between series and totals is exactly the private pulls',
  all.totals.prs - all.weeks.reduce((a, w) => a + w.colonizer + w.people + w.bots, 0), 3);
eq('an empty window', payload(summarize([], NOW)).totals.colonizerShare, 0);

/* ---------- ?id=FZ-002: one venture, private repositories included ---------- */
const one = payload(summarize(entries, NOW), 'FZ-002');
eq('one venture in the payload', Object.keys(one.ventures), ['FZ-002']);
eq('its weekly series is public only', one.weeks[11], { week: '2026-10-04', colonizer: 1, people: 0, bots: 0 });
eq('its totals include the private repository', one.totals, { colonizer: 2, people: 1, bots: 1, prs: 4, colonizerShare: 0.67 });
eq('an unknown venture is empty', payload(summarize(entries, NOW), 'FZ-999').ventures, {});

/* ---------- the subrequest budget must cover a full pass ----------
   Workers allow 50 subrequests per invocation on the free plan. Tokens, owner
   enumeration and pull requests all spend from one counter of SUBREQUESTS, so a
   pass cannot exceed the cap however the fleet grows; owners are enumerated one
   at a time and cached, so a cold cache fills over several passes rather than
   demanding the whole fleet at once. Enumerating per venture instead cost more
   than the cap and left the refresh permanently incomplete. */
const SOURCES = JSON.parse(readFileSync(new URL('../functions/api/activity-sources.json', import.meta.url), 'utf8'));
const owners = new Set();
for (const s of Object.values(SOURCES)) {
  s.owners.forEach(o => owners.add(o.toLowerCase()));
  s.repos.forEach(r => owners.add(r.split('/')[0].toLowerCase()));
}
const repos = new Set(Object.values(SOURCES).flatMap(s => s.repos.map(r => r.toLowerCase())));
eq('the shared counter is inside the free-plan cap', SUBREQUESTS <= 50, true);
eq('and leaves headroom for workerd itself', SUBREQUESTS, 48);
// A cold pass with the app installed would want one token and one enumeration
// per owner plus a page per repository. That is more than one invocation allows,
// which is why the repository list and the tokens are cached separately rather
// than rebuilt per venture: the guarantee is not that it fits, but that the
// counter stops it degrading forever and the next pass continues.
const coldWant = 1 + owners.size * 2 + repos.size;
ok('a cold enumeration-plus-pull pass cannot fit in one invocation, so it must cache',
  coldWant > SUBREQUESTS);
console.log(`ok: budget — ${owners.size} owners, ${repos.size} repos: a cold pass wants ${coldWant} of ${SUBREQUESTS}, so enumeration is cached`);

/* ---------- truncation must not pass as authoritative ---------- */
const fiveFull = Array.from({ length: 500 }, (_, i) => pr(`2026-10-0${1 + (i % 8)}T00:00:00Z`, 'colonizer/x'));
eq('a repository that filled every page we allowed is truncated', truncated(fiveFull, 5, 5), true);
eq('one full page under a five-page cap is not', truncated(full, 1, 5), false);
eq('a repository that ended early is not', truncated(twoPages, 2, 5), false);
eq('a short read within the cap is not truncated', truncated([1, 2, 3], 1, 5), false);
eq('the cap itself does not count as truncation', truncated(fiveFull, 3, 5), false);

/* ---------- the wiring in authors.js, not just the pure logic ----------
   The pure tests above cannot see a bug in how authors.js is wired together: an
   inverted comparison in the token guard left every installation token unminted,
   so no private repository was ever read, and every test here still passed. So
   this drives the real endpoint against a stubbed GitHub. Node cannot import the
   module directly (its JSON import needs an attribute), so it is loaded from
   source with that one import inlined and nothing else changed. */
const api = await loadAuthors();
await wiring(api);

// Drive the real endpoint with a stubbed GitHub and the App configured.
async function wiring({ onRequestGet }) {
  const counts = { installs: 0, tokens: 0, installationRepos: 0, pulls: 0, appAuthPulls: 0, privatePulls: 0 };
  const seenAuth = [];
  const owners = Object.values(SOURCES).map(s => s.owners[0]);

  globalThis.fetch = async url => {
    const u = String(url);
    const auth = (globalThis.__hdr || {}).authorization || '';
    if (u.includes('/app/installations')) {
      if (u.includes('access_tokens')) {
        counts.tokens++;
        return new Response(JSON.stringify({ token: `tok-${counts.tokens}` }), { status: 200 });
      }
      counts.installs++;
      return new Response(JSON.stringify(owners.map((o, i) => ({ id: i + 1, account: { login: o } }))), { status: 200 });
    }
    if (u.includes('/installation/repositories')) {
      counts.installationRepos++;
      // The URL names no owner: the installation token identifies it, as it does
      // on GitHub. Map our minted token back to the owner it stands for.
      const owner = owners[Number((auth.match(/tok-(\d+)/) || [])[1]) - 1];
      return new Response(JSON.stringify({ repositories: [
        { fork: false, private: true, full_name: `${owner}/secret-hushhush`, owner: { login: owner } },
      ] }), { status: 200 });
    }
    if (u.includes('/users/')) {
      const owner = u.match(/users\/([^/]+)\//)[1];
      return new Response(JSON.stringify([{ fork: false, private: false, full_name: `${owner}/public-repo`, owner: { login: owner } }]), { status: 200 });
    }
    if (u.includes('/pulls?')) {
      counts.pulls++;
      seenAuth.push(auth);
      const priv = u.includes('secret-hushhush');
      if (priv) {
        counts.privatePulls++;
        if (auth.startsWith('Bearer tok-')) counts.appAuthPulls++;
      }
      return new Response(JSON.stringify([pr('2026-10-06T09:00:00Z', priv ? 'colonizer/private-merge' : 'main')]), { status: 200 });
    }
    return new Response('[]', { status: 200 });
  };

  // Record the Authorization header of every pulls call.
  const realFetch = globalThis.fetch;
  globalThis.fetch = async (url, init) => {
    globalThis.__hdr = (init && init.headers) || {};
    return realFetch(url, init);
  };

  const kv = new Map();
  const KEY = 'authors:v1'; // the snapshot key, to invalidate it per pass
  const env = {
    GH_APP_ID: '1',
    GH_APP_PRIVATE_KEY: TEST_KEY,
    ACTIVITY: { get: async k => kv.get(k) ? JSON.parse(kv.get(k)) : null, put: async (k, v) => kv.set(k, v) },
  };
  const wait = [];
  const res = await onRequestGet({ request: new Request('https://x/api/authors'), env, waitUntil: p => wait.push(p) });
  await Promise.all(wait);
  const out = await res.json();
  const total = counts.installs + counts.tokens + counts.installationRepos + counts.pulls;
  console.log(`ok: wiring — app installed, ${owners.length} owners: ${total} subrequests (cap 50), ${counts.tokens} installation tokens minted, ${counts.privatePulls} private repos read, ${counts.appAuthPulls} of them authenticated`);

  eq('the pass succeeds', res.status, 200);
  eq('a full pass stays under the subrequest cap', total < 50, true);
  eq('the installation list is read once, not per venture', counts.installs, 1);
  // The regression that shipped a dead private-repo feature: an inverted guard
  // here left every token unminted, and everything still returned a plausible 200.
  ok('installation tokens are actually minted', counts.tokens > 0);
  eq('one token per installed owner', counts.tokens, owners.length);
  ok('private repositories are actually read', counts.privatePulls > 0);
  eq('every private read is authenticated with an installation token', counts.appAuthPulls, counts.privatePulls);
  ok('the private merges reach the totals', out.totals.prs > 0);
  eq('12 week buckets', out.weeks.length, 12);
  ok('private merges stay out of the series',
    out.weeks.reduce((a, w) => a + w.colonizer + w.people + w.bots, 0) < out.totals.prs);

  // A private repository must never appear in what the endpoint hands back.
  ok('no private name in the response', !JSON.stringify(out).includes('secret-hushhush'));

  // A second pass, with only the snapshot cache invalidated (the token cache is
  // still warm, as it is for 50 minutes in production): the enumeration is cached
  // too, so this pass reaches far more repositories and must read them all with
  // an installation token.
  for (const k of Object.keys(counts)) counts[k] = 0;
  const cur = kv.get(KEY);
  if (cur) kv.set(KEY, JSON.stringify({ data: JSON.parse(cur).data, next: 0 }));
  const wait2 = [];
  const res2 = await onRequestGet({ request: new Request('https://x/api/authors'), env, waitUntil: p => wait2.push(p) });
  await Promise.all(wait2);
  const out2 = await res2.json();
  console.log(`ok: wiring — warm pass: ${counts.privatePulls} private repos read, ${counts.appAuthPulls} authenticated, ${counts.pulls} pulls total`);
  eq('the warm pass succeeds', res2.status, 200);
  ok('the warm pass reads many private repositories', counts.privatePulls > 5);
  eq('every one of them authenticated with an installation token', counts.appAuthPulls, counts.privatePulls);

  // One unparseable body must cost that repository and nothing else.
  //
  // The snapshot key is CLEARED rather than merely expired: on the stale path
  // the endpoint returns the previous copy and refreshes in the background, so
  // the response is 200 whatever the refresh does and the assertion below would
  // be true for any code at all. Only a cold cache puts the parse on the path
  // that can turn into a 503, which is the failure being pinned here.
  kv.delete(KEY);
  const stub = globalThis.fetch;
  globalThis.fetch = async (url, init) => {
    if (String(url).includes('/pulls?') && String(url).includes('secret-hushhush'))
      return new Response('acme-org/s', { status: 200 }); // truncated, not JSON
    return stub(url, init);
  };
  const said = [];
  const log = console.log;
  console.log = (...a) => said.push(a.join(' '));
  let res3, thrown = null;
  try {
    res3 = await onRequestGet({ request: new Request('https://x/api/authors'), env, waitUntil: () => {} });
  } catch (e) { thrown = e; } finally { console.log = log; globalThis.fetch = stub; }
  ok('an unparseable body does not throw out of the endpoint', !thrown, String(thrown && thrown.message));
  eq('a truncated body does not fail the pass', res3.status, 200);
  const out3 = await res3.json();
  // A second cold pass with nothing truncated, so there is something to compare
  // against: out2 is a STALE response, so it is not the control.
  kv.delete(KEY);
  const res4 = await onRequestGet({ request: new Request('https://x/api/authors'), env, waitUntil: () => {} });
  const out4 = await res4.json();
  console.log(`ok: wiring — unparseable bodies cost those repos only: ${res3.status}, ${out3.totals.prs} merges vs ${out4.totals.prs} with every body parseable`);
  eq('a truncated body does not fail the pass', res3.status, 200);
  eq('the whole snapshot is still rebuilt', out3.weeks.length, 12);
  // The stub truncates both private repositories, so what is lost is exactly their
  // merges — and because private repositories never reach the weekly series,
  // that loss is invisible in `weeks` and shows up in `totals` alone. This is the
  // totals/weeks split, pinned through the endpoint rather than through summarize.
  eq('the public weekly series is untouched', JSON.stringify(out3.weeks), JSON.stringify(out4.weeks));
  const lost = out4.totals.prs - out3.totals.prs;
  ok('only the truncated repositories are lost from the totals', lost > 0 && out3.totals.colonizer < out4.totals.colonizer,
    `lost ${lost} merges, colonizer ${out3.totals.colonizer} of ${out4.totals.colonizer}`);
  const noise = said.join(' | ');
  ok('no fragment of a private name reaches the log', !noise.includes('acme-org'), noise);
}

/* ---------- no repository name, private least of all, in the response ---------- */
const named = JSON.stringify(all).concat(JSON.stringify(one), JSON.stringify(all.weeks));
for (const repo of PRIVATE) ok(`no trace of ${repo}`, !named.includes(repo));
for (const field of ['full_name', 'base', 'url', 'repo', 'html_url', 'private'])
  ok(`the payload has no ${field}`, !named.includes(`"${field}"`));

console.log(`ok: ${checks} checks passed (classification, 12 Sunday weeks, window, pagination, truncation, private names absent, app wiring and subrequest budget)`);