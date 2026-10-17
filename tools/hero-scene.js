'use strict';
/* The home hero's block scene and the background layers behind the home page.
 *
 * Called by tools/sync-ventures.js, which writes the lit scene, the prompt bar and the logo
 * symbols into index.html (fz:heroscene). Pure functions of the data: no randomness, no network.
 */
const fs = require('fs');
const path = require('path');

const L = 100;          // cell edge, in scene units
const H = 92;           // one storey
const G = 0.07;         // gap between blocks, in cells
const SQ = Math.sqrt(3) / 2;
// The 5-4-4-4 floor plan (17 stack ventures). Each stack venture appears exactly once.
const LAYOUT = [
  ["FZ-013", "FZ-004", "FZ-006", "FZ-016", "FZ-012"],
  ["FZ-018", "FZ-021", "FZ-020", "FZ-008"],
  ["FZ-001", "FZ-022", "FZ-023", "FZ-011"],
  ["FZ-009", "FZ-005", "FZ-019", "FZ-017"],
];
const num = n => +n.toFixed(2);
const P = (x, y, z) => [num((x - y) * SQ * L), num((x + y) * 0.5 * L - z * H)];
const pts = a => a.map(p => p.join(',')).join(' ');
const attrsOf = s => { const o = {}; s.replace(/([\w:-]+)="([^"]*)"/g, (m, k, v) => { o[k] = v; return m; }); return o; };
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');

// Reads a logo SVG and returns a <symbol> whose shapes take the current colour, so one
// symbol can be carved in several colours with CSS. Animation and style are dropped.
function carve(id, file) {
  const txt = fs.readFileSync(file, 'utf8');
  const vb = (txt.match(/viewBox="([^"]+)"/) || [0, '0 0 120 120'])[1];
  let body = txt.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '')
    .replace(/<title>[\s\S]*?<\/title>|<desc>[\s\S]*?<\/desc>|<style>[\s\S]*?<\/style>|<defs>[\s\S]*?<\/defs>|<!--[\s\S]*?-->/g, '');
  body = body.replace(/<(rect|circle|ellipse|path|polygon|polyline|line|g)\b([^>]*?)(\/?)>/g, (m, tag, attrs, slash) => {
    const a = attrsOf(attrs);
    if (tag === 'g') return a.transform ? `<g transform="${a.transform}">` : '<g>';
    const drop = ['class', 'style', 'opacity', 'fill-opacity', 'stroke-opacity', 'fill', 'stroke'];
    const keep = Object.entries(a).filter(([k]) => !drop.includes(k)).map(([k, v]) => `${k}="${v}"`);
    let paint;
    if (tag === 'line') paint = `fill="none" stroke="currentColor" stroke-width="${a['stroke-width'] || 2}"`;
    else if (a.fill === 'none') paint = `fill="none" stroke="currentColor" stroke-width="${a['stroke-width'] || 1.5}"`;
    else paint = 'fill="currentColor" stroke="none"';
    return `<${tag} ${keep.join(' ')} ${paint}${slash}>`;
  });
  return `<symbol id="${id}" viewBox="${vb}">${body}</symbol>`;
}

// One symbol per live venture, id gl-<slug>. Used by the scene and by the page-wide grid.
function heroSymbols({ root, ventures, slugOf }) {
  const syms = ventures.map(v => carve(`gl-${slugOf(v)}`, path.join(root, 'assets', v.logo)));
  return `<svg class="hb-defs" aria-hidden="true" focusable="false" width="0" height="0"><defs>\n${syms.join('\n')}\n</defs></svg>`;
}

// The floor plan: row widths, the stepped outline, and the iso points of the plate.
function floor() {
  const widths = LAYOUT.map(r => r.length), R = LAYOUT.length, W = Math.max(...widths);
  const outline = [[0, 0], [widths[0], 0]];
  for (let j = 0; j < R - 1; j++) outline.push([widths[j], j + 1], [widths[j + 1], j + 1]);
  outline.push([widths[R - 1], R], [0, R]);
  return { widths, R, W, outline, plate: outline.map(([x, y]) => P(x, y, 0)) };
}

