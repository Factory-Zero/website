'use strict';
/* The home hero's block scene: the Factory Zero stack drawn as isometric stone blocks.
 *
 * Called by tools/sync-ventures.js, which writes the result into index.html between the
 * fz:heroscene markers. Pure functions of the data: no randomness, no network.
 *
 *   heroScene({ root, stack, slugOf, prompts }) -> { html, names }
 *
 * Each block is three faces (top, left, right) filled with one shared stone texture
 * (assets/ui/block-stone.webp, a seamless tile), shaded per face. The venture's logo is
 * carved into the top face: its mark is drawn in the face's own plane with a lit lower
 * edge and a dark recess, so it reads as cut into the stone, not stuck on it.
 */
const fs = require('fs');
const path = require('path');

const L = 100;          // cell edge, in scene units
const H = 92;           // one storey
const G = 0.07;         // gap between blocks, in cells
const SQ = Math.sqrt(3) / 2;
// The 5 x 4 floor plan. Each stack venture appears exactly once (checked below).
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

function heroScene({ root, stack, slugOf, prompts }) {
  const byId = new Map(stack.map(v => [v.id, v]));
  const placed = LAYOUT.flat().filter(Boolean);
  if (placed.length !== stack.length || new Set(placed).size !== placed.length) {
    throw new Error('hero-scene: the LAYOUT must place every stack venture exactly once');
  }
  for (const id of placed) if (!byId.has(id)) throw new Error(`hero-scene: LAYOUT names ${id}, which is not a stack venture`);

  const symbols = [], patterns = [], blocks = [], labels = [];
  const boxes = [];
  // Ground plate under the whole floor plan.
  // The floor plate follows the stepped outline of the rows: no empty cell inside the plan.
  const widths = LAYOUT.map(r => r.length), R = LAYOUT.length;
  const ground = [[0, 0], [widths[0], 0]];
  for (let j = 0; j < R - 1; j++) ground.push([widths[j], j + 1], [widths[j + 1], j + 1]);
  ground.push([widths[R - 1], R], [0, R]);
  const gp = ground.map(([x, y]) => P(x, y, 0));
  boxes.push(...gp);

  const cells = [];
  LAYOUT.forEach((row, j) => row.forEach((id, i) => { if (id) cells.push({ id, i, j }); }));
  cells.sort((a, b) => (a.i + a.j) - (b.i + b.j) || a.j - b.j);

  const names = {};
  const tags = [];
  cells.forEach(({ id, i, j }, n) => {
    const v = byId.get(id);
    const slug = slugOf(v);
    const h = v.stackGroup === 'The foundation' ? 2 : 1;          // the foundation stands two storeys high
    const x0 = i + G, x1 = i + 1 - G, y0 = j + G, y1 = j + 1 - G, w = x1 - x0;
    const top = z => [P(x0, y0, z), P(x1, y0, z), P(x1, y1, z), P(x0, y1, z)];
    const left = [P(x0, y1, h), P(x1, y1, h), P(x1, y1, 0), P(x0, y1, 0)];
    const right = [P(x1, y0, h), P(x1, y1, h), P(x1, y1, 0), P(x1, y0, 0)];
    const tp = top(h);
    boxes.push(...tp, ...left, ...right);
    names[id] = v.name;

    // The logo, carved into the top face: the mark is mapped onto the face's own plane.
    const sid = `hb-mk-${slug}`;
    const logoFile = path.join(root, 'assets', v.logo);
    symbols.push(carve(sid, logoFile));
    const ox = SQ * L * (x0 - y0), oy = 0.5 * L * (x0 + y0) - h * H;
    const m = [SQ * L * w, 0.5 * L * w, -SQ * L * w, 0.5 * L * w, num(ox), num(oy)].map(num).join(' ');
    const mk = 0.6, mo = (1 - mk) / 2, rim = 0.022;
    const pat = `hb-st-${n}`;
    const px = (n * 97) % 200, py = (n * 131) % 200;
    patterns.push(`<pattern id="${pat}" patternUnits="userSpaceOnUse" x="${px}" y="${py}" width="200" height="200"><image href="/assets/ui/block-stone.webp" width="200" height="200" preserveAspectRatio="none"/></pattern>`);
    // The name tag sits above the top face, in a top layer drawn after every block.
    const cc = P((x0 + x1) / 2, (y0 + y1) / 2, h);
    const tw = v.name.length * 9.8 + 18, tx = cc[0], ty = cc[1] - 30;
    tags.push({ id, name: v.name, x: tx, y: ty, w: tw });
    boxes.push([tx - tw / 2, ty - 12], [tx + tw / 2, ty + 12]);
    blocks.push(`    <g class="hb" data-venture="${esc(id)}" data-name="${esc(v.name)}">
      <a href="/ventures/${esc(slug)}/" tabindex="-1">
        <polygon class="hb-face hb-left" points="${pts(left)}" fill="#1b1e1b"/><polygon class="hb-tex" points="${pts(left)}" fill="url(#${pat})"/><polygon class="hb-shade" points="${pts(left)}" fill="rgba(0,0,0,.2)"/>
        <polygon class="hb-face hb-right" points="${pts(right)}" fill="#0d0f0d"/><polygon class="hb-tex" points="${pts(right)}" fill="url(#${pat})"/><polygon class="hb-shade" points="${pts(right)}" fill="rgba(0,0,0,.52)"/>
        <polygon class="hb-face hb-top" points="${pts(tp)}" fill="#2a2e29"/><polygon class="hb-tex" points="${pts(tp)}" fill="url(#${pat})"/><polygon class="hb-shade" points="${pts(tp)}" fill="rgba(237,239,232,.13)"/>
        <polygon class="hb-edge" points="${pts(tp)}" fill="none"/>
        <g transform="matrix(${m})">
          <use class="hb-rim" href="#${sid}" x="${(mo + rim).toFixed(3)}" y="${(mo + rim).toFixed(3)}" width="${mk}" height="${mk}"/>
          <use class="hb-cut" href="#${sid}" x="${mo}" y="${mo}" width="${mk}" height="${mk}"/>
        </g>
      </a>
    </g>`);
  });

  // The floor plate, the blocks back to front, then the labels (in the blocks' groups).
  const vbMinX = Math.min(...boxes.map(p => p[0])) - 40, vbMaxX = Math.max(...boxes.map(p => p[0])) + 40;
  const vbMinY = Math.min(...boxes.map(p => p[1])) - 30, vbMaxY = Math.max(...boxes.map(p => p[1])) + 34;
  const vb = [num(vbMinX), num(vbMinY), num(vbMaxX - vbMinX), num(vbMaxY - vbMinY)].join(' ');
  const plate = `<polygon class="hb-plate" points="${pts(gp)}"/>`;
  const svg = `<svg class="hb-svg" viewBox="${vb}" aria-hidden="true" focusable="false">
  <defs>
    ${symbols.join('\n    ')}
    ${patterns.join('\n    ')}
  </defs>
  ${plate}
${blocks.join('\n')}
<g class="hb-tags">${tags.map(t => `<g class="hb-tag" data-venture="${esc(t.id)}"><rect x="${num(t.x - t.w / 2)}" y="${num(t.y - 12)}" width="${num(t.w)}" height="24"/><text x="${num(t.x)}" y="${num(t.y + 1)}" text-anchor="middle" dominant-baseline="central">${esc(t.name)}</text></g>`).join('')}</g>
</svg>`;

  // The first prompt is what the static page shows, with its blocks lit.
  const first = prompts[0];
  const built = `→ built with: ${first.ventures.map(id => names[id]).join(' · ')}`;
  const litAtStart = new Set(first.ventures);
  const html = `<!-- The scene and prompt bar. The first prompt is lit so the static page reads
     without JavaScript; tools/sync-ventures.js writes it, assets/fz-ui.js types the rest. -->
  <div class="hb-scene has-lit" data-hero-scene data-prompt="0">
    <div class="hb-prompt">
      <span class="hb-chev" aria-hidden="true">&rsaquo;</span>
      <p class="hb-typed" aria-live="off"><span data-typed>${esc(first.text)}</span><span class="hb-caret" aria-hidden="true"></span></p>
    </div>
${svg.replace(/<g class="(hb|hb-tag)" data-venture="([^"]+)"/g, (m, cls, id) => litAtStart.has(id) ? `<g class="${cls} is-lit" data-venture="${id}"` : m)}
    <p class="hb-built" aria-live="off" data-built>${esc(built)}</p>
  </div>`;
  return { html, names };
}

module.exports = { heroScene, LAYOUT };
