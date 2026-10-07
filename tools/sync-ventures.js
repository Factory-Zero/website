#!/usr/bin/env node
/* Regenerates the static venture markup in ventures/index.html and
 * system/index.html from assets/fz-data.js, so that file stays the single
 * source of truth while the served HTML remains fully static and indexable.
 *
 *   node tools/sync-ventures.js
 *
 * Rewrites only the regions between the fz:*:start / fz:*:end comments.
 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
global.window = {};
require(path.join(ROOT, 'assets/fz-data.js'));
const V = global.window.FZ_DATA.ventures;
const SERVICES = global.window.FZ_DATA.services || {};
const ROLES = global.window.FZ_DATA.roles || {};

const STATUS_COLOR = {
  LIVE: '#EDEBE6', SCALING: '#FF5A36', BUILDING: '#A9A8A5',
  RESEARCHING: '#8A8A8E', UNANNOUNCED: '#8A8A8E', ARCHIVED: '#4A4A4E', ACQUIRED: '#EDEBE6'
};
const esc = s => String(s == null ? '' : s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;')
  .replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const pulses = s => s === 'LIVE' || s === 'SCALING';

// Autonomy levels, same order as LEVELS in assets/fz-app.js.
const LEVELS = ['HUMAN-OPERATED', 'AI-ASSISTED', 'AGENT WORKFLOWS', 'AGENT-OPERATED', 'SELF-OPTIMIZING', 'AUTONOMOUS COMPANY'];
const targetShort = v => v.target == null ? 'NOT SET' : `L${v.target}`;
const targetLong = v => v.target == null ? 'NOT SET' : `LEVEL ${v.target} &middot; ${LEVELS[v.target]}`;
const aims = v => v.aims || {};
// URL segment for a venture's own page, /ventures/<slug>/. Same rule as slug() in assets/fz-app.js.
const slug = v => v.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const SITE = 'https://factory0.ventures';
const gh = v => v.github || [];
const pitch = v => v.pitch || {};

// `uses`: what a venture is built with. A sister venture resolves by id to its
// own record, a third party by key to SERVICES. Anything unknown stops the run,
// so a typo can never publish a wrong claim.
const BY_ID = new Map(V.map(v => [v.id, v]));
const STATUSES = new Set(['live', 'planned']);
function uses(v) {
  return (v.uses || []).map(u => {
    const sister = BY_ID.get(u.id), svc = SERVICES[u.id], role = ROLES[u.role];
    if (!sister && !svc) throw new Error(`${v.id}: uses unknown product or service "${u.id}"`);
    if (sister === v) throw new Error(`${v.id}: lists itself in uses`);
    if (!role) throw new Error(`${v.id}: unknown role "${u.role}" for ${u.id}`);
    if (!STATUSES.has(u.status)) throw new Error(`${v.id}: status for ${u.id} must be live or planned, not "${u.status}"`);
    return {
      id: u.id,
      name: sister ? sister.name : svc.name,
      kind: sister ? 'factory-zero' : 'third-party',
      url: sister ? (sister.site ? `https://${sister.site}/` : `${SITE}/ventures/${slug(sister)}/`) : svc.url,
      page: sister ? `/ventures/${slug(sister)}/` : null,
      role: u.role, label: role.label, phrase: role.phrase,
      status: u.status, note: u.note || ''
    };
  });
}
// The Factory Zero stack: the ventures other ventures are built on. `stack` is
// authored in the registry; it must cover every venture that appears in another
// venture's `uses`, so the label cannot drift from the links.
for (const v of V) {
  if (typeof v.stack !== 'boolean') throw new Error(`${v.id}: stack must be true or false`);
  if (v.stack && !v.stackRole) throw new Error(`${v.id}: a stack venture needs a stackRole`);
  if (v.stack && typeof v.open_source !== 'boolean') throw new Error(`${v.id}: a stack venture needs open_source true or false`);
  if (v.open_source && !v.license) throw new Error(`${v.id}: open_source needs the licence`);
  for (const u of v.uses || []) {
    const p = BY_ID.get(u.id);
    if (p && !p.stack) throw new Error(`${p.id} (${p.name}) is used by ${v.id} but is not marked stack: true`);
  }
}
const STACK_COUNT = V.filter(v => v.stack).length;
const fzs = v => v.stack ? `<span class="fzs">FZ STACK</span><span class="fzs-role">${esc(v.stackRole)}</span>${v.open_source ? `<span class="fzs-os" title="${esc(v.license)} licence">OPEN SOURCE</span>` : ''}` : '';
const INFO_BTN = '<button type="button" class="fzs-i" aria-label="What is FZ STACK?" aria-haspopup="dialog" aria-expanded="false">i</button>';
// The rendered list, shared by the static page and (through data-uses) fz-ventures.js.
const useItem = u => `<li class="use"><span class="use-role">${esc(u.label)}</span><a class="use-name" href="${esc(u.page || u.url)}"${u.page ? '' : ' rel="noopener"'}>${esc(u.name)}</a><span class="use-tag use-tag--${u.status}">${u.status.toUpperCase()}</span>${u.note ? `<span class="use-note">${esc(u.note)}</span>` : ''}</li>`;
const useList = v => uses(v).length ? `<ul class="uses">${uses(v).map(useItem).join('')}</ul>` : '<span>NOT RECORDED</span>';

function row(v, i) {
  const c = STATUS_COLOR[v.status] || '#8A8A8E';
  const mark = v.logo
    ? `<img class="venture-logo" src="/assets/${esc(v.logo)}" alt="" width="30" height="${Math.round(30 * (v.logoH || 1) / (v.logoW || 1))}">`
    : '';
  return `      <button type="button" class="record registry-cols" aria-pressed="${i === 0}" aria-controls="d-record"
        data-id="${esc(v.id)}" data-stack="${v.stack ? 1 : 0}" data-stack-role="${esc(v.stackRole || '')}" data-license="${esc(v.open_source ? v.license : '')}" data-slug="${slug(v)}" data-name="${esc(v.name)}" data-status="${esc(v.status)}" data-status-color="${c}"
        data-category="${esc(v.category)}" data-autonomy="${v.autonomy == null ? '' : v.autonomy}"
        data-target="${v.target == null ? '' : v.target}" data-aim-operate="${esc(aims(v).operate)}"
        data-aim-intelligence="${esc(aims(v).intelligence)}" data-aim-growth="${esc(aims(v).growth)}"
        data-github="${esc(JSON.stringify(gh(v)))}" data-uses="${esc(JSON.stringify(uses(v).map(u => [u.label, u.name, u.page || u.url, u.status, u.note])))}"
        data-launched="${esc(v.launched || 'NOT YET')}" data-stage="${esc(v.stage)}" data-site="${esc(v.site)}"
        data-logo="${esc(v.logo || '')}" data-logo-w="${v.logoW || ''}" data-logo-h="${v.logoH || ''}" data-desc="${esc(v.desc)}"
        data-problem="${esc(pitch(v).problem)}" data-solution="${esc(pitch(v).solution)}" data-how="${esc(JSON.stringify(pitch(v).how || []))}"
        data-offer="${esc(pitch(v).offer)}" data-saves="${esc(pitch(v).saves)}" data-now="${esc(pitch(v).now)}">
        <span class="rid">${esc(v.id)}</span>
        <span class="name">${mark}${esc(v.name)}${fzs(v)}</span>
        <span class="status${pulses(v.status) ? ' is-live' : ''}" style="color:${c}"><span class="dot"></span>${esc(v.status)}</span>
        <span class="cat">${esc(v.category)}</span>
        <span class="aut">${targetShort(v)}</span>
      </button>`;
}

function chip(v) {
  const c = STATUS_COLOR[v.status] || '#8A8A8E';
  return `        <a href="/ventures/${slug(v)}/"><span class="id">${esc(v.id)}</span><span style="color:${c}">${esc(v.status)}</span></a>`;
}

function detail(v) {
  const c = STATUS_COLOR[v.status] || '#8A8A8E';
  const hasSite = Boolean(v.site);
  const logo = v.logo
    ? `<img id="d-logo" class="venture-logo venture-logo--lg" src="/assets/${esc(v.logo)}" alt="${esc(v.name)} logo" width="120" height="${Math.round(120 * (v.logoH || 1) / (v.logoW || 1))}">`
    : `<img id="d-logo" class="venture-logo venture-logo--lg" alt="" hidden>`;
  return `      <div class="detail-id"><span id="d-id">${esc(v.id)}</span>${logo}</div>
      <h2 class="detail-name" id="d-name">${esc(v.name)}</h2>
      <p class="fzs-line" id="d-stack"${v.stack ? '' : ' hidden'}><a class="fzs" href="/stack/">FZ STACK</a><span class="fzs-role" id="d-stack-role">${esc(v.stackRole || '')}</span><span class="fzs-os" id="d-stack-os" title="${esc(v.license || '')} licence"${v.open_source ? '' : ' hidden'}>OPEN SOURCE</span>${INFO_BTN}<span class="fzs-note">Other ventures are built on this one.</span></p>
      <div class="pitch">
        <section><h3 class="pitch-k">THE PROBLEM</h3><p class="pitch-problem" id="d-problem">${esc(pitch(v).problem)}</p></section>
        <section><h3 class="pitch-k">WHAT IT DOES</h3><p class="pitch-solution" id="d-solution">${esc(pitch(v).solution)}</p></section>
        <section><h3 class="pitch-k">HOW IT WORKS</h3><ul class="pitch-how" id="d-how">${(pitch(v).how || []).map(h => `<li>${esc(h)}</li>`).join('')}</ul></section>
        <section class="pitch-deal"><p class="pitch-offer" id="d-offer">${esc(pitch(v).offer)}</p><p class="pitch-saves" id="d-saves">${esc(pitch(v).saves)}</p></section>
        <p class="pitch-now"><span class="pitch-k">TODAY</span> <span id="d-now">${esc(pitch(v).now)}</span></p>
      </div>
      <a class="detail-link" id="d-link"${hasSite ? ` href="https://${esc(v.site)}"` : ' aria-disabled="true"'}>${
        hasSite ? esc(v.site.toUpperCase()) + ' &rarr;' : 'NO PUBLIC SURFACE YET'}</a>
      <details class="detail-more"><summary>THE TECHNICAL DETAIL</summary><p class="detail-desc" id="d-desc">${esc(v.desc)}</p></details>`;
}

function spec(v) {
  const c = STATUS_COLOR[v.status] || '#8A8A8E';
  return `        <div><dt>STATUS</dt><dd id="d-status" style="color:${c}">${esc(v.status)}</dd></div>
        <div><dt>CATEGORY</dt><dd id="d-cat">${esc(v.category)}</dd></div>
        <div><dt>PIPELINE STAGE</dt><dd id="d-stage">${esc(v.stage)}</dd></div>
        <div><dt>LAUNCHED</dt><dd id="d-launched">${esc(v.launched || 'NOT YET')}</dd></div>
        <div class="wide target"><dt>AUTONOMY TARGET</dt><dd><span id="d-target">${targetLong(v)}</span><span class="meter" id="d-meter"${v.target == null ? ' hidden' : ''}><i style="width:${v.target == null ? 0 : v.target * 20}%"></i></span></dd></div>
        <div class="wide aim"><dt>AIM &middot; AUTONOMOUS OPERATION</dt><dd id="d-aim-operate">${esc(aims(v).operate)}</dd></div>
        <div class="wide aim"><dt>AIM &middot; INTELLIGENCE</dt><dd id="d-aim-intelligence">${esc(aims(v).intelligence)}</dd></div>
        <div class="wide aim"><dt>AIM &middot; GROWTH</dt><dd id="d-aim-growth">${esc(aims(v).growth)}</dd></div>
        <div class="wide source"><dt>SOURCE</dt><dd id="d-github">${gh(v).length ? gh(v).map(([l, u]) => `<a href="${esc(u)}" rel="noopener">${esc(l)} &rarr;</a>`).join('') : '<span>NO PUBLIC REPOSITORY</span>'}</dd></div>
        <div class="wide activity"><dt>ACTIVITY &middot; COMMITS PER WEEK</dt><dd id="d-activity">${gh(v).length ? '<span>LOADING</span>' : '<span>NO PUBLIC REPOSITORY</span>'}</dd></div>
        <div class="wide activity"><dt>ISSUES &middot; OPENED AND CLOSED PER WEEK</dt><dd id="d-issues">${gh(v).length ? '<span>LOADING</span>' : '<span>NO PUBLIC REPOSITORY</span>'}</dd></div>
        <div class="wide built"><dt>BUILT WITH &middot; LIVE OR PLANNED</dt><dd id="d-uses">${useList(v)}</dd></div>
        <div class="wide inherit"><dt>INHERITED FROM FACTORY</dt><dd>IDENTITY &middot; BILLING &middot; DEPLOYMENT &middot; OBSERVABILITY &middot; SUPPORT &middot; ANALYTICS &middot; SECURITY</dd></div>`;
}

// Home-page carousel: logo, name and category, each linking to the venture's page.
function reelItem(v, copy) {
  const logo = v.logo
    ? `<img src="/assets/${esc(v.logo)}" alt="" width="44" height="${Math.round(44 * (v.logoH || 1) / (v.logoW || 1))}" loading="lazy">`
    : `<span class="reel-mono" aria-hidden="true">${esc(v.name.slice(0, 1))}</span>`;
  return `      <li${copy ? ' aria-hidden="true"' : ''}><a href="/ventures/${slug(v)}/"${copy ? ' tabindex="-1"' : ''}>${logo}<span class="reel-name">${esc(v.name)}</span><span class="reel-meta">${esc(v.id)} &middot; ${esc(v.category)}</span>${v.stack ? `<span class="reel-stack-row">${fzs(v)}</span>` : ''}</a></li>`;
}
// Two rows moving in opposite directions; ventures alternate between them.
// Each track holds its row twice so a short row still covers a wide screen,
// and a second, hidden track follows it so the loop has no seam. Only the
// first copy in the first track is reachable by keyboard and screen readers.
const reelTrack = (vs, hidden) =>
  `      <ul class="reel-track"${hidden ? ' aria-hidden="true"' : ''}>\n` +
  [...vs.map(v => reelItem(v, hidden)), ...vs.map(v => reelItem(v, true))].map(l => '  ' + l).join('\n') +
  `\n      </ul>`;
const reel = vs => [0, 1].map(r => {
  const row = vs.filter((_, i) => i % 2 === r);
  return `    <div class="reel${r ? ' reel--rev' : ''}">\n${reelTrack(row, false)}\n${reelTrack(row, true)}\n    </div>`;
}).join('\n');

function replaceRegion(src, key, body) {
  const re = new RegExp(`(<!-- fz:${key}:start -->)[\\s\\S]*?(<!-- fz:${key}:end -->)`);
  if (!re.test(src)) throw new Error(`region fz:${key} not found`);
  // A function replacer, so a "$" in the data ("$200") is never read as a $1/$2 pattern.
  return src.replace(re, (m, start, end) => `${start}\n${body}\n${end}`);
}

const live = V.filter(v => v.status !== 'ARCHIVED');

// ventures/index.html
const vp = path.join(ROOT, 'ventures/index.html');
let vs = fs.readFileSync(vp, 'utf8');
vs = replaceRegion(vs, 'registry', V.map(row).join('\n'));
vs = replaceRegion(vs, 'stackbar', `    <div class="registry-filter"><button type="button" class="fzs-filter" id="fz-stack-filter" aria-pressed="false">FZ STACK &middot; ${String(STACK_COUNT).padStart(2, '0')}</button>${INFO_BTN}<p class="fzs-hint">The ventures other ventures are built on. They add to the shared foundation; the others inherit it. <a href="/stack/">See the stack &rarr;</a></p></div>`);
vs = replaceRegion(vs, 'detail', detail(V[0]));
vs = replaceRegion(vs, 'spec', spec(V[0]));
const COUNT_RE = /(id="fz-count"[^>]*>)[^<]*/;
if (!COUNT_RE.test(vs)) throw new Error('fz-count marker not found in ventures/index.html');
vs = vs.replace(COUNT_RE,
  `$1${String(V.length).padStart(2, '0')} RECORDS &middot; ${
    String(V.filter(v => v.status === 'LIVE' || v.status === 'SCALING').length).padStart(2, '0')} LIVE`);