// One block's geometry: its top, left and right faces and the centre of its top face.
function geom(i, j, h) {
  const x0 = i + G, x1 = i + 1 - G, y0 = j + G, y1 = j + 1 - G;
  return {
    x0, x1, y0, y1, w: x1 - x0, h,
    tp: [P(x0, y0, h), P(x1, y0, h), P(x1, y1, h), P(x0, y1, h)],
    left: [P(x0, y1, h), P(x1, y1, h), P(x1, y1, 0), P(x0, y1, 0)],
    right: [P(x1, y0, h), P(x1, y1, h), P(x1, y1, 0), P(x1, y0, 0)],
    cc: P((x0 + x1) / 2, (y0 + y1) / 2, h),
  };
}

const faceMarkup = (g, pat, top = 'rgba(237,239,232,.13)') =>
  `<polygon class="hb-face hb-left" points="${pts(g.left)}" fill="#1b1e1b"/><polygon class="hb-tex" points="${pts(g.left)}" fill="url(#${pat})"/><polygon class="hb-shade" points="${pts(g.left)}" fill="rgba(0,0,0,.2)"/>` +
  `<polygon class="hb-face hb-right" points="${pts(g.right)}" fill="#0d0f0d"/><polygon class="hb-tex" points="${pts(g.right)}" fill="url(#${pat})"/><polygon class="hb-shade" points="${pts(g.right)}" fill="rgba(0,0,0,.52)"/>` +
  `<polygon class="hb-face hb-top" points="${pts(g.tp)}" fill="#2a2e29"/><polygon class="hb-tex" points="${pts(g.tp)}" fill="url(#${pat})"/><polygon class="hb-shade" points="${pts(g.tp)}" fill="${top}"/>`;
const patDef = (id, n) => `<pattern id="${id}" patternUnits="userSpaceOnUse" x="${(n * 97) % 200}" y="${(n * 131) % 200}" width="200" height="200"><image href="/assets/ui/block-stone.webp" width="200" height="200" preserveAspectRatio="none"/></pattern>`;

// The cells in painter order (back to front), with each stack venture's storey count.
function cellsOf(stack) {
  const byId = new Map(stack.map(v => [v.id, v]));
  const placed = LAYOUT.flat();
  if (placed.length !== stack.length || new Set(placed).size !== placed.length) {
    throw new Error('hero-scene: the LAYOUT must place every stack venture exactly once');
  }
  for (const id of placed) if (!byId.has(id)) throw new Error(`hero-scene: LAYOUT names ${id}, which is not a stack venture`);
  const cells = [];
  LAYOUT.forEach((row, j) => row.forEach((id, i) => { if (id) cells.push({ id, i, j, v: byId.get(id) }); }));
  cells.sort((a, b) => (a.i + a.j) - (b.i + b.j) || a.j - b.j);
  return cells;
}

