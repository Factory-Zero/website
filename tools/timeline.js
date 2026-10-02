/* Renders the home-page venture timeline as static SVG from
 * assets/timeline-data.json and the ventures in assets/fz-data.js.
 * Called by tools/sync-ventures.js, which writes the result between the
 * fz:timeline markers in index.html. The markup is the finished state (every
 * logo and every day's commits showing), so it reads with JavaScript off;
 * assets/fz-timeline.js only animates it.
 *
 * One row per venture, in the order the GitHub orgs were created. The logo and
 * name sit on the day its org was created; the ticks under the row are commits per day
 * across the org's repositories (bots excluded), height on a square-root scale
 * so a 1-commit day still shows next to a 200-commit one.
 */
'use strict';

const DAY = 86400000;
const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEPT', 'OCT', 'NOV', 'DEC'];

const esc = s => String(s == null ? '' : s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;')
  .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const ts = d => Date.parse(d + 'T00:00:00Z');
const iso = t => new Date(t).toISOString().slice(0, 10);
const label = d => { const x = new Date(ts(d)); return `${x.getUTCDate()} ${MONTHS[x.getUTCMonth()]}`; };
const labelY = d => `${label(d)} ${d.slice(0, 4)}`;
const owner = u => new URL(u).pathname.split('/')[1].toLowerCase();
const r1 = n => Math.round(n * 10) / 10;

module.exports = function timeline(ventures, data, slug) {
  return { svg: render(ventures, data, slug), range: `${label(data.start)} &ndash; ${labelY(data.end)}` };
};

function render(ventures, data, slug) {
  // geometry, in viewBox units
  const W = 1200, PADL = 10, PADR = 14, AXIS = 34, ROW = 22, LOGO = 16, TICK_W = 3, TICK_H = 14, NAME_W = 150;
  const start = ts(data.start), end = ts(data.end);
  const n = Math.round((end - start) / DAY) + 1;
  const x0 = PADL + LOGO / 2, x1 = W - PADR - LOGO / 2;
  const step = (x1 - x0) / (n - 1);
  const X = d => r1(x0 + Math.round((ts(d) - start) / DAY) * step);
  const idx = d => Math.round((ts(d) - start) / DAY);

  const rows = [];
  for (const v of ventures) {
    const rec = (v.github || []).map(([, u]) => data.orgs[owner(u)]).find(Boolean);
    if (!rec) continue;
    rows.push({ v, rec });
  }
  rows.sort((a, b) => a.rec.created.localeCompare(b.rec.created) || a.v.id.localeCompare(b.v.id));

  let max = 1;
  for (const { rec } of rows) for (const d in rec.days) max = Math.max(max, rec.days[d]);
  const H = AXIS + rows.length * ROW + 6;

  const out = [];
  out.push(`<svg class="tl-svg" viewBox="0 0 ${W} ${H}" role="group" aria-labelledby="tl-title tl-desc" data-days="${n}" data-window="${label(data.start)} – ${label(data.end)}" data-x0="${r1(x0)}" data-step="${step.toFixed(4)}">`);
  out.push(`  <title id="tl-title">When each venture started, and its commits per day</title>`);
  out.push(`  <desc id="tl-desc">${rows.length} ventures from ${labelY(data.start)} to ${labelY(data.end)}. Each row is one venture; its logo marks the day its GitHub organization was created, and the ticks are commits per day across its repositories.</desc>`);

  // axis: a month label at each month's first day (and at the start), a day
  // number every 7 days, and a faint rule at each month boundary
  out.push(`  <g class="tl-axis" aria-hidden="true">`);
  for (let t = start; t <= end; t += DAY) {
    const d = iso(t), day = new Date(t).getUTCDate(), i = idx(d), x = X(d);
    if (day === 1 || t === start) {
      out.push(`    <text class="tl-month" x="${x}" y="11">${MONTHS[new Date(t).getUTCMonth()]}</text>`);
      if (t !== start) out.push(`    <line class="tl-rule" x1="${x}" x2="${x}" y1="16" y2="${H}"/>`);
    }
    if (i % 7 === 0 || t === end) out.push(`    <text class="tl-day" x="${x}" y="26">${day}</text>`);
  }
  out.push(`  </g>`);

  rows.forEach(({ v, rec }, r) => {
    const y = AXIS + r * ROW, base = y + ROW - 4, mid = y + ROW / 2;
    const c = rec.created < data.start ? data.start : rec.created;
    const tip = `${v.name} · org created ${labelY(rec.created)} · ${rec.total.toLocaleString('en-US')} commit${rec.total === 1 ? '' : 's'}, ${label(data.start)} to ${label(data.end)}`;
    out.push(`  <a class="tl-row" href="/ventures/${slug(v)}/" aria-label="${esc(tip)}" data-name="${esc(v.name)}" data-created="${esc(labelY(rec.created))}" data-total="${rec.total}" data-at="${idx(c)}">`);
    out.push(`    <title>${esc(tip)}</title>`);
    out.push(`    <rect class="tl-hit" x="0" y="${y}" width="${W}" height="${ROW}"/>`);
    out.push(`    <line class="tl-lane" data-i="${idx(c)}" x1="${X(c)}" x2="${x1}" y1="${base}" y2="${base}"/>`);
    for (const d of Object.keys(rec.days).sort()) {
      if (d < data.start || d > data.end) continue;
      const h = r1(Math.max(1.5, Math.sqrt(rec.days[d] / max) * TICK_H));
      out.push(`    <rect class="tl-tick" data-i="${idx(d)}" x="${r1(X(d) - TICK_W / 2)}" y="${r1(base - h)}" width="${TICK_W}" height="${h}"/>`);
    }
    const mark = v.logo
      ? `<image href="/assets/${esc(v.logo)}" x="${r1(X(c) - LOGO / 2)}" y="${r1(mid - LOGO / 2)}" width="${LOGO}" height="${LOGO}"/>`
      : `<circle class="tl-dot" cx="${X(c)}" cy="${mid}" r="3"/>`;
    // the name sits beside the logo: after it, or before it near the right edge
    const after = X(c) + NAME_W < W;
    out.push(`    <text class="tl-name" data-i="${idx(c)}" x="${r1(X(c) + (after ? 1 : -1) * (LOGO / 2 + 6))}" y="${r1(mid + 3.5)}"${after ? '' : ' text-anchor="end"'}>${esc(v.name)}</text>`);
    out.push(`    <g class="tl-logo" data-i="${idx(c)}"><rect x="${r1(X(c) - LOGO / 2 - 2)}" y="${r1(mid - LOGO / 2 - 2)}" width="${LOGO + 4}" height="${LOGO + 4}"/>${mark}</g>`);
    out.push(`  </a>`);
  });

  out.push(`  <line class="tl-head" x1="${x0}" x2="${x0}" y1="16" y2="${H}" aria-hidden="true"/>`);
  out.push(`</svg>`);
  return out.join('\n');
};
