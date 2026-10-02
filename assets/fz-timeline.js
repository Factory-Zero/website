/* Home-page venture timeline: tooltip and the slow sweep.
   The SVG in index.html is the finished chart (tools/timeline.js writes it),
   so with JavaScript off or motion reduced nothing here needs to run for it to
   read. With motion allowed, once the chart is in view a playhead sweeps from
   the first day to the last; each day's commit ticks light as it passes and a
   venture's logo comes in on the day its org was created. It holds on the full
   chart, fades back and runs again. Hover or focus pauses it. */

(function () {
  'use strict';

  var root = document.getElementById('fz-timeline');
  var svg = root && root.querySelector('.tl-svg');
  if (!svg) return;

  var SWEEP = 16000, HOLD = 4000, RESET = 1400;
  var MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEPT', 'OCT', 'NOV', 'DEC'];

  var rows = Array.prototype.slice.call(svg.querySelectorAll('.tl-row'));

  /* ------------------------------------------------------------- tooltip */

  var tip = document.createElement('div');
  tip.className = 'tl-tip';
  tip.setAttribute('aria-hidden', 'true');
  root.appendChild(tip);

  function show(row, clientX) {
    var total = Number(row.getAttribute('data-total'));
    tip.innerHTML = '';
    var b = document.createElement('b');
    b.textContent = row.getAttribute('data-name');
    tip.appendChild(b);
    tip.appendChild(document.createTextNode(
      ' · ORG CREATED ' + row.getAttribute('data-created') +
      ' · ' + total.toLocaleString('en-US') + (total === 1 ? ' COMMIT' : ' COMMITS') +
      (svg.getAttribute('data-window') ? ', ' + svg.getAttribute('data-window') : '')));
    var box = root.getBoundingClientRect();
    var r = row.querySelector('.tl-logo').getBoundingClientRect();
    var x = (clientX == null ? r.left + r.width / 2 : clientX) - box.left;
    tip.classList.add('is-on');
    var w = tip.offsetWidth;
    tip.style.left = Math.max(8, Math.min(box.width - w - 8, x - w / 2)) + 'px';
    tip.style.top = (r.top - box.top - tip.offsetHeight - 8) + 'px';
  }
  function hide() { tip.classList.remove('is-on'); }

  rows.forEach(function (row) {
    // the native <title> is the no-JS tooltip; drop it so the two don't stack
    var t = row.querySelector('title');
    if (t) t.parentNode.removeChild(t);
    row.addEventListener('mousemove', function (e) { show(row, e.clientX); });
    row.addEventListener('mouseleave', hide);
    row.addEventListener('focus', function () { show(row); });
    row.addEventListener('blur', hide);
  });

  /* ------------------------------------------------------------ the sweep */

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!('IntersectionObserver' in window) || !window.requestAnimationFrame) return;

  var n = Number(svg.getAttribute('data-days'));
  var x0 = Number(svg.getAttribute('data-x0'));
  var step = Number(svg.getAttribute('data-step'));
  var head = svg.querySelector('.tl-head');
  var now = document.getElementById('tl-now');
  var span = root.querySelector('.tl-span');
  var startDate = span ? parseStart(span.textContent) : null;

  // elements to light, grouped by day index
  var byDay = [];
  for (var i = 0; i < n; i++) byDay.push([]);
  Array.prototype.forEach.call(svg.querySelectorAll('[data-i]'), function (e) {
    var d = Number(e.getAttribute('data-i'));
    if (d >= 0 && d < n) byDay[d].push(e);
  });

  function parseStart(text) {
    // "15 AUG – 2 OCT 2026 · WITA": the year is the end's, which is the same
    // year for any window this chart shows
    var m = /^(\d+) ([A-Z]+).*?(\d{4})/.exec(text);
    if (!m) return null;
    var mo = MONTHS.indexOf(m[2]);
    return mo < 0 ? null : Date.UTC(Number(m[3]), mo, Number(m[1]));
  }
  function dayLabel(d) {
    if (startDate == null) return '';
    var t = new Date(startDate + d * 86400000);
    return t.getUTCDate() + ' ' + MONTHS[t.getUTCMonth()] + ' ·';
  }

  var cur = -1, hot = [], t = 0, last = 0, visible = false, paused = false, raf = 0;

  // On a narrow screen the strip scrolls inside its box; keep the playhead in
  // view by easing the scroll after it, until the reader scrolls it themselves.
  var box = root.querySelector('.tl-scroll');
  var follow = true, ours = 0;
  box.addEventListener('scroll', function () {
    if (Date.now() - ours > 120) follow = false;
  }, { passive: true });
  function setHead(pos) {
    var x = (x0 + pos * step).toFixed(1);
    head.setAttribute('x1', x);
    head.setAttribute('x2', x);
    if (follow && box.scrollWidth > box.clientWidth + 1) {
      var scale = svg.getBoundingClientRect().width / svg.viewBox.baseVal.width;
      var target = Math.max(0, x * scale - box.clientWidth * 0.6);
      var next = box.scrollLeft + (target - box.scrollLeft) * 0.08;
      if (Math.abs(next - box.scrollLeft) >= 0.5 || pos === 0) {
        ours = Date.now();
        box.scrollLeft = pos === 0 ? 0 : next;
      }
    }
  }
  function coolHot() {
    hot.forEach(function (e) { e.classList.remove('is-hot'); });
    hot = [];
  }
  function lightTo(d) {
    if (d <= cur) return;
    coolHot();
    for (var k = cur + 1; k <= d; k++) {
      byDay[k].forEach(function (e) {
        e.classList.add('is-on');
        if (e.classList.contains('tl-tick')) { e.classList.add('is-hot'); hot.push(e); }
      });
    }
    cur = d;
    if (now) now.textContent = dayLabel(d);
  }
  function reset() {
    coolHot();
    Array.prototype.forEach.call(svg.querySelectorAll('.is-on'), function (e) { e.classList.remove('is-on'); });
    cur = -1;
    if (now) now.textContent = '';
    setHead(0);
  }

  function frame(ts) {
    raf = 0;
    var dt = last ? Math.min(ts - last, 100) : 0;
    last = ts;
    t += dt;
    if (t < SWEEP) {
      var pos = (t / SWEEP) * (n - 1);
      setHead(pos);
      lightTo(Math.floor(pos));
    } else if (t < SWEEP + HOLD) {
      setHead(n - 1);
      lightTo(n - 1);
      if (hot.length) coolHot();
      if (now && now.textContent) now.textContent = '';
    } else if (t < SWEEP + HOLD + RESET) {
      if (cur >= 0) reset();
    } else {
      t = 0;
      follow = true;
    }
    tick();
  }
  function tick() {
    if (visible && !paused && !document.hidden && !raf) raf = requestAnimationFrame(frame);
    if ((!visible || paused || document.hidden) && raf) { cancelAnimationFrame(raf); raf = 0; }
    if (!raf) last = 0;
  }

  root.classList.add('is-anim');
  box.style.direction = 'ltr'; // the sweep starts at the left and the strip follows it
  setHead(0);

  new IntersectionObserver(function (entries) {
    visible = entries[0].isIntersecting;
    tick();
  }, { threshold: 0.25 }).observe(svg);

  root.addEventListener('mouseenter', function () { paused = true; tick(); });
  root.addEventListener('mouseleave', function () { paused = false; tick(); });
  root.addEventListener('focusin', function () { paused = true; tick(); });
  root.addEventListener('focusout', function () { paused = false; tick(); });
  document.addEventListener('visibilitychange', tick);
})();
