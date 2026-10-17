/* Factory Zero UI behaviour, for pages on assets/fz-ui.css. Dependency-free.
   - scroll reveal and count-up (only when motion is allowed)
   - the hero loop video (never with reduced motion or data saver)
   - venture grid filters and search
   - the home page's live GitHub log, merged-PR count and authors chart
   Everything degrades to the static HTML, which is complete on its own. */
(function () {
  'use strict';
  var root = document.documentElement;
  var calm = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var saveData = navigator.connection && navigator.connection.saveData;
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }

  /* ---------- reveal + count-up ---------- */
  var rv = $$('[data-rv]');
  var counters = $$('[data-count]');
  function countUp(el) {
    var to = Number(el.getAttribute('data-count')), pad = el.textContent.trim().length;
    var t0 = null, dur = 1100;
    function step(t) {
      if (!t0) t0 = t;
      var k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3);
      el.textContent = String(Math.round(to * e)).padStart(pad, '0');
      if (k < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  if (!calm && 'IntersectionObserver' in window) {
    root.classList.add('rv-on');
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('in');
        var c = e.target.matches('[data-count]') ? e.target : e.target.querySelector('[data-count]');
        if (c && !c.dataset.done) { c.dataset.done = '1'; countUp(c); }
        io.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    rv.forEach(function (n) { io.observe(n); });
    // a reveal that never fires (throttled tab) must not leave content hidden
    setTimeout(function () { rv.forEach(function (n) { n.classList.add('in'); }); }, 4000);
  }

  /* ---------- hero loop ---------- */
  var hv = document.querySelector('[data-hero-video]');
  if (hv && !calm && !saveData && window.matchMedia('(min-width: 600px)').matches) {
    hv.preload = 'auto';
    hv.addEventListener('playing', function () { hv.classList.add('is-on'); }, { once: true });
    var go = function () { var p = hv.play(); if (p && p.catch) p.catch(function () {}); };
    if (document.readyState === 'complete') go(); else window.addEventListener('load', go, { once: true });
    // pause when off screen, so it costs nothing while you read
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting) go(); else hv.pause(); });
      }).observe(hv);
    }
  }

  /* ---------- venture grid: filters + search ---------- */
  $$('[data-vgrid]').forEach(function (grid) {
    var sec = grid.closest('section') || document;
    var btns = $$('.vfilter button', sec);
    var input = sec.querySelector('[data-vsearch]');
    var empty = sec.querySelector('[data-vempty]');
    var cards = $$('.vcard', grid);
    var f = 'all';
    function apply() {
      var q = input ? input.value.trim().toLowerCase() : '';
      var shown = 0;
      cards.forEach(function (c) {
        var ok = f === 'all' ||
          (f === 'stack' && c.dataset.stack === '1') ||
          (f === 'os' && c.dataset.os === '1') ||
          (f.indexOf('stage:') === 0 && c.dataset.stage === f.slice(6));
        if (ok && q) ok = c.dataset.q.indexOf(q) !== -1;
        c.parentNode.hidden = !ok;
        if (ok) { shown++; c.classList.add('in'); }
      });
      if (empty) empty.hidden = shown > 0;
    }
    function set(key) {
      f = key;
      btns.forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.f === key)); });
      apply();
    }
    btns.forEach(function (b) { b.addEventListener('click', function () { set(b.dataset.f); }); });
    if (input) input.addEventListener('input', apply);
    var reset = sec.querySelector('[data-vreset]');
    if (reset) reset.addEventListener('click', function () { if (input) input.value = ''; set('all'); });
    // /ventures/?stack=1 arrives with the FZ stack filter on (the stack page links here)
    if (/[?&]stack=1\b/.test(location.search)) set('stack');
    if (/[?&]os=1\b/.test(location.search)) set('os');
  });

  /* ---------- home: live GitHub log + merged PRs ---------- */
  var logHost = document.getElementById('fz-log');
  var elMerged = document.getElementById('fz-merged');
  var D = window.FZ_DATA || {};
  var byId = {};
  (D.ventures || []).forEach(function (v) { byId[v.id] = v; });
  function ago(iso) {
    var s = Math.max(0, (Date.now() - Date.parse(iso)) / 1000);
    if (s < 3600) return Math.max(1, Math.round(s / 60)) + 'm';
    if (s < 86400) return Math.round(s / 3600) + 'h';
    return Math.round(s / 86400) + 'd';
  }
  function line(text, cls, href) {
    var n = document.createElement(href ? 'a' : 'div');
    n.className = 'log-line' + (cls ? ' ' + cls : '');
    if (href) { n.href = href; n.rel = 'noopener'; }
    [].slice.call(arguments, 3).forEach(function (t) { var s = document.createElement('span'); if (t.cls) s.className = t.cls; s.textContent = t.text; n.appendChild(s); });
    if (!arguments[3]) { var s = document.createElement('span'); s.textContent = text; n.appendChild(s); }
    return n;
  }
  function renderLog(data) {
    if (!logHost) return;
    logHost.textContent = '';
    var items = (data && data.items) || [];
    if (!items.length) { logHost.appendChild(line('No public activity in the last 30 days.')); return; }
    // at most two lines per repository, so one busy repo cannot fill the panel
    var per = {}, shown = [];
    items.forEach(function (it) {
      if (shown.length >= 10) return;
      per[it.repo] = (per[it.repo] || 0) + 1;
      if (per[it.repo] <= 2) shown.push(it);
    });
    shown.forEach(function (it) {
      var v = byId[it.venture];
      var a = line('', it.kind === 'merged' ? 'is-key' : '', it.url,
        { cls: 't', text: ago(it.t) },
        { text: (v ? v.name : it.repo) + ' · ' + (it.kind === 'merged' ? 'merged' : 'opened') + ' #' + it.number + ' ' + it.title });
      a.title = it.repo + '#' + it.number + ' · ' + new Date(it.t).toLocaleString();
      logHost.appendChild(a);
    });
  }
  function loadLog() {
    if (!window.fetch || (!logHost && !elMerged)) return;
    fetch('/api/log').then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function (data) {
        renderLog(data);
        if (elMerged && typeof data.merged30d === 'number') elMerged.textContent = data.merged30d.toLocaleString('en-US');
      })
      .catch(function () {
        if (logHost) { logHost.textContent = ''; logHost.appendChild(line('Activity is unavailable right now.')); }
      });
  }
  loadLog();
  if (logHost) setInterval(loadLog, 5 * 60e3);

  /* ---------- home: merged PRs by author (chart from fz-ventures.js) ---------- */
  var elAuthors = document.getElementById('fz-authors');
  var elChart = document.getElementById('fz-authors-chart');
  if (elAuthors && window.FZStack) {
    window.FZStack.loadAuthors().then(function (data) {
      // hidden rather than showing a zero: an empty axis would claim the ventures stopped shipping
      elAuthors.hidden = !window.FZStack.chartPanel(elChart, data);
    }, function () { elAuthors.hidden = true; });
  }
})();
