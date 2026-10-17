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

const esc = s => String(s == null ? '' : s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;')
  .replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// Home-page films: a poster card per film. The card is a link to the MP4, so with
// JavaScript off it still plays the film; fz-ui.js opens the shared player instead.
// Posters are WebP at 480 and 960 wide, made from the JPGs with cwebp (see DESIGN.md).
const webpOf = (file, w) => `/assets/films/${esc(file.replace(/\.jpg$/, `-${w}.webp`))}`;
const fmtDuration = s => s == null ? '' : `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
const filmCard = (f, i) => {
  const v = BY_ID.get(f.venture);
  const dur = fmtDuration(f.duration);
  return `<li><a class="film-card" href="/assets/films/${esc(f.video)}" data-film-open="${i}" data-title="${esc(f.title)}" data-venture="${esc(v.name)}" data-venture-url="/ventures/${slug(v)}/" data-site="${esc(v.site ? `https://${v.site}/` : '')}" data-line="${esc(f.caption)}" data-poster="${webpOf(f.poster, 960)}" aria-haspopup="dialog">
    <span class="film-shot">
      <picture><source type="image/webp" srcset="${webpOf(f.poster, 480)} 480w, ${webpOf(f.poster, 960)} 960w" sizes="(min-width: 1000px) 380px, (min-width: 600px) 50vw, 100vw"><img src="/assets/films/${esc(f.poster)}" width="960" height="540" loading="lazy" decoding="async" alt=""></picture>
      <span class="film-play" aria-hidden="true"><svg viewBox="0 0 24 24" width="20" height="20" focusable="false"><path d="M7 4.8v14.4L19.2 12z" fill="currentColor"/></svg></span>
      ${dur ? `<span class="film-dur"><span class="vh">Length </span>${dur}</span>` : ''}
    </span>
    <span class="film-cap">
      <span class="film-name"><span class="vh">Play the film: </span>${esc(f.title)}</span>
      <span class="film-title">${esc(v.name)}</span>
      <span class="film-line">${esc(f.caption)}</span>
    </span>
  </a></li>`;
};
// The one player every home-page card opens. Its video gets a src only when opened.
const PLAYER = `<dialog class="fz-player" id="fz-player" aria-labelledby="fzp-title">
  <div class="fzp-frame">
    <div class="fzp-top">
      <p class="fzp-count" id="fzp-count" aria-live="polite"></p>
      <button class="fzp-close" type="button" data-fzp-close>Close <span aria-hidden="true">&times;</span></button>
    </div>
    <div class="fzp-stage"><video class="fzp-video" controls playsinline preload="none"></video></div>
    <div class="fzp-info">
      <div>
        <p class="fzp-title" id="fzp-title"></p>
        <p class="fzp-meta"><a class="fzp-venture" id="fzp-venture" href="/ventures/"></a><span id="fzp-line"></span></p>
      </div>
      <div class="fzp-actions">
        <a class="fzp-btn" id="fzp-site" href="/" rel="noopener">Visit site <span aria-hidden="true">&rarr;</span></a>
        <button class="fzp-btn" type="button" data-fzp-prev aria-label="Previous film"><span aria-hidden="true">&larr;</span><span class="fzp-lbl">Previous</span></button>
        <button class="fzp-btn" type="button" data-fzp-next aria-label="Next film"><span class="fzp-lbl">Next</span><span aria-hidden="true">&rarr;</span></button>
      </div>
    </div>
  </div>
</dialog>`;
// The home-page section: every film as a card, and the one shared player.
const filmsSection = () => `  <ul class="films-grid">\n${FILMS.map(filmCard).join('\n')}\n  </ul>\n${PLAYER}`;
// A venture's own films, shown in its detail panel. Every film is written out, and
// fz-ventures.js shows the ones whose data-film-for matches the selected record.


// Autonomy levels, same order as LEVELS in assets/fz-app.js.
const LEVELS = ['HUMAN-OPERATED', 'AI-ASSISTED', 'AGENT WORKFLOWS', 'AGENT-OPERATED', 'SELF-OPTIMIZING', 'AUTONOMOUS COMPANY'];
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
  if (v.stack && !v.stackGroup) throw new Error(`${v.id}: a stack venture needs a stackGroup`);
  if (v.stack && typeof v.open_source !== 'boolean') throw new Error(`${v.id}: a stack venture needs open_source true or false`);
  if (v.open_source && !v.license) throw new Error(`${v.id}: open_source needs the licence`);
  for (const u of v.uses || []) {
    const p = BY_ID.get(u.id);
    if (p && !p.stack) throw new Error(`${p.id} (${p.name}) is used by ${v.id} but is not marked stack: true`);
  }
}
// Venture films (assets/fz-data.js `films`). Each names a real venture record and
// two files in assets/films/; a typo or a missing or oversized file stops the run.
const FILMS = global.window.FZ_DATA.films || [];
const FILM_DIR = path.join(ROOT, 'assets/films');
const FILM_MAX_BYTES = 25 * 1024 * 1024;
const filmIds = new Set();
for (const f of FILMS) {
  if (!/^[a-z0-9-]+$/.test(f.id) || filmIds.has(f.id)) throw new Error(`film id "${f.id}" is empty, not a slug, or not unique`);
  filmIds.add(f.id);
  if (!BY_ID.has(f.venture)) throw new Error(`film ${f.id}: unknown venture "${f.venture}"`);
  if (!f.title || !f.caption) throw new Error(`film ${f.id}: needs a title and a caption`);
  for (const file of [f.video, f.poster]) {
    const fp = path.join(FILM_DIR, file);
    if (!fs.existsSync(fp)) throw new Error(`film ${f.id}: missing file assets/films/${file}`);
    if (fs.statSync(fp).size > FILM_MAX_BYTES) throw new Error(`film ${f.id}: assets/films/${file} is over 25 MiB`);
  }
}
// The rendered list, shared by the static page and (through data-uses) fz-ventures.js.
const useItem = u => `<li class="use"><span class="use-role">${esc(u.label)}</span><a class="use-name" href="${esc(u.page || u.url)}"${u.page ? '' : ' rel="noopener"'}>${esc(u.name)}</a><span class="use-tag use-tag--${u.status}">${u.status.toUpperCase()}</span>${u.note ? `<span class="use-note">${esc(u.note)}</span>` : ''}</li>`;
const useList = v => uses(v).length ? `<ul class="uses">${uses(v).map(useItem).join('')}</ul>` : '<span>NOT RECORDED</span>';

// One venture on the system page's ventures layer: a hairline cell, id and status.
function chip(v) {
  return `        <a class="cell" href="/ventures/${slug(v)}/"><span class="id">${esc(v.id)}</span><span class="st">${esc(v.status)}</span></a>`;
}

function replaceRegion(src, key, body) {
  const re = new RegExp(`(<!-- fz:${key}:start -->)[\\s\\S]*?(<!-- fz:${key}:end -->)`);
  if (!re.test(src)) throw new Error(`region fz:${key} not found`);
  // A function replacer, so a "$" in the data ("$200") is never read as a $1/$2 pattern.
  return src.replace(re, (m, start, end) => `${start}\n${body}\n${end}`);
}

const live = V.filter(v => v.status !== 'ARCHIVED');

// The design-system partials (tools/ui.js) and the counts every page shows.
// Every number here is derived from the records, so a page can never claim
// more than the registry holds.
const UI = require('./ui.js');
const STACK_V = live.filter(v => v.stack);
const SECTORS = new Set(live.map(v => v.category).filter(Boolean)).size;
const LIVE_IDS = new Set(live.map(v => v.id));
const ON_SISTER = live.filter(v => (v.uses || []).some(u => LIVE_IDS.has(u.id) && u.status === 'live')).length;
const pad2 = n => String(n).padStart(2, '0');
// How many ventures use each stack venture live today: the hero's "most used" card.
const usedBy = new Map();
for (const v of live) for (const u of v.uses || []) if (LIVE_IDS.has(u.id) && u.status === 'live') {
  if (!usedBy.has(u.id)) usedBy.set(u.id, new Set());
  usedBy.get(u.id).add(v.id);
}
const footerHtml = UI.footer(STACK_V, slug);
const SCRIPTS = names => names.map(n => `<script src="/assets/${n}"${n === 'fz-data.js' ? '' : ' defer'}></script>`).join('\n');

// Swap whatever fonts/stylesheet a <head> carries for the design system's.
function withUiHead(head) {
  const h = head
    .replace(/<link rel="preconnect"[^>]*>\n?/g, '')
    .replace(/<link href="https:\/\/fonts\.googleapis\.com[^>]*>\n?/g, '')
    .replace(/<link rel="preload" href="\/assets\/fonts\/[^>]*>\n?/g, '')
    .replace(/<script type="speculationrules">[\s\S]*?<\/script>\n?/g, '')
    .replace(/<link rel="stylesheet"[^>]*>\n?/g, '')
    .replace(/<meta name="theme-color" content="[^"]*">/, '<meta name="theme-color" content="#0A0B0A">');
  if (!h.includes('<script type="application/ld+json">')) throw new Error('head without JSON-LD');
  return h.replace(/\n{2,}<script type="application\/ld\+json">/, '\n<script type="application/ld+json">')
    .replace('<script type="application/ld+json">', `\n${UI.headAssets()}\n\n<script type="application/ld+json">`);
}

// ventures/index.html: the registry as an app-store grid of square cards.
const vp = path.join(ROOT, 'ventures/index.html');
const vsrc = fs.readFileSync(vp, 'utf8');
const vhead = withUiHead(vsrc.slice(0, vsrc.indexOf('</head>')));
const vbody = `</head>
<body>

${UI.header('/ventures/')}

<main id="main" class="has-ph">
${UI.pageHero('ventures')}

<section class="sec sec--flush">
  <div class="wrap">
    <div class="sec-head">
      <div>
        <p class="eyebrow">Venture registry</p>
        <h1 class="h1" style="margin-top:18px">Every venture, one&nbsp;foundation.</h1>
        <p class="lede">Every venture below is a company of its own, and they are built to run on each other: Cratefield is the framework, Colonizer runs the agents, Owlpost sends the mail, Ledgers keeps the books. The ones marked FZ stack are the foundation for the autonomous organization. Open a venture to see the problem it solves, what you can use today, and which of the others it uses; each page says which links are live and which are planned.</p>
      </div>
      <div class="sec-head__aside"><p class="vcount" id="fz-count">${pad2(V.length)} ventures &middot; ${pad2(STACK_V.length)} on the FZ stack &middot; ${pad2(SECTORS)} sectors</p></div>
    </div>
<!-- fz:vtools:start -->
${UI.vtools(V)}
<!-- fz:vtools:end -->
    <ul class="vgrid" data-vgrid>
<!-- fz:vgrid:start -->
${V.map((v, i) => UI.vcard(v, { slug, pitch, i })).join('\n')}
<!-- fz:vgrid:end -->
    </ul>
    <p class="vempty" data-vempty hidden>No venture matches. <button type="button" class="link" data-vreset style="background:none;border:0;border-bottom:1px solid var(--hair-3);cursor:pointer">Show all</button></p>
  </div>
</section>

<section class="band" data-rv aria-hidden="true">
  <img src="/assets/ui/ventures.webp" srcset="/assets/ui/ventures-800.webp 800w, /assets/ui/ventures.webp 1600w" sizes="100vw" alt="" width="1600" height="900" loading="lazy" decoding="async">
</section>

<section class="cta-band">
  <img src="/assets/ui/cta.webp" alt="" width="1344" height="576" loading="lazy" decoding="async">
  <div class="wrap"><div class="cta-in">
    <p class="eyebrow">Factory Zero</p>
    <h2 class="h1">Build on the foundation.</h2>
    <p class="lede">Most of the FZ stack is open source, so anyone can build on it too.</p>
    <div class="btns"><a class="btn btn--primary" href="/stack/">See the stack <span class="arr" aria-hidden="true">&rarr;</span></a><a class="btn btn--ghost" href="/enter/">Enter Factory Zero</a></div>
  </div></div>
</section>

</main>

${footerHtml}

${SCRIPTS(['fz-common.js', 'fz-ui.js'])}
</body>
</html>
`;
fs.writeFileSync(vp, vhead + vbody);

// ventures/<slug>/index.html: one product page per venture. The chart script
// (fz-ventures.js) reads the record from the one .record element, as before,
// so every element id it fills (d-*) is kept.
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
const meter = t => `<span class="meter" id="d-meter"${t == null ? ' hidden' : ''}>${[1, 2, 3, 4, 5].map(k => `<i${t != null && k <= t ? ' class="on"' : ''}></i>`).join('')}</span>`;

function related(v) {
  // sister ventures it uses or that use it, then the rest of its sector; at most 4
  const ids = new Set();
  for (const u of v.uses || []) if (BY_ID.has(u.id)) ids.add(u.id);
  for (const o of live) if ((o.uses || []).some(u => u.id === v.id)) ids.add(o.id);
  for (const o of live) if (o.category === v.category) ids.add(o.id);
  ids.delete(v.id);
  return [...ids].map(id => BY_ID.get(id)).filter(Boolean).slice(0, 4);
}

function venturePage(v) {
  const s = slug(v), p = pitch(v), a = aims(v);
  const site = v.site
    ? `<a class="btn btn--primary" id="d-link" href="https://${esc(v.site)}" rel="noopener">Visit ${esc(v.site)} <span class="arr" aria-hidden="true">&rarr;</span></a>`
    : `<a class="btn btn--ghost" id="d-link" aria-disabled="true">No public surface yet</a>`;
  const films = FILMS.filter(f => f.venture === v.id);
  const filmsHtml = films.length ? `<div class="app-sec"><h2>The film</h2><div class="app-films" data-film-for="${esc(v.id)}">${films.map(f => `<figure class="film" style="padding:0">
  <video class="fz-film" controls playsinline preload="none" data-poster="/assets/films/${esc(f.poster)}" width="1920" height="1080" aria-label="${esc(f.title)} film"><source src="/assets/films/${esc(f.video)}" type="video/mp4"><a href="/assets/films/${esc(f.video)}">Download the ${esc(f.title)} film (MP4)</a></video>
  <figcaption>${esc(f.caption)}</figcaption>
</figure>`).join('\n')}</div></div>` : '';
  const rel = related(v);
  const uniq = rel.length ? `<section class="sec"><div class="wrap">
  <div class="sec-head"><div><p class="eyebrow">Related</p><h2 class="h2">From the same foundation.</h2></div><div class="sec-head__aside"><a class="link" href="/ventures/">All ventures <span aria-hidden="true">&rarr;</span></a></div></div>
  <ul class="vgrid">
${rel.map((o, i) => UI.vcard(o, { slug, pitch, i })).join('\n')}
  </ul>
</div></section>` : '';
  const record = `<button type="button" class="record" data-static hidden aria-pressed="true" tabindex="-1"
        data-id="${esc(v.id)}" data-stack="${v.stack ? 1 : 0}" data-stack-role="${esc(v.stackRole || '')}" data-license="${esc(v.open_source ? v.license : '')}" data-slug="${s}" data-name="${esc(v.name)}" data-status="${esc(v.status)}" data-status-color="currentColor"
        data-category="${esc(v.category)}" data-autonomy="${v.autonomy == null ? '' : v.autonomy}"
        data-target="${v.target == null ? '' : v.target}" data-aim-operate="${esc(a.operate)}"
        data-aim-intelligence="${esc(a.intelligence)}" data-aim-growth="${esc(a.growth)}"
        data-github="${esc(JSON.stringify(gh(v)))}" data-uses="${esc(JSON.stringify(uses(v).map(u => [u.label, u.name, u.page || u.url, u.status, u.note])))}"
        data-launched="${esc(v.launched || 'NOT YET')}" data-stage="${esc(v.stage)}" data-site="${esc(v.site)}"
        data-logo="${esc(v.logo || '')}" data-logo-w="${v.logoW || ''}" data-logo-h="${v.logoH || ''}" data-desc="${esc(v.desc)}"
        data-problem="${esc(p.problem)}" data-solution="${esc(p.solution)}" data-how="${esc(JSON.stringify(p.how || []))}"
        data-offer="${esc(p.offer)}" data-saves="${esc(p.saves)}" data-now="${esc(p.now)}"></button>`;
  const ghLinks = gh(v).length ? gh(v).map(([l, u]) => `<a href="${esc(u)}" rel="noopener">${esc(l)} &rarr;</a>`).join('') : '<span>No public repository</span>';
  return `
<main id="main" class="has-ph">
${UI.pageHero(slug(v), 'app')}
${record}
<div class="wrap">
  <nav class="crumbs" aria-label="Breadcrumb"><a href="/">Factory Zero</a><span aria-hidden="true">/</span><a href="/ventures/">Ventures</a><span aria-hidden="true">/</span><span id="d-record">RECORD / ${esc(v.id)}</span></nav>

  <header class="app-hero">
    <div class="app-icon">${v.logo ? `<img id="d-logo" src="/assets/${esc(v.logo)}" alt="${esc(v.name)} logo" width="120" height="${Math.round(120 * (v.logoH || 1) / (v.logoW || 1))}">` : `<img id="d-logo" alt="" hidden><span class="vicon--mono" style="font-size:56px" aria-hidden="true">${esc(v.name.slice(0, 1))}</span>`}</div>
    <div>
      <p class="app-id"><span id="d-id">${esc(v.id)}</span> &middot; <span id="d-cat">${esc(v.category)}</span></p>
      <h1 class="app-name" id="d-name">${esc(v.name)}</h1>
      <p class="app-sub">${esc(summary(v))}</p>
      <div class="app-meta">
        <span class="chip chip--dot" id="d-status">${esc(v.status)}</span>
        <span class="chip" id="d-stage">${esc(v.stage)}</span>
        <span id="d-stack"${v.stack ? '' : ' hidden'} style="display:inline-flex;gap:6px;align-items:center"><a class="fzs" href="/stack/">FZ stack</a><span class="fzs-role" id="d-stack-role">${esc(v.stackRole || '')}</span><span class="fzs-os" id="d-stack-os" title="${esc(v.license || '')} licence"${v.open_source ? '' : ' hidden'}>Open source</span><button type="button" class="fzs-i" aria-label="What is FZ STACK?" aria-haspopup="dialog" aria-expanded="false">i</button></span>
      </div>
    </div>
    <div class="app-cta">${site}<span class="note">Launched: <span id="d-launched">${esc(v.launched || 'NOT YET')}</span></span></div>
  </header>

  <dl class="app-stats">
    <div><dt>Status</dt><dd>${esc(v.status)}</dd></div>
    <div><dt>Pipeline stage</dt><dd>${esc(v.stage)}</dd></div>
    <div><dt>Sector</dt><dd>${esc(v.category)}</dd></div>
    <div><dt>Autonomy target</dt><dd><span id="d-target">${targetLong(v)}</span>${meter(v.target)}</dd></div>
    <div><dt>Built with</dt><dd>${uses(v).filter(u => u.status === 'live').length} live &middot; ${uses(v).filter(u => u.status === 'planned').length} planned</dd></div>
  </dl>

  <div class="app-body">
    <div>
      <div class="app-sec"><h2>The problem</h2><p class="big" id="d-problem">${esc(p.problem)}</p></div>
      <div class="app-sec"><h2>What it does</h2><p class="big" id="d-solution">${esc(p.solution)}</p></div>
      <div class="app-sec"><h2>How it works</h2><ol class="how" id="d-how">${(p.how || []).map(h => `<li>${esc(h)}</li>`).join('')}</ol></div>
      <div class="app-sec"><div class="deal"><p id="d-offer">${esc(p.offer)}</p><p id="d-saves">${esc(p.saves)}</p></div>
        <p class="now" style="margin-top:18px"><span class="chip">Today</span><span id="d-now">${esc(p.now)}</span></p></div>
      ${filmsHtml}
      <div class="app-sec"><h2>Aims</h2>
        <dl class="cards2" style="grid-template-columns:1fr">
          <div class="card"><dt class="card-k">Autonomous operation</dt><dd style="margin:12px 0 0;color:var(--fg-2)" id="d-aim-operate">${esc(a.operate)}</dd></div>
          <div class="card"><dt class="card-k">Intelligence</dt><dd style="margin:12px 0 0;color:var(--fg-2)" id="d-aim-intelligence">${esc(a.intelligence)}</dd></div>
          <div class="card"><dt class="card-k">Growth</dt><dd style="margin:12px 0 0;color:var(--fg-2)" id="d-aim-growth">${esc(a.growth)}</dd></div>
        </dl>
      </div>
      <div class="app-sec"><details class="more-desc"><summary>The technical detail</summary><p class="body" id="d-desc">${esc(v.desc)}</p></details></div>
    </div>
    <aside class="side" aria-label="${esc(v.name)} details">
      <div><h3>Built with &middot; live or planned</h3><div style="margin-top:14px" id="d-uses">${useList(v).replace('<span>NOT RECORDED</span>', '<span class="muted">Not recorded</span>')}</div></div>
      <div class="activity-box"><h3>Commits per week</h3><div style="margin-top:14px" id="d-activity">${gh(v).length ? '<span>LOADING</span>' : '<span>NO PUBLIC REPOSITORY</span>'}</div></div>
      <div class="activity-box"><h3>Issues opened and closed</h3><div style="margin-top:14px" id="d-issues">${gh(v).length ? '<span>LOADING</span>' : '<span>NO PUBLIC REPOSITORY</span>'}</div></div>
      <div><dl><div><dt>Source</dt><dd class="repo-links" id="d-github">${ghLinks}</dd></div>
      <div><dt>Inherited from the factory</dt><dd>Identity &middot; billing &middot; deployment &middot; observability &middot; support &middot; analytics &middot; security</dd></div></dl></div>
    </aside>
  </div>
</div>
${uniq}
</main>
`;
}

const slugs = new Set();
for (const v of V) {
  const s = slug(v);
  if (!s || slugs.has(s)) throw new Error(`venture slug "${s}" for ${v.id} is empty or not unique`);
  slugs.add(s);
  const url = `${SITE}/ventures/${s}/`;
  const title = `${esc(v.name)} &middot; Ventures &middot; Factory Zero`;
  const head = vhead
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
  const page = `${head}</head>
<body>

${UI.header('/ventures/')}
${venturePage(v)}
${footerHtml}

${SCRIPTS(['fz-common.js', 'fz-ventures.js', 'fz-ui.js'])}
</body>
</html>
`;
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

// index.html: the generated regions of the home page. Everything shown is
// derived from the records, so it can never claim more than the registry shows.
const hp = path.join(ROOT, 'index.html');
let hs = fs.readFileSync(hp, 'utf8');

// The stats band: counts only.
const stat = (n, label, i) => `      <div class="stat" data-rv style="--d:${i}"><p class="stat-n" data-count="${n}">${pad2(n)}</p><p class="stat-k">${label}</p></div>`;
hs = replaceRegion(hs, 'stats', [
  stat(live.length, '<b>Ventures</b>, each its own company', 0),
  stat(SECTORS, '<b>Sectors</b>, from music to accounting', 1),
  stat(STACK_V.length, 'On the <b>FZ stack</b>: ventures others build on', 2),
  stat(ON_SISTER, 'Already <b>run on a sister venture</b>, checked live', 3),
  stat(FILMS.length, '<b>Films</b> from the ventures', 4),
  stat(STACK_V.filter(v => v.open_source).length, `<b>Open source</b>: ${STACK_V.filter(v => v.open_source).length * 2 > STACK_V.length ? 'most' : 'part'} of the FZ stack, ${STACK_V.filter(v => v.open_source).length} of ${STACK_V.length}`, 5),
].join('\n'));

// The logo marquee: every venture twice, the copy hidden from assistive tech.
const mItem = (v, copy) => `      <li${copy ? ' aria-hidden="true"' : ''}><a href="/ventures/${slug(v)}/"${copy ? ' tabindex="-1"' : ''}>${UI.icon(v, 28)}${esc(v.name)}</a></li>`;
hs = replaceRegion(hs, 'marquee', [...live.map(v => mItem(v, false)), ...live.map(v => mItem(v, true))].join('\n'));

// Hero cards: the most-used FZ stack venture, the newest film, merged PRs (filled by fz-ui.js).
const top = [...usedBy.entries()].sort((a, b) => b[1].size - a[1].size)[0];
const topV = top && BY_ID.get(top[0]);
const lastFilm = FILMS[FILMS.length - 1];
const lastFilmV = lastFilm && BY_ID.get(lastFilm.venture);
hs = replaceRegion(hs, 'herocards', [
  `    <a class="hcard hcard--offer" href="/venture-as-a-service/"><p class="hcard-k"><span class="acc">New</span> &middot; Venture as a service</p><p class="hcard-price">From $5,000</p><p class="hcard-sub">An autonomous venture MVP on the FZ foundation. Startup program: $500 in credits, limited places.</p><p class="hcard-go">See the offer &rarr;</p></a>`,
  topV ? `    <a class="hcard" href="/ventures/${slug(topV)}/"><p class="hcard-k">FZ stack &middot; most used</p><div class="hcard-row"><span class="hcard-icon">${UI.icon(topV, 30)}</span><span><span class="hcard-name">${esc(topV.name)}</span><br><span class="hcard-sub">${esc(topV.stackRole || topV.category)} &middot; live in ${top[1].size} ventures</span></span></div></a>` : '',
  lastFilm ? `    <a class="hcard" href="/#films"><p class="hcard-k">Newest film &middot; ${FILMS.length} in all</p><div class="hcard-film" style="background-image:url('${webpOf(lastFilm.poster, 480)}')"></div><p class="hcard-sub" style="margin-top:10px">${esc(lastFilmV ? lastFilmV.name : lastFilm.title)} &middot; ${esc(lastFilm.caption)}</p></a>` : '',
  `    <div class="hcard"><p class="hcard-k">PRs merged &middot; 30 days</p><p class="hcard-n"><span id="fz-merged" title="Merged pull requests in the ventures' public GitHub repositories, last 30 days">&mdash;</span><small>public repositories</small></p></div>`,
].filter(Boolean).join('\n'));

// The venture grid.
hs = replaceRegion(hs, 'vtools', UI.vtools(live));
hs = replaceRegion(hs, 'vgrid', live.map((v, i) => UI.vcard(v, { slug, pitch, i })).join('\n'));
hs = replaceRegion(hs, 'films', filmsSection());

// The OS layers as numbered steps.
const LAYERS = global.window.FZ_DATA.layers || [];
hs = replaceRegion(hs, 'steps', LAYERS.map((l, i) => `      <li class="step" data-rv style="--d:${i}"><span class="step-n"><span>${i + 1}</span></span><h3>${esc(l.name)}</h3><ul>${l.agents.map(([n, d]) => `<li><b>${esc(n.length <= 3 ? n : n.charAt(0) + n.slice(1).toLowerCase())}</b><span>${esc(d)}</span></li>`).join('')}</ul></li>`).join('\n'));

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
hs = replaceRegion(hs, 'footer', footerHtml);
fs.writeFileSync(hp, hs);

// system/index.html
const sp = path.join(ROOT, 'system/index.html');
let ss = fs.readFileSync(sp, 'utf8');
ss = replaceRegion(ss, 'ventures', live.map(chip).join('\n'));
fs.writeFileSync(sp, ss);

console.log(`synced ${V.length} records into the registry grid, ${V.length} venture pages, the home page, the sitemap, activity sources and stack.json, and ${live.length} into system/index.html`);