vs = vs.replace(/(RECORD \/ )FZ-\d+/, `$1${V[0].id}`);
fs.writeFileSync(vp, vs);

// ventures/<slug>/index.html: one page per venture, so a record can be linked,
// shared and indexed on its own. Each is the registry page with that record
// selected and its own title, description, canonical URL and structured data.
// fz-ventures.js moves between them with pushState, without a reload.
const GENERATED = '<!-- fz:venture-page (generated by tools/sync-ventures.js; do not edit) -->';
const jsonld = v => {
  const url = `${SITE}/ventures/${slug(v)}/`;
  const graph = {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'WebPage', '@id': `${url}#webpage`, url, name: `${v.name} · Factory Zero`,
        description: summary(v), isPartOf: { '@id': `${SITE}/#website` },
        about: { '@id': `${SITE}/#organization` }, inLanguage: 'en' },
      { '@type': 'BreadcrumbList', '@id': `${url}#breadcrumb`, itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Factory Zero', item: `${SITE}/` },
        { '@type': 'ListItem', position: 2, name: 'Ventures', item: `${SITE}/ventures/` },
        { '@type': 'ListItem', position: 3, name: v.name, item: url } ] }
    ]
  };
  // escape "<" so no string in the data can close the script element
  return JSON.stringify(graph, null, 2).replace(/</g, '\\u003c');
};
const summary = v => pitch(v).solution || v.desc;

const slugs = new Set();
for (const v of V) {
  const s = slug(v);
  if (!s || slugs.has(s)) throw new Error(`venture slug "${s}" for ${v.id} is empty or not unique`);
  slugs.add(s);
  const url = `${SITE}/ventures/${s}/`;
  const title = `${esc(v.name)} &middot; Ventures &middot; Factory Zero`;
  let page = replaceRegion(vs, 'detail', detail(v));
  page = replaceRegion(page, 'spec', spec(v));
  page = page
    .replace(/aria-pressed="true"/g, 'aria-pressed="false"')
    .replace(`aria-pressed="false" aria-controls="d-record"\n        data-id="${v.id}"`,
             `aria-pressed="true" aria-controls="d-record"\n        data-id="${v.id}"`)
    .replace(/(RECORD \/ )FZ-\d+/, `$1${v.id}`)
    .replace(/<title>[^<]*<\/title>/, `<title>${title}</title>`)
    .replace(/(<meta name="description" content=")[^"]*/, (m, a) => a + esc(summary(v)))
    .replace(/(<link rel="canonical" href=")[^"]*/, `$1${url}`)
    .replace(/(<meta property="og:url" content=")[^"]*/, `$1${url}`)
    .replace(/(<meta property="og:title" content=")[^"]*/, `$1${title}`)
    .replace(/(<meta property="og:description" content=")[^"]*/, (m, a) => a + esc(summary(v)))
    .replace(/(<meta name="twitter:title" content=")[^"]*/, `$1${title}`)
    .replace(/(<meta name="twitter:description" content=")[^"]*/, (m, a) => a + esc(summary(v)))
    .replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/, () => `<script type="application/ld+json">\n${jsonld(v)}\n</script>`)
    .replace('<html lang="en">', `<html lang="en">\n${GENERATED}`);
  if (!page.includes(`data-id="${v.id}"`) || !page.includes('aria-pressed="true"')) {
    throw new Error(`could not select ${v.id} on its own page`);
  }
  fs.mkdirSync(path.join(ROOT, 'ventures', s), { recursive: true });
  fs.writeFileSync(path.join(ROOT, 'ventures', s, 'index.html'), page);
}
// drop pages for ventures that were renamed or removed; only ones this script wrote
for (const d of fs.readdirSync(path.join(ROOT, 'ventures'), { withFileTypes: true })) {
  const f = path.join(ROOT, 'ventures', d.name, 'index.html');
  if (d.isDirectory() && !slugs.has(d.name) && fs.existsSync(f) && fs.readFileSync(f, 'utf8').includes(GENERATED)) {
    fs.rmSync(path.join(ROOT, 'ventures', d.name), { recursive: true });
  }
}

