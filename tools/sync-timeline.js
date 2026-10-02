#!/usr/bin/env node
/* Rebuilds assets/timeline-data.json from the GitHub API, then reruns
 * tools/sync-ventures.js so the home-page timeline is redrawn from it.
 *
 *   node tools/sync-timeline.js                  window 2026-08-15 to today
 *   node tools/sync-timeline.js --since 2026-09-01 [--until 2026-10-02]
 *   node tools/sync-timeline.js --out /tmp/t.json  dry run: write elsewhere, no redraw
 *
 * Needs the GitHub CLI (`gh`), logged in as someone who can read the venture
 * orgs; private repositories count only if that login can see them. Only the
 * owners in the ventures' `github` links in assets/fz-data.js are queried.
 *
 * Per org it records the day the org was created and the human commits per
 * day: commits on every branch of every repository (forks skipped; a branch
 * is read until it only repeats commits already counted), deduplicated by
 * SHA, with authors whose login or email marks a bot left out, each dated by
 * its author date in WITA (UTC+8). Only counts are written, never
 * repository names, so nothing private can leak through this file.
 *
 * The committed file was first built from the same GitHub history plus local
 * clones, so a rebuild from the API alone can come out slightly lower on days
 * with commits that were never pushed.
 */
'use strict';
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const TZ_MS = 8 * 3600000; // WITA, UTC+8, no daylight saving
const wita = iso => new Date(Date.parse(iso) + TZ_MS).toISOString().slice(0, 10);

const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const since = arg('--since', '2026-08-15');
const until = arg('--until', wita(new Date().toISOString()));
const DEFAULT_OUT = path.join(ROOT, 'assets/timeline-data.json');
const OUT = path.resolve(arg('--out', DEFAULT_OUT)); // another path: write there and stop, for a dry run
// the window's edges in UTC, so commits are bucketed by the WITA day
const sinceUtc = new Date(Date.parse(since + 'T00:00:00Z') - TZ_MS).toISOString();
const untilUtc = new Date(Date.parse(until + 'T00:00:00Z') + 86400000 - TZ_MS).toISOString();

function gh(route, paginate) {
  const args = ['api', '-H', 'Accept: application/vnd.github+json', route];
  if (paginate) args.splice(1, 0, '--paginate', '--slurp');
  try {
    const out = execFileSync('gh', args, { encoding: 'utf8', maxBuffer: 256 << 20, stdio: ['ignore', 'pipe', 'pipe'] });
    const j = JSON.parse(out);
    return paginate ? j.flat() : j;
  } catch (e) {
    const msg = String(e.stderr || e.message);
    // an empty repository answers 409; treat as no commits
    if (/HTTP 409/.test(msg)) return [];
    throw new Error(`gh api ${route}: ${msg.trim().split('\n').pop()}`);
  }
}

global.window = {};
require(path.join(ROOT, 'assets/fz-data.js'));
const owners = new Map();
for (const v of global.window.FZ_DATA.ventures) {
  for (const [, u] of v.github || []) {
    const o = new URL(u).pathname.split('/')[1];
    owners.set(o.toLowerCase(), o);
  }
}

// Every branch, newest commits first. The default branch is read in full;
// another branch mostly repeats it, so its pages stop at the first page whose
// commits were all seen already. That keeps a repository with dozens of
// long-lived branches to a few calls per branch.
function repoCommits(full, defaultBranch, add, seen) {
  const branches = gh(`repos/${full}/branches?per_page=100`, true).map(b => b.name)
    .sort((a, b) => (b === defaultBranch) - (a === defaultBranch));
  for (const br of branches) {
    for (let page = 1; ; page++) {
      const q = `since=${sinceUtc}&until=${untilUtc}&sha=${encodeURIComponent(br)}&per_page=100&page=${page}`;
      const list = gh(`repos/${full}/commits?${q}`);
      let fresh = 0;
      for (const c of list) if (!seen.has(c.sha)) { fresh++; add(c); }
      if (list.length < 100 || (br !== defaultBranch && fresh === 0)) break;
    }
  }
}

const isBot = c => {
  const login = (c.author && c.author.login) || '';
  const email = (c.commit && c.commit.author && c.commit.author.email) || '';
  return (c.author && c.author.type === 'Bot') || /\[bot\]$/i.test(login) || /\[bot\]@/i.test(email);
};

const data = { start: since, end: until, tz: 'Asia/Makassar', orgs: {} };
for (const [key, name] of owners) {
  const acct = gh(`users/${name}`);
  const isOrg = acct.type === 'Organization';
  const repos = gh(isOrg ? `orgs/${name}/repos?type=all&per_page=100` : `users/${name}/repos?type=owner&per_page=100`, true)
    .filter(r => !r.fork && r.size > 0);
  const seen = new Set(), days = {};
  for (const r of repos) {
    repoCommits(r.full_name, r.default_branch, c => {
      seen.add(c.sha);
      if (isBot(c)) return;
      const d = wita(c.commit.author.date);
      if (d < since || d > until) return;
      days[d] = (days[d] || 0) + 1;
    }, seen);
  }
  const sorted = {};
  Object.keys(days).sort().forEach(d => { sorted[d] = days[d]; });
  data.orgs[key] = {
    org: acct.login, created: wita(acct.created_at),
    total: Object.values(days).reduce((a, b) => a + b, 0), days: sorted
  };
  console.log(`${acct.login}: created ${data.orgs[key].created}, ${repos.length} repositories, ${data.orgs[key].total} commits`);
}

fs.writeFileSync(OUT, JSON.stringify(data, null, 1) + '\n');
console.log(`wrote ${path.relative(ROOT, OUT)} (${since} to ${until})`);
if (OUT === DEFAULT_OUT) execFileSync(process.execPath, [path.join(__dirname, 'sync-ventures.js')], { stdio: 'inherit' });
