/* Pure logic behind GET /api/authors: how a merged pull request is counted, and
 * how the counts become the 12-week series. No bindings, no fetch, so
 * tools/test-authors.mjs can drive it with fixture pull requests. */

export const WEEKS = 12;      // weeks in the series the chart draws
export const MAX_PAGES = 5;   // pull request pages per repository
export const SUBREQUESTS = 48; // Workers allow 50 subrequests per invocation on the free plan
const PAGE = 100;
const KINDS = ['colonizer', 'people', 'bots'];
const KEYS = [...KINDS, 'prs'];
const zero = () => Object.fromEntries(KEYS.map(k => [k, 0]));

// Sunday 00:00 UTC of the week holding `d`, as YYYY-MM-DD, like activity.js.
export function weekStart(d) {
  const s = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  s.setUTCDate(s.getUTCDate() - s.getUTCDay());
  return s.toISOString().slice(0, 10);
}

// The 12 Sunday dates ending with the week `now` falls in, oldest first.
export function weekDates(now = new Date()) {
  const start = weekStart(now);
  return Array.from({ length: WEEKS }, (_, i) => {
    const d = new Date(start);
    d.setUTCDate(d.getUTCDate() - 7 * (WEEKS - 1 - i));
    return d.toISOString().slice(0, 10);
  });
}

// A bot is a bot even on a colonizer/ branch, so Dependabot never reads as us.
export function classify(pr) {
  if ((pr.user || {}).type === 'Bot') return 'bots';
  return String((pr.head && pr.head.ref) || '').startsWith('colonizer/') ? 'colonizer' : 'people';
}

// The closed pull requests of one repository, newest first, stopping as soon as
// the page cannot hold anything inside the window: a short page, or a whole page
// already older than `cutoff`. Pages are taken one at a time, so nothing past
// the cutoff is ever asked for. `cutoff` is only a stop condition — what an item
// that did come back counts towards is decided in summarize, by `merged_at`.
export async function collectPages(getPage, cutoff, maxPages = MAX_PAGES) {
  const out = [];
  for (let page = 1; page <= maxPages; page++) {
    const items = (await getPage(page)) || [];
    for (const it of items) out.push(it);
    if (items.length < PAGE) break;
    if (items.every(it => String(it.updated_at || '') < cutoff)) break;
  }
  return out;
}

// Did we stop because the pages ran out, rather than because we ran past the
// window? A repository that filled every page we allowed may hold more merges
// than we read, and quietly storing that as authoritative would understate a
// busy repository for ever.
export function truncated(pulls, pages, cap) {
  return pages >= cap && pulls.length >= cap * PAGE;
}

const blank = week => ({ week, ...Object.fromEntries(KINDS.map(k => [k, 0])) });

// Count `entries` ({ venture, private, pulls }) into the stored shape: one record
// per venture, each with its own public weekly series, so a request for a single
// venture is answered from the same cached copy.
//
// Membership is decided once, by the week of `merged_at` landing in the window:
// the totals and the series are built from that one collection, so the bars and
// the headline can never disagree. `updated_at` is not consulted here at all —
// it only tells collectPages when to stop paging, and an item already in hand is
// classified purely by when it merged, so a merge later touched still counts.
export function summarize(entries, now = new Date()) {
  const dates = weekDates(now);
  const index = new Map(dates.map((w, i) => [w, i]));
  const ventures = {};
  const venture = id =>
    ventures[id] || (ventures[id] = { ...zero(), weeks: dates.map(week => blank(week)) });

  for (const e of entries || []) {
    const v = venture(e.venture);
    for (const pr of e.pulls || []) {
      if (!pr.merged_at) continue;
      const i = index.get(weekStart(new Date(pr.merged_at)));
      if (i === undefined) continue; // merged before or after the window: in neither
      const kind = classify(pr);
      v[kind]++;
      v.prs++;
      // Private by design: it adds to `totals` and to its venture, but never to
      // the per-week series the chart draws. So `weeks` is public-only and
      // deliberately does NOT sum to `totals` — the gap is the private repos.
      if (e.private) continue;
      v.weeks[i][kind]++;
    }
  }
  return { updated: now.toISOString(), ventures };
}

// The response body: one venture, or every venture summed.
export function payload(data, id) {
  const weeks = new Map();
  const totals = { ...zero(), colonizerShare: 0 };
  const ventures = {};
  for (const v of id ? [id] : Object.keys(data.ventures)) {
    const rec = data.ventures[v];
    if (!rec) continue;
    for (const w of rec.weeks) {
      const row = weeks.get(w.week) || weeks.set(w.week, blank(w.week)).get(w.week);
      for (const k of KINDS) row[k] += w[k];
    }
    for (const k of KEYS) totals[k] += rec[k];
    ventures[v] = Object.fromEntries(KEYS.map(k => [k, rec[k]]));
  }
  const human = totals.colonizer + totals.people;
  totals.colonizerShare = human ? Math.round(totals.colonizer / human * 100) / 100 : 0;
  return { updated: data.updated, weeks: [...weeks.values()].sort((a, b) => (a.week < b.week ? -1 : 1)), totals, ventures };
}