/* Shared markup for pages on the 2026-10 design system (assets/fz-ui.css).
 * Used by tools/sync-ventures.js to write the venture registry, every venture
 * page and the generated regions of the home page. See DESIGN.md. */
'use strict';

const esc = s => String(s == null ? '' : s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;')
  .replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const FONTS = 'https://fonts.googleapis.com/css2?family=Inter+Tight:wght@300;400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap';

// <head> pieces after the per-page meta: fonts and the one stylesheet.
const headAssets = () => `<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="${FONTS}" rel="stylesheet">
<link rel="stylesheet" href="/assets/fz-ui.css">`;

const NAV = [
  ['/venture-as-a-service/', 'Services'], ['/ventures/', 'Ventures'], ['/stack/', 'Stack'], ['/system/', 'System'],
  ['/technology/', 'Technology'], ['/thesis/', 'Thesis'], ['/about/', 'About']
];

function header(current) {
  const links = NAV.map(([href, label]) =>
    `    <a href="${href}"${current === href ? ' aria-current="page"' : ''}>${label}</a>`).join('\n');
  return `<a class="skip-link" href="#main">Skip to content</a>

<header class="site-header">
  <a class="wordmark" href="/" aria-label="Factory Zero home"><span class="o" aria-hidden="true"></span>Factory Zero<span class="wm-k" aria-hidden="true">FZ/01</span></a>
  <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="site-nav">MENU</button>
  <nav class="site-nav" id="site-nav" aria-label="Primary">
${links}
    <a class="enter" href="/enter/">Enter <span aria-hidden="true">&rarr;</span></a>
  </nav>
</header>`;
}

const GH_ICON = '<svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" focusable="false"><path fill="currentColor" d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z"/></svg>';

// The footer is the same on every page; the venture column is the FZ STACK.
function footer(stackVentures, slug) {
  const stack = stackVentures.slice(0, 7).map(v =>
    `          <li><a href="/ventures/${slug(v)}/">${esc(v.name)}</a></li>`).join('\n');
  return `<footer class="site-footer">
  <div class="wrap">
    <div class="foot-grid">
      <div class="foot-brand">
        <a class="wordmark" href="/" aria-label="Factory Zero home"><span class="o" aria-hidden="true"></span>Factory Zero</a>
        <p>An AI-native venture studio. Each venture is its own company; together they form the foundation of the autonomous organization.</p>
      </div>
      <div class="foot-col">
        <h3>Factory</h3>
        <ul>
          <li><a href="/venture-as-a-service/">Services</a></li>
          <li><a href="/ventures/">Ventures</a></li>
          <li><a href="/stack/">Stack</a></li>
          <li><a href="/system/">System</a></li>
          <li><a href="/technology/">Technology</a></li>
        </ul>
      </div>
      <div class="foot-col">
        <h3>Read</h3>
        <ul>
          <li><a href="/thesis/">Thesis</a></li>
          <li><a href="/about/">About</a></li>
          <li><a href="/#films">Films</a></li>
          <li><a href="/llms.txt">llms.txt</a></li>
        </ul>
      </div>
      <div class="foot-col">
        <h3>The FZ stack</h3>
        <ul>
${stack}
          <li><a href="/stack/">All of it &rarr;</a></li>
        </ul>
      </div>
    </div>
    <div class="foot-legal">
      <span>FACTORY0.VENTURES &middot; FZ/01 &middot; <span id="fz-year">2026</span></span>
      <span>Images: MiniMax image-01 &middot; motion: MiniMax Hailuo-2.3</span>
      <a href="https://github.com/Factory-Zero" rel="noopener" aria-label="Factory Zero on GitHub" title="GitHub">${GH_ICON}</a>
    </div>
  </div>
</footer>`;
}

// A venture's icon: its animated mark, or its initial when it has none.
function icon(v, size) {
  return v.logo
    ? `<img src="/assets/${esc(v.logo)}" alt="" width="${size}" height="${Math.round(size * (v.logoH || 1) / (v.logoW || 1))}" loading="lazy" decoding="async">`
    : `<span class="vicon--mono" aria-hidden="true">${esc(v.name.slice(0, 1))}</span>`;
}

const ARROW = '<svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true"><path d="M3 8h9M8 3.5 12.5 8 8 12.5" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>';

// The app-store card. data-* drive the filters in fz-ui.js.
function vcard(v, { slug, pitch, i = 0 }) {
  const line = (pitch(v).solution || v.desc || '');
  const q = [v.name, v.id, v.category, v.stackRole, v.site, line].filter(Boolean).join(' ').toLowerCase();
  return `<li><a class="vcard" href="/ventures/${slug(v)}/" data-stage="${esc(v.stage)}" data-stack="${v.stack ? 1 : 0}" data-os="${v.open_source ? 1 : 0}" data-cat="${esc(v.category)}" data-q="${esc(q)}" data-rv style="--d:${i % 6}">
  <span class="vcard-top"><span class="vicon${v.logo ? '' : ' vicon--mono'}">${icon(v, 46)}</span><span class="vid">${esc(v.id)}</span></span>
  <span class="vname">${esc(v.name)}</span>
  <span class="vcat">${esc(v.category)}</span>
  <span class="vdesc">${esc(line)}</span>
  <span class="chips"><span class="chip">${esc(v.stage)}</span>${v.stack ? `<span class="chip chip--acc">FZ stack</span>` : ''}${v.open_source ? `<span class="chip" title="${esc(v.license || '')} licence">Open source</span>` : ''}</span>
  <span class="vgo" aria-hidden="true">${ARROW}</span>
</a></li>`;
}

// Filter row above a grid: stage, FZ STACK, and a search box.
function vtools(V) {
  const stages = [...new Set(V.map(v => v.stage))];
  const n = s => V.filter(v => v.stage === s).length;
  const btn = (key, label, count, on) =>
    `<button type="button" data-f="${esc(key)}" aria-pressed="${on}">${esc(label)}<span class="n">${count}</span></button>`;
  return `<div class="vtools">
  <div class="vfilter" role="group" aria-label="Filter the ventures">
    ${btn('all', 'All', V.length, true)}
    ${btn('stack', 'FZ stack', V.filter(v => v.stack).length, false)}
    ${btn('os', 'Open source', V.filter(v => v.open_source).length, false)}
    ${stages.map(s => btn('stage:' + s, s.charAt(0) + s.slice(1).toLowerCase(), n(s), false)).join('\n    ')}
  </div>
  <label class="vsearch"><span class="vh">Search the ventures</span><svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="7" cy="7" r="5" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="m11 11 3.5 3.5" stroke="currentColor" stroke-width="1.5"/></svg><input type="search" placeholder="Search ${V.length} ventures" autocomplete="off" data-vsearch></label>
</div>`;
}

module.exports = { esc, headAssets, header, footer, icon, vcard, vtools, ARROW, FONTS };
