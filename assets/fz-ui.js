/* Factory Zero UI behaviour, for pages on assets/fz-ui.css. Dependency-free.
   - scroll reveal and count-up (only below the fold, and only once JS runs)
   - the home films: poster cards open one shared player
   - the hero loop video (never with reduced motion or data saver)
   - the home chip band: parallax layers, transform only (static with reduced motion or Save-Data)
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
  /* Only elements below the first viewport are hidden, and only once html.rv-on is set
     here, so everything above the fold is painted without waiting for an observer.
     Without JS, or with reduced motion, nothing is hidden at all. */
  if (!calm && 'IntersectionObserver' in window && rv.length) {
    var vh = window.innerHeight || root.clientHeight;
    var below = [];
    rv.forEach(function (n) {
      var r = n.getBoundingClientRect();
      if (r.top < vh * 0.92) { revealNow(n); } else { below.push(n); }
    });
    if (below.length) {
      root.classList.add('rv-on');
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          if (!e.isIntersecting) return;
          revealNow(e.target);
          io.unobserve(e.target);
        });
      }, { rootMargin: '0px 0px -8% 0px' });
      below.forEach(function (n) { io.observe(n); });
      // a reveal that never fires (throttled tab) must not leave content hidden
      setTimeout(function () { below.forEach(revealNow); }, 4000);
    }
  }
  function revealNow(n) {
    if (n.classList.contains('in')) return;
    n.classList.add('in');
    var c = n.matches('[data-count]') ? n : n.querySelector('[data-count]');
    if (c && !c.dataset.done && !calm) { c.dataset.done = '1'; countUp(c); }
  }

  var popFor = function () {};
  /* ---------- home hero: the prompt bar types, the foundation blocks light ----------
     The static page already shows prompt 0 with its blocks lit. The loop runs only while
     the scene is on screen and the tab is visible, pauses under the pointer or focus, and
     never runs with reduced motion or Save-Data. Timers, not frames: nothing moves per frame. */
  var scene = document.querySelector('[data-hero-scene]');
  var PROMPTS = (window.FZ_DATA && window.FZ_DATA.heroPrompts) || [];
  if (scene && PROMPTS.length && !calm && !saveData) {
    var typed = scene.querySelector('[data-typed]');
    var built = scene.querySelector('[data-built]');
    var blocks = [].slice.call(scene.querySelectorAll('.hb, .hb-tag'));
    var inView = false, paused = false, timer = 0, nextFn = null, idx = 0, cur = null, n = 0;
    var ready = function () { return inView && !paused && !document.hidden; };
    var go = function (ms, fn) { nextFn = fn; if (timer) clearTimeout(timer); timer = setTimeout(tick, ms); };
    var tick = function () { timer = 0; if (ready() && nextFn) nextFn(); };
    var kick = function () { if (!timer && nextFn && ready()) go(350, nextFn); };
    var setLit = function (ids) {
      blocks.forEach(function (g) { g.classList.toggle('is-lit', ids.indexOf(g.getAttribute('data-venture')) >= 0); });
    };
    var typeStep = function () {
      if (n <= cur.text.length) { typed.textContent = cur.text.slice(0, n); n++; go(34 + Math.random() * 30, typeStep); }
      else go(480, litStep);
    };
    var startPrompt = function () { cur = PROMPTS[idx]; n = 0; typed.textContent = ''; typeStep(); };
    var litStep = function () {
      setLit(cur.ventures);
      fire(cur.ventures);
      popFor(cur.ventures);
      built.textContent = '→ built with: ' + cur.ventures.map(function (id) {
        var g = scene.querySelector('.hb[data-venture="' + id + '"]'); return g ? g.getAttribute('data-name') : id;
      }).join(' · ');
      go(3900, unlightStep);
    };
    var unlightStep = function () {
      setLit([]); built.textContent = '';
      idx = (idx + 1) % PROMPTS.length;
      go(750, startPrompt);
    };
    nextFn = startPrompt;
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) { inView = es[0].isIntersecting; if (inView) { kick(); kickFrame(); } }, { threshold: 0.25 }).observe(scene);
    } else { inView = true; }
    document.addEventListener('visibilitychange', function () { if (!document.hidden) kick(); });
    scene.addEventListener('pointerenter', function () { paused = true; });
    scene.addEventListener('pointerleave', function () { paused = false; kick(); });
    scene.addEventListener('focusin', function () { paused = true; });
    scene.addEventListener('focusout', function () { paused = false; kick(); });
    /* sparks from the floor to each lit block; the grid tiles of the lit ventures glow */
    var fire = function (ids) {
      ids.forEach(function (id) {
        var sp = scene.querySelector('.hb-spark[data-venture="' + id + '"]');
        if (sp) { sp.classList.remove('is-go'); sp.getBoundingClientRect(); sp.classList.add('is-go'); }
      });
    };
    /* camera drift and pointer parallax: one rAF loop, only while the hero is on screen and the tab is visible */
    var mainSvg = scene.querySelector('.hb-svg');
    var px = 0, py = 0, tx = 0, ty = 0, raf = 0, t0 = 0;
    var frame = function (now) {
      raf = 0;
      if (!inView || document.hidden) return;
      if (!t0) t0 = now;
      var s = (now - t0) / 1000;
      px += (tx - px) * 0.05; py += (ty - py) * 0.05;
      var dx = Math.sin(s * 2 * Math.PI / 14) * 9, dy = Math.cos(s * 2 * Math.PI / 19) * 6;
      if (mainSvg) mainSvg.style.transform = 'translate3d(' + (dx + px).toFixed(2) + 'px,' + (dy + py).toFixed(2) + 'px,0)';
      raf = requestAnimationFrame(frame);
    };
    var kickFrame = function () { if (!raf && inView && !document.hidden) raf = requestAnimationFrame(frame); };
    if (window.matchMedia && window.matchMedia('(pointer: fine)').matches) {
      var heroEl = scene.closest('.hero');
      if (heroEl) heroEl.addEventListener('pointermove', function (e) {
        tx = (e.clientX / window.innerWidth - 0.5) * -26; ty = (e.clientY / window.innerHeight - 0.5) * -16; kickFrame();
      });
    }
    document.addEventListener('visibilitychange', kickFrame);
    kickFrame();
    kick();
  }

  /* ---------- the venture grid: one logo per cell, behind the page ----------
     A solid, regular grid of square cells covers the page (fixed, behind all content). Each cell
     holds one venture's logo, faintly visible. Cells never move, so logos never overlap. Cells
     under the copy, the offer, the prompt bar and the scene stay dim. A pop lights a cell in the
     ring around the composition (or the nearest cell of a lit venture, next to the scene) to full
     colour with its name, then it settles back. Reduced motion and Save-Data: the grid at rest. */
  var gridEl = document.querySelector('.gc-layer');
  if (gridEl) {
    var VENT = ((window.FZ_DATA && window.FZ_DATA.ventures) || []).filter(function (v) { return v.logo && v.status !== 'ARCHIVED'; });
    var ORDER = VENT.map(function (v, i) { return i; });
    var seed = 11, rnd = function () { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
    for (var s = ORDER.length - 1; s > 0; s--) { var r = Math.floor(rnd() * (s + 1)), t = ORDER[s]; ORDER[s] = ORDER[r]; ORDER[r] = t; }
    var cells = [], ring = [], pops = [], popTimer = 0, cellPx = 120, LIT_MAX = 5, scrollT = 0;
    var AVOID_SEL = '.hero-copy h1, .hero-copy .eyebrow, .hero-copy .lede, .btns, .hero-offer, .hb-prompt, .hb-built, .hb-svg, .site-header';
    var build = function () {
      var vw = window.innerWidth, vh = window.innerHeight;
      cellPx = Math.round(Math.max(112, Math.min(150, vw * 0.082)));
      var cols = Math.max(1, Math.floor(vw / cellPx)), rows = Math.ceil(vh / cellPx), n = cols * rows, imgW = Math.round(cellPx * 0.74);
      gridEl.style.setProperty('--cols', cols); gridEl.style.setProperty('--cell', cellPx + 'px');
      while (cells.length < n) {
        var f = document.createElement('figure'); f.className = 'cell';
        var img = document.createElement('img'); img.alt = ''; img.decoding = 'async'; img.loading = 'lazy';
        var cap = document.createElement('figcaption');
        f.appendChild(img); f.appendChild(cap); gridEl.appendChild(f); cells.push(f);
      }
      while (cells.length > n) { var old = cells.pop(); old.parentNode.removeChild(old); }
      cells.forEach(function (f, i) {
        var v = VENT[ORDER[i % ORDER.length]];
        if (f.getAttribute('data-v') !== v.id) {
          f.setAttribute('data-v', v.id);
          var img = f.firstChild; img.src = '/assets/' + v.logo; img.width = imgW; img.height = imgW;
          f.lastChild.textContent = v.name;
        }
      });
      classify();
    };
    var classify = function () {
      var avoid = [].slice.call(document.querySelectorAll(AVOID_SEL)).map(function (e) { return e.getBoundingClientRect(); })
        .filter(function (b) { return b.width > 0 && b.bottom > 0 && b.top < window.innerHeight; });
      ring = [];
      cells.forEach(function (f, i) {
        var b = f.getBoundingClientRect(), hit = false, near = Infinity;
        avoid.forEach(function (a) {
          var dx = Math.max(a.left - b.right, b.left - a.right, 0), dy = Math.max(a.top - b.bottom, b.top - a.bottom, 0), d = Math.max(dx, dy);
          if (d <= 0) hit = true; else if (d < near) near = d;
        });
        f.classList.toggle('is-under', hit);
        if (!hit && near <= 240) ring.push(i);
      });
    };
    var unpop = function (f) {
      f.classList.remove('is-pop');
      for (var k = pops.length - 1; k >= 0; k--) if (pops[k].f === f) { clearTimeout(pops[k].t); pops.splice(k, 1); }
    };
    var doPop = function (i) {
      var f = cells[i];
      if (!f || f.classList.contains('is-pop') || pops.length >= LIT_MAX) return;
      f.classList.add('is-pop');
      pops.push({ f: f, t: setTimeout(function () { unpop(f); }, 3600 + Math.random() * 1800) });
    };
    var heroVisible = function () { var h = document.querySelector('.hero--home'); return !!h && h.getBoundingClientRect().bottom > 120; };
    var popRandom = function () {
      if (pops.length >= LIT_MAX - 1 || !heroVisible()) return;
      var ok = ring.filter(function (i) { return !cells[i].classList.contains('is-pop'); });
      if (ok.length) doPop(ok[(Math.random() * ok.length) | 0]);
    };
    /* A prompt's ventures pop in the cell of that venture nearest the block that lights it. */
    popFor = function (ids) {
      ids.forEach(function (id) {
        var g = document.querySelector('.hb[data-venture="' + id + '"]');
        if (!g) return;
        var b = g.getBoundingClientRect(), cx = b.left + b.width / 2, cy = b.top + b.height / 2, best = -1, bd = Infinity;
        cells.forEach(function (f, i) {
          if (f.getAttribute('data-v') !== id || f.classList.contains('is-under') || f.classList.contains('is-pop')) return;
          var c = f.getBoundingClientRect(), d = Math.hypot(c.left + c.width / 2 - cx, c.top + c.height / 2 - cy);
          if (d < bd) { bd = d; best = i; }
        });
        if (best >= 0) doPop(best);
      });
    };
    var gridStart = function () { if (!popTimer && !document.hidden && !calm && !saveData) popTimer = setInterval(popRandom, 1300); };
    var gridStop = function () { clearInterval(popTimer); popTimer = 0; };
    build();
    var heroEl = document.querySelector('.hero--home');
    if (heroEl && 'IntersectionObserver' in window) {
      new IntersectionObserver(function (es) { if (es[0].isIntersecting) gridStart(); else gridStop(); }, { threshold: 0.05 }).observe(heroEl);
    } else { gridStart(); }
    document.addEventListener('visibilitychange', function () { if (document.hidden) gridStop(); else if (heroVisible()) gridStart(); });
    window.addEventListener('resize', function () { pops.slice().forEach(function (p) { unpop(p.f); }); build(); });
    window.addEventListener('scroll', function () { if (!scrollT) scrollT = setTimeout(function () { scrollT = 0; classify(); }, 150); }, { passive: true });
  }

  /* ---------- hero loops (home .hero-media and every .ph-media page hero) ----------
     Page heroes ship without <source>: data-webm / data-mp4 are attached only after the
     page has loaded and the browser is idle, never with reduced motion, Save-Data or a
     slow connection, so the poster is the only hero request on first paint. */
  var hvs = document.querySelectorAll('[data-hero-video]');
  var conn = navigator.connection;
  var slow = conn && /(^|-)2g|3g/.test(conn.effectiveType || '');
  if (hvs.length && !calm && !saveData && !slow && window.matchMedia('(min-width: 600px)').matches) {
    var idle = window.requestIdleCallback || function (f) { return setTimeout(f, 200); };
    var start = function () {
      Array.prototype.forEach.call(hvs, function (hv) {
        if (hv.dataset.webm && !hv.querySelector('source')) {
          [['webm', 'video/webm'], ['mp4', 'video/mp4']].forEach(function (t) {
            var s = document.createElement('source'); s.src = hv.dataset[t[0]]; s.type = t[1]; hv.appendChild(s);
          });
          hv.load();
        }
        hv.preload = 'auto';
        hv.addEventListener('playing', function () { hv.classList.add('is-on'); }, { once: true });
        var go = function () { var p = hv.play(); if (p && p.catch) p.catch(function () {}); };
        go();
        // pause when off screen, so it costs nothing while you read
        if ('IntersectionObserver' in window) {
          new IntersectionObserver(function (es) {
            es.forEach(function (e) { if (e.isIntersecting) go(); else hv.pause(); });
          }).observe(hv);
        }
      });
    };
    var later = function () {
      // a speculative prerender must not start the loops; wait until the page is shown
      if (document.prerendering) { document.addEventListener('prerenderingchange', later, { once: true }); return; }
      idle(start, { timeout: 2000 });
    };
    if (document.readyState === 'complete') later(); else window.addEventListener('load', later, { once: true });
  }

  /* ---------- chip band: parallax layers (photo ground, drawn back and mid boards, chip pair, chip die) ----------
     Each layer is moved by transform only, by its data-speed (nearer layers move more).
     One rAF-throttled scroll handler; it runs only while the band is near the viewport.
     Reduced motion and Save-Data keep the static composite (is-still): no transforms. */
  var chip = document.querySelector('[data-chip-band]');
  if (chip) {
    if (calm || saveData || !('IntersectionObserver' in window)) {
      chip.classList.add('is-still');
    } else {
      var cLayers = $$('[data-cb-layer]', chip);
      var overscan = 0, live = false, queued = false;
      var measure = function () { overscan = chip.offsetHeight * 0.12; };
      var paint = function () {
        queued = false;
        if (!live) return;
        var r = chip.getBoundingClientRect();
        var vh = window.innerHeight || root.clientHeight;
        // c is 0 when the band is centred in the viewport, about +1 when it enters at the bottom
        var c = (r.top + r.height / 2 - vh / 2) / vh;
        cLayers.forEach(function (l) {
          var k = Math.max(-1, Math.min(1, c * Number(l.getAttribute('data-speed'))));
          l.style.transform = 'translate3d(0,' + (k * overscan).toFixed(1) + 'px,0)';
        });
      };
      var queue = function () { if (live && !queued) { queued = true; requestAnimationFrame(paint); } };
      measure();
      window.addEventListener('scroll', queue, { passive: true });
      window.addEventListener('resize', function () { measure(); queue(); }, { passive: true });
      new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          live = e.isIntersecting;
          chip.classList.toggle('is-live', live);
          if (live) queue();
          else cLayers.forEach(function (l) { l.style.transform = ''; });
        });
      }, { rootMargin: '200px 0px' }).observe(chip);
    }
  }

  /* ---------- films: poster cards open one shared player ---------- */
  var filmCards = $$('[data-film-open]');
  var player = document.getElementById('fz-player');
  if (filmCards.length && player && typeof player.showModal === 'function') {
    var pVid = player.querySelector('.fzp-video');
    var pTitle = document.getElementById('fzp-title');
    var pCount = document.getElementById('fzp-count');
    var pVenture = document.getElementById('fzp-venture');
    var pLine = document.getElementById('fzp-line');
    var pSite = document.getElementById('fzp-site');
    var pPrev = player.querySelector('[data-fzp-prev]');
    var pNext = player.querySelector('[data-fzp-next]');
    var cur = 0, opener = null;
    function show(i) {
      var c = filmCards[i];
      cur = i;
      pTitle.textContent = c.dataset.title;
      pVenture.textContent = c.dataset.venture;
      pVenture.href = c.dataset.ventureUrl;
      pLine.textContent = c.dataset.line;
      pCount.textContent = (i + 1) + ' / ' + filmCards.length;
      pVid.poster = c.dataset.poster;
      if (c.dataset.site) { pSite.href = c.dataset.site; pSite.hidden = false; } else { pSite.hidden = true; }
      // the video gets its source only now, and plays with sound: this is a user gesture
      pVid.src = c.getAttribute('href');
      var p = pVid.play(); if (p && p.catch) p.catch(function () {});
    }
    function step(d) { show((cur + d + filmCards.length) % filmCards.length); }
    filmCards.forEach(function (c, i) {
      c.addEventListener('click', function (e) {
        if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        e.preventDefault();
        opener = c;
        show(i);
        if (!player.open) player.showModal();
      });
    });
    pPrev.addEventListener('click', function () { step(-1); });
    pNext.addEventListener('click', function () { step(1); });
    player.querySelector('[data-fzp-close]').addEventListener('click', function () { player.close(); });
    // a click on the dimmed backdrop (the dialog itself, not the frame) closes it
    player.addEventListener('click', function (e) { if (e.target === player) player.close(); });
    player.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); step(1); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1); }
    });
    // Esc, the close button and the backdrop all end here: stop the film, free the
    // connection, and give focus back to the card that opened it
    player.addEventListener('close', function () {
      pVid.pause();
      pVid.removeAttribute('src');
      pVid.load();
      if (opener) { opener.focus({ preventScroll: true }); opener = null; }
    });
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