// The lit scene: the stack blocks with their carved logos, floor seams that pulse, a spark
// that runs from the floor's front corner to each block, and the prompt bar.
function heroScene({ stack, slugOf, prompts }) {
  const F = floor();
  const cells = cellsOf(stack);
  const origin = F.plate[F.plate.length - 2];             // the front corner of the plate
  const boxes = [...F.plate];
  const seams = [];
  // Floor seams: the grid lines inside the stepped plate, the travelling pulses on every third.
  for (let i = 1; i < F.W; i++) {
    const k = F.widths.filter(w => w >= i).length;
    seams.push([P(i, 0, 0), P(i, k, 0)]);
  }
  for (let j = 1; j < F.R; j++) seams.push([P(0, j, 0), P(Math.min(F.widths[j - 1], F.widths[j]), j, 0)]);
  const seamLines = seams.map(([a, b], k) =>
    `<line class="hb-seam${k % 3 === 0 ? ' hb-pulse' : ''}" style="--s:${k}" x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}"/>`).join('');

  const blocks = [], sparks = [], tags = [], names = {};
  cells.forEach(({ id, i, j, v }, n) => {
    const slug = slugOf(v);
    const g = geom(i, j, v.stackGroup === 'The foundation' ? 2 : 1);  // the foundation stands two storeys high
    boxes.push(...g.tp, ...g.left, ...g.right);
    names[id] = v.name;
    const pat = `hb-st-${n}`;
    const sid = `gl-${slug}`;
    const mk = 0.6, mo = (1 - mk) / 2, rim = 0.022;
    const ox = SQ * L * (g.x0 - g.y0), oy = 0.5 * L * (g.x0 + g.y0) - g.h * H;
    const m = [SQ * L * g.w, 0.5 * L * g.w, -SQ * L * g.w, 0.5 * L * g.w, num(ox), num(oy)].map(num).join(' ');
    const tw = v.name.length * 9.8 + 18, tx = g.cc[0], ty = g.cc[1] - 30;
    tags.push({ id, name: v.name, x: tx, y: ty, w: tw });
    boxes.push([tx - tw / 2, ty - 12], [tx + tw / 2, ty + 12]);
    sparks.push(`<circle class="hb-spark" data-venture="${esc(id)}" cx="${origin[0]}" cy="${origin[1]}" r="4.5" style="--tx:${num(g.cc[0] - origin[0])}px;--ty:${num(g.cc[1] - origin[1])}px"/>`);
    blocks.push(`    <g class="hb" data-venture="${esc(id)}" data-name="${esc(v.name)}" data-pat="${pat}">
      <a href="/ventures/${esc(slug)}/" tabindex="-1"><g class="hb-bob" style="--d:${n}">
        ${faceMarkup(g, pat)}
        <polygon class="hb-edge" points="${pts(g.tp)}" fill="none"/>
        <g transform="matrix(${m})">
          <use class="hb-rim" href="#${sid}" x="${(mo + rim).toFixed(3)}" y="${(mo + rim).toFixed(3)}" width="${mk}" height="${mk}"/>
          <use class="hb-cut" href="#${sid}" x="${mo}" y="${mo}" width="${mk}" height="${mk}"/>
        </g>
      </g></a>
    </g>`);
  });
  const patterns = cells.map((c, n) => patDef(`hb-st-${n}`, n)).join('\n    ');

  const vbMinX = Math.min(...boxes.map(p => p[0])) - 40, vbMaxX = Math.max(...boxes.map(p => p[0])) + 40;
  const vbMinY = Math.min(...boxes.map(p => p[1])) - 30, vbMaxY = Math.max(...boxes.map(p => p[1])) + 34;
  const vb = [num(vbMinX), num(vbMinY), num(vbMaxX - vbMinX), num(vbMaxY - vbMinY)].join(' ');
  const svg = `<svg class="hb-svg" viewBox="${vb}" aria-hidden="true" focusable="false">
  <defs>
    ${patterns}
  </defs>
  <polygon class="hb-plate" points="${pts(F.plate)}"/>
  <g class="hb-seams">${seamLines}</g>
${blocks.join('\n')}
<g class="hb-sparks">${sparks.join('')}</g>
<g class="hb-tags">${tags.map(t => `<g class="hb-tag" data-venture="${esc(t.id)}"><rect x="${num(t.x - t.w / 2)}" y="${num(t.y - 12)}" width="${num(t.w)}" height="24"/><text x="${num(t.x)}" y="${num(t.y + 1)}" text-anchor="middle" dominant-baseline="central">${esc(t.name)}</text></g>`).join('')}</g>
</svg>`;

  // The first prompt is what the static page shows, with its blocks lit.
  const first = prompts[0];
  const built = `→ built with: ${first.ventures.map(id => names[id]).join(' · ')}`;
  const litAtStart = new Set(first.ventures);
  const html = `<!-- The lit scene and prompt bar. The first prompt is lit so the static page reads
     without JavaScript; tools/sync-ventures.js writes it, assets/fz-ui.js types the rest. -->
  <div class="hb-scene has-lit" data-hero-scene data-prompt="0">
    <div class="hb-prompt" data-hero-prompt>
      <span class="hb-chev" aria-hidden="true">&rsaquo;</span>
      <p class="hb-typed" aria-live="off"><span data-typed>${esc(first.text)}</span><span class="hb-caret" aria-hidden="true"></span></p>
    </div>
${svg.replace(/<g class="(hb|hb-tag)" data-venture="([^"]+)"/g, (m, cls, id) => litAtStart.has(id) ? `<g class="${cls} is-lit" data-venture="${id}"` : m)}
    <p class="hb-built" aria-live="off" data-built>${esc(built)}</p>
  </div>`;
  return { html, names };
}

module.exports = { heroSymbols, heroScene, LAYOUT };