// stack/index.html: the stack page, from the same data
const stackPage = require('./stack-page.js');
fs.mkdirSync(path.join(ROOT, 'stack'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'stack', 'index.html'), stackPage({ V, ROOT, SITE, slug, pitch, uses }));

// sitemap.xml: one entry per venture page
const smp = path.join(ROOT, 'sitemap.xml');
const today = new Date().toISOString().slice(0, 10);
let sm = fs.readFileSync(smp, 'utf8');
sm = replaceRegion(sm, 'venture-pages', V.map(v =>
  `  <url><loc>${SITE}/ventures/${slug(v)}/</loc><lastmod>${today}</lastmod><changefreq>weekly</changefreq><priority>0.7</priority></url>`).join('\n'));
if (!sm.includes(`${SITE}/stack/`)) sm = sm.replace(/(  <url><loc>[^<]*\/ventures\/<\/loc>[^\n]*\n)/, `$1  <url><loc>${SITE}/stack/</loc><lastmod>${today}</lastmod><changefreq>weekly</changefreq><priority>0.8</priority></url>\n`);
fs.writeFileSync(smp, sm);

// functions/api/activity-sources.json: the only GitHub owners and repositories
// /api/activity will query, keyed by venture id. An owner-only link
// (github.com/<owner>) means all of that owner's public repositories.
const sources = {};
for (const v of V) {
  if (!gh(v).length) continue;
  const owners = new Set(), repos = new Set();
  for (const [, u] of gh(v)) {
    const m = /^https:\/\/github\.com\/([A-Za-z0-9-]+)(?:\/([A-Za-z0-9._-]+))?\/?$/.exec(u);
    if (!m) throw new Error(`${v.id}: not a GitHub owner or repository URL: ${u}`);
    if (m[2]) repos.add(`${m[1]}/${m[2]}`.toLowerCase()); else owners.add(m[1].toLowerCase());
  }
  sources[v.id] = { owners: [...owners], repos: [...repos] };
}
fs.writeFileSync(path.join(ROOT, 'functions/api/activity-sources.json'), JSON.stringify(sources, null, 2) + '\n');

