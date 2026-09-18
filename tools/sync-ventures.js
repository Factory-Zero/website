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
const gh = v => v.github || [];

function row(v, i) {
  const c = STATUS_COLOR[v.status] || '#8A8A8E';
  const mark = v.logo
    ? `<img class="venture-logo" src="/assets/${esc(v.logo)}" alt="" width="30" height="${Math.round(30 * (v.logoH || 1) / (v.logoW || 1))}">`
    : '';
  return `      <button type="button" class="record registry-cols" aria-pressed="${i === 0}" aria-controls="d-record"
        data-id="${esc(v.id)}" data-name="${esc(v.name)}" data-status="${esc(v.status)}" data-status-color="${c}"
        data-category="${esc(v.category)}" data-autonomy="${v.autonomy == null ? '' : v.autonomy}"
        data-target="${v.target == null ? '' : v.target}" data-aim-operate="${esc(aims(v).operate)}"
        data-aim-intelligence="${esc(aims(v).intelligence)}" data-aim-growth="${esc(aims(v).growth)}"
        data-github="${esc(JSON.stringify(gh(v)))}"
        data-launched="${esc(v.launched || 'NOT YET')}" data-stage="${esc(v.stage)}" data-site="${esc(v.site)}"
        data-logo="${esc(v.logo || '')}" data-logo-w="${v.logoW || ''}" data-logo-h="${v.logoH || ''}" data-desc="${esc(v.desc)}">
        <span class="rid">${esc(v.id)}</span>
        <span class="name">${mark}${esc(v.name)}</span>
        <span class="status${pulses(v.status) ? ' is-live' : ''}" style="color:${c}"><span class="dot"></span>${esc(v.status)}</span>
        <span class="cat">${esc(v.category)}</span>
        <span class="aut">${targetShort(v)}</span>
      </button>`;
}

function chip(v) {
  const c = STATUS_COLOR[v.status] || '#8A8A8E';
  return `        <a href="/ventures/"><span class="id">${esc(v.id)}</span><span style="color:${c}">${esc(v.status)}</span></a>`;
}

function detail(v) {
  const c = STATUS_COLOR[v.status] || '#8A8A8E';
  const hasSite = Boolean(v.site);
  const logo = v.logo
    ? `<img id="d-logo" class="venture-logo venture-logo--lg" src="/assets/${esc(v.logo)}" alt="${esc(v.name)} logo" width="120" height="${Math.round(120 * (v.logoH || 1) / (v.logoW || 1))}">`
    : `<img id="d-logo" class="venture-logo venture-logo--lg" alt="" hidden>`;
  return `      <div class="detail-id"><span id="d-id">${esc(v.id)}</span>${logo}</div>
      <h2 class="detail-name" id="d-name">${esc(v.name)}</h2>
      <p class="detail-desc" id="d-desc">${esc(v.desc)}</p>
      <a class="detail-link" id="d-link"${hasSite ? ` href="https://${esc(v.site)}"` : ' aria-disabled="true"'}>${
        hasSite ? esc(v.site.toUpperCase()) + ' &rarr;' : 'NO PUBLIC SURFACE YET'}</a>`;
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
        <div class="wide inherit"><dt>INHERITED FROM FACTORY</dt><dd>IDENTITY &middot; BILLING &middot; DEPLOYMENT &middot; OBSERVABILITY &middot; SUPPORT &middot; ANALYTICS &middot; SECURITY</dd></div>`;
}

function replaceRegion(src, key, body) {
  const re = new RegExp(`(<!-- fz:${key}:start -->)[\\s\\S]*?(<!-- fz:${key}:end -->)`);
  if (!re.test(src)) throw new Error(`region fz:${key} not found`);
  return src.replace(re, `$1\n${body}\n$2`);
}

const live = V.filter(v => v.status !== 'ARCHIVED');

// ventures/index.html
const vp = path.join(ROOT, 'ventures/index.html');
let vs = fs.readFileSync(vp, 'utf8');
vs = replaceRegion(vs, 'registry', V.map(row).join('\n'));
vs = replaceRegion(vs, 'detail', detail(V[0]));
vs = replaceRegion(vs, 'spec', spec(V[0]));
const COUNT_RE = /(id="fz-count"[^>]*>)[^<]*/;
if (!COUNT_RE.test(vs)) throw new Error('fz-count marker not found in ventures/index.html');
vs = vs.replace(COUNT_RE,
  `$1${String(V.length).padStart(2, '0')} RECORDS &middot; ${
    String(V.filter(v => v.status === 'LIVE' || v.status === 'SCALING').length).padStart(2, '0')} LIVE`);
vs = vs.replace(/(RECORD \/ )FZ-\d+/, `$1${V[0].id}`);
fs.writeFileSync(vp, vs);

// index.html: the static hero placeholders must not drift from the data,
// since that is what crawlers and no-JS visitors read.
const hp = path.join(ROOT, 'index.html');
let hs = fs.readFileSync(hp, 'utf8');
for (const [re, val, label] of [
  [/(id="fz-ventures"[^>]*>)[^<]*/, `${String(live.length).padStart(2, '0')} ACTIVE`, 'fz-ventures'],
  [/(id="fz-pipeline-count"[^>]*>)[^<]*/, `LINE 01 &middot; ${String(live.length).padStart(2, '0')} UNITS IN PROCESS`, 'fz-pipeline-count'],
]) {
  if (!re.test(hs)) throw new Error(`${label} marker not found in index.html`);
  hs = hs.replace(re, `$1${val}`);
}
fs.writeFileSync(hp, hs);

// system/index.html
const sp = path.join(ROOT, 'system/index.html');
let ss = fs.readFileSync(sp, 'utf8');
ss = replaceRegion(ss, 'ventures', live.map(chip).join('\n'));
fs.writeFileSync(sp, ss);

console.log(`synced ${V.length} records into ventures/index.html and ${live.length} into system/index.html`);