// stack.json: every venture's `uses`, public, for machine readers and for the
// venture sites, which vendor their own entry into a footer strip
// (no runtime fetch). Deterministic: no timestamp, so it only changes with the data.
const stack = {
  description: 'What each Factory Zero venture is built with: sister ventures and third parties, by role, each live (in use today) or planned. Generated from assets/fz-data.js by tools/sync-ventures.js.',
  source: `${SITE}/stack.json`,
  statuses: { live: 'In use today.', planned: 'Decided and tracked, not in use yet.' },
  roles: ROLES,
  ventures: V.map(v => ({
    id: v.id, name: v.name, site: v.site ? `https://${v.site}/` : null, page: `${SITE}/ventures/${slug(v)}/`,
    uses: uses(v).map(u => ({ id: u.id, name: u.name, kind: u.kind, url: u.url, role: u.role, phrase: u.phrase, status: u.status, note: u.note || undefined }))
  }))
};
fs.writeFileSync(path.join(ROOT, 'stack.json'), JSON.stringify(stack, null, 2) + '\n');

// index.html: the static hero placeholders must not drift from the data,
// since that is what crawlers and no-JS visitors read.
const hp = path.join(ROOT, 'index.html');
let hs = fs.readFileSync(hp, 'utf8');
for (const [re, val, label] of [
  [/(id="fz-pipeline-count"[^>]*>)[^<]*/, `LINE 01 &middot; ${String(live.length).padStart(2, '0')} UNITS IN PROCESS`, 'fz-pipeline-count'],
  [/(id="fz-reel-count"[^>]*>)[^<]*/, String(live.length), 'fz-reel-count'],
]) {
  if (!re.test(hs)) throw new Error(`${label} marker not found in index.html`);
  hs = hs.replace(re, `$1${val}`);
}
hs = replaceRegion(hs, 'reel', reel(live));
// The hero proof row: counts only, each one derived from the records above,
// so it can never claim more than the registry shows.
function proof(vs) {
  const ids = new Set(vs.map(v => v.id));
  const sectors = new Set(vs.map(v => v.category).filter(Boolean)).size;
  // Ventures that already run on a sister venture, by a `uses` entry checked live.
  const onSister = vs.filter(v => (v.uses || []).some(u => ids.has(u.id) && u.status === 'live')).length;
  const row = (n, label) => `        <div><dt>${label}</dt><dd>${String(n).padStart(2, '0')}</dd></div>`;
  return [
    row(vs.length, 'VENTURES'),
    row(sectors, 'SECTORS'),
    row(onSister, 'RUN ON A SISTER VENTURE'),
  ].join('\n');
}
hs = replaceRegion(hs, 'proof', proof(live));

// The venture timeline, from assets/timeline-data.json (refresh that with
// tools/sync-timeline.js). Ventures without an org in the data are left out.
const tdp = path.join(ROOT, 'assets/timeline-data.json');
if (fs.existsSync(tdp)) {
  const tl = require('./timeline.js')(live, JSON.parse(fs.readFileSync(tdp, 'utf8')), slug);
  hs = replaceRegion(hs, 'timeline', tl.svg);
  const RANGE_RE = /(<span class="tl-span">)[^<]*/;
  if (!RANGE_RE.test(hs)) throw new Error('tl-span marker not found in index.html');
  hs = hs.replace(RANGE_RE, `$1${tl.range} &middot; WITA`);
}
fs.writeFileSync(hp, hs);

// system/index.html
const sp = path.join(ROOT, 'system/index.html');
let ss = fs.readFileSync(sp, 'utf8');
ss = replaceRegion(ss, 'ventures', live.map(chip).join('\n'));
fs.writeFileSync(sp, ss);

console.log(`synced ${V.length} records into ventures/index.html, ${V.length} venture pages, the sitemap, activity sources and stack.json, and ${live.length} into system/index.html`);
