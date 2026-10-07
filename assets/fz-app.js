/* Factory Zero runtime.
   Vanilla port of the `DCLogic` component in the Claude Design source
   `Factory Zero.dc.html`. No framework, no build step. Timings, easing,
   geometry and colour thresholds are carried over unchanged. */

(function () {
  'use strict';

  var D = window.FZ_DATA;
  var C = window.FZ_CONFIG || {};
  if (!D) return;

  var ACCENT = '#FF5A36';
  var INK = '#EDEBE6';
  var MUTED = '#8A8A8E';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function el(tag, attrs, kids) {
    var n = document.createElement(tag);
    if (attrs) {
      for (var k in attrs) {
        if (!Object.prototype.hasOwnProperty.call(attrs, k)) continue;
        if (k === 'class') n.className = attrs[k];
        else if (k === 'text') n.textContent = attrs[k];
        else if (k === 'color') n.style.color = attrs[k];
        else n.setAttribute(k, attrs[k]);
      }
    }
    if (kids) {
      kids.forEach(function (c) { if (c) n.appendChild(c); });
    }
    return n;
  }
  function pad2(n) { return String(n).padStart(2, '0'); }
  function $(id) { return document.getElementById(id); }

  /* ---------------------------------------------------------------- state */

  var live = D.ventures.filter(function (v) { return v.status !== 'ARCHIVED'; });
  // The hero network resolves into the next company off the line, so its label
  // is the first unused record id rather than a hard-coded one that a real
  // venture can later take.
  var nextId = 'FZ-' + ('00' + (D.ventures.reduce(function (m, v) {
    return Math.max(m, parseInt(String(v.id).replace(/\D/g, ''), 10) || 0);
  }, 0) + 1)).slice(-3);
  var allAgents = D.layers.reduce(function (acc, l) {
    return acc.concat(l.agents.map(function (a) {
      return { layer: l.name, name: a[0], msg: a[1] };
    }));
  }, []);

  var state = { active: allAgents[0] || null, hovering: false, drift: 0, tick: 0, phase: 'INITIALIZING' };
  var agentNodes = {};   // agent name -> button
  var hoverTimer = null;

  /* ------------------------------------------------------------ hero meta */

  var elStatus = $('fz-status');
  var elAgents = $('fz-agents');
  var elPhase = $('fz-phase');

  if (elStatus) elStatus.textContent = C.factoryStatus || 'ONLINE';
  if (C.headline) {
    var elHeadline = $('fz-headline');
    if (elHeadline) elHeadline.textContent = C.headline;
  }

  function renderAgentCount() {}

  /* ------------------------------------------------- 02 layers and agents */

  function agentId(a) {
    return a ? a.name + '_AGENT_' + pad2((a.name.length * 7) % 19 + 1) : '';
  }

  var elReadoutId = $('fz-agent-id');
  var elReadoutMsg = $('fz-agent-msg');
  var elReadoutTime = $('fz-agent-time');

  function setActive(agent, fromUser) {
    state.active = agent;
    if (fromUser) {
      state.hovering = true;
      clearTimeout(hoverTimer);
      hoverTimer = setTimeout(function () { state.hovering = false; }, 6000);
    }
    for (var name in agentNodes) {
      if (!Object.prototype.hasOwnProperty.call(agentNodes, name)) continue;
      agentNodes[name].classList.toggle('is-active', !!agent && agent.name === name);
    }
    if (elReadoutId) elReadoutId.textContent = agentId(agent);
    if (elReadoutMsg) elReadoutMsg.textContent = agent ? agent.msg : '';
    if (elReadoutTime) {
      elReadoutTime.textContent = agent ? agent.layer : '';
    }
  }

  var layersHost = $('fz-layers');
  if (layersHost) {
    D.layers.forEach(function (layer) {
      var col = el('div', { class: 'layer' }, [el('div', { class: 'layer-name', text: layer.name })]);
      layer.agents.forEach(function (pair) {
        var agent = { layer: layer.name, name: pair[0], msg: pair[1] };
        var btn = el('button', {
          type: 'button',
          class: 'agent',
          'aria-label': agent.name + ' agent, ' + agent.msg
        }, [
          el('span', { text: agent.name }),
          el('span', { class: 'dot', 'aria-hidden': 'true' })
        ]);
        var activate = function () { setActive(agent, true); };
        btn.addEventListener('mouseenter', activate);
        btn.addEventListener('focus', activate);
        btn.addEventListener('click', activate);
        agentNodes[agent.name] = btn;
        col.appendChild(btn);
      });
      layersHost.appendChild(col);
    });
  }

  setActive(state.active, false);

  /* ---------------------------------------------- 03 branch venture list */

  var branchHost = $('fz-branches');
  if (branchHost) {
    live.slice(0, 5).forEach(function (v) {
      branchHost.appendChild(el('div', null, [
        el('span', { class: 'id', text: v.id }),
        el('span', { class: 'own', text: 'OWN BRAND · OWN STRATEGY' })
      ]));
    });
    branchHost.appendChild(el('div', null, [el('span', { class: 'next', text: 'FZ-N' })]));
  }

  /* -------------------------------------------------------- 04 pipeline */

  // a venture's own page, /ventures/<slug>/; same rule as slug() in tools/sync-ventures.js
  function slug(v) { return v.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }

  var STAGES = ['SIGNAL', 'VALIDATION', 'PROTOTYPE', 'LAUNCH', 'AUTONOMY', 'SCALE'];
  var STATUS_COLOR = {
    LIVE: INK, SCALING: ACCENT, BUILDING: '#A9A8A5',
    RESEARCHING: MUTED, UNANNOUNCED: MUTED, ARCHIVED: '#4A4A4E', ACQUIRED: INK
  };

  var lineHost = $('fz-line');
  if (lineHost) {
    STAGES.forEach(function (name, i) {
      var body = el('div', { class: 'stage-body' });
      live.filter(function (v) { return v.stage === name; }).forEach(function (v) {
        body.appendChild(el('a', { class: 'unit', href: '/ventures/' + slug(v) + '/' }, [
          el('span', { text: v.id }),
          el('span', { text: v.status, color: STATUS_COLOR[v.status] || MUTED })
        ]));
      });
      lineHost.appendChild(el('div', { class: 'stage' }, [
        el('div', { class: 'stage-head' }, [
          el('span', { text: name }),
          el('span', { class: 'idx', text: pad2(i + 1) })
        ]),
        body
      ]));
    });
  }

  var elPipelineCount = $('fz-pipeline-count');
  if (elPipelineCount) elPipelineCount.textContent = 'LINE 01 · ' + pad2(live.length) + ' UNITS IN PROCESS';

  /* -------------------------------------------------------- 05 autonomy */

  var LEVELS = ['Human-operated', 'AI-assisted', 'Agent workflows', 'Agent-operated', 'Self-optimizing', 'Autonomous company'];

  var levelsHost = $('fz-levels');
  if (levelsHost) {
    LEVELS.forEach(function (name, n) {
      var bars = el('span', { class: 'bars', 'aria-hidden': 'true' });
      for (var k = 1; k <= 5; k++) {
        bars.appendChild(el('i', k <= n ? { class: 'on' } : null));
      }
      levelsHost.appendChild(el('div', {
        class: 'level' + (n >= 3 ? ' is-target' : '')
      }, [
        el('span', { text: 'LEVEL ' + n }),
        el('span', { class: 'name', text: name }),
        bars
      ]));
    });
  }

  /* ------------------------------------------------------------- 07 log */
  // Real public GitHub activity across the ventures (/api/log): merged pull
  // requests and opened issues, newest first, each linking to GitHub. Nothing
  // here is simulated; when the feed is unavailable the panel says so.

  var logHost = $('fz-log');
  var elMerged = $('fz-merged');

  function ago(iso) {
    var s = Math.max(0, (Date.now() - Date.parse(iso)) / 1000);
    if (s < 3600) return Math.max(1, Math.round(s / 60)) + 'm';
    if (s < 86400) return Math.round(s / 3600) + 'h';
    return Math.round(s / 86400) + 'd';
  }
  var venturesById = {};
  (D.ventures || []).forEach(function (v) { venturesById[v.id] = v; });

  function renderLog(data) {
    if (!logHost) return;
    logHost.textContent = '';
    var items = (data && data.items) || [];
    if (!items.length) {
      logHost.appendChild(el('div', { class: 'log-line' }, [el('span', { text: 'No public activity in the last 30 days.' })]));
      return;
    }
    // At most two lines per repository, so one busy repo (or a batch of filed
    // issues) cannot fill the panel on its own.
    var perRepo = {}, shown = [];
    items.forEach(function (it) {
      if (shown.length >= 9) return;
      perRepo[it.repo] = (perRepo[it.repo] || 0) + 1;
      if (perRepo[it.repo] <= 2) shown.push(it);
    });
    shown.forEach(function (it) {
      var v = venturesById[it.venture];
      var a = el('a', { class: 'log-line' + (it.kind === 'merged' ? ' is-key' : ''), href: it.url, rel: 'noopener' }, [
        el('span', { class: 't', text: ago(it.t) }),
        el('span', { text: (v ? v.name : it.repo) + ' · ' + (it.kind === 'merged' ? 'merged' : 'opened') + ' #' + it.number + ' ' + it.title })
      ]);
      a.title = it.repo + '#' + it.number + ' · ' + new Date(it.t).toLocaleString();
      logHost.appendChild(a);
    });
  }
  function loadLog() {
    if (!window.fetch) return;
    fetch('/api/log').then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function (data) {
        renderLog(data);
        if (elMerged && typeof data.merged30d === 'number') elMerged.textContent = data.merged30d.toLocaleString('en-US');
      })
      .catch(function () {
        if (logHost) { logHost.textContent = ''; logHost.appendChild(el('div', { class: 'log-line' }, [el('span', { text: 'Activity is unavailable right now.' })])); }
      });
  }
  loadLog();
  setInterval(loadLog, 5 * 60e3);

  /* ----------------------------------------------------------- rotation */

  var cycleIndex = 0;
  if (allAgents.length) {
    setInterval(function () {
      if (state.hovering) return;
      cycleIndex = (cycleIndex + 1) % allAgents.length;
      setActive(allAgents[cycleIndex], false);
    }, 2600);
  }

  setInterval(function () {
    state.tick += 1;
  }, 3000);

  /* ------------------------------------------------------------- canvas */

  var canvas = $('fz-canvas');
  if (canvas && canvas.getContext) {
    var ctx = canvas.getContext('2d');
    var N = 84, T = 28000;
    var W = 0, H = 0, dpr = 1;
    var mouse = { x: 0, y: 0 };

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = canvas.clientWidth;
      H = canvas.clientHeight;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      // On a narrow screen the headline fills the middle, so the network sits
      // in the open band between the readout and the headline instead.
      var ro = document.querySelector('.hero .readout'), ht = $('fz-headline');
      if (ro && ht) {
        var top = canvas.getBoundingClientRect().top;
        narrowCy = (ro.getBoundingClientRect().bottom + ht.getBoundingClientRect().top) / 2 - top;
      }
    }
    var narrowCy = 0;
    resize();

    function rnd(n) {
      var x = Math.sin(n * 12.9898) * 43758.5453;
      return x - Math.floor(x);
    }
    function ease(t) { return t < 0 ? 0 : t > 1 ? 1 : 1 - Math.pow(1 - t, 3); }

    var nodes = [];
    for (var i = 0; i < N; i++) {
      nodes.push({
        ang: i * 2.39996 + rnd(i) * 0.4,
        r: 110 + (i % 6) * 52 + rnd(i + 9) * 40,
        acc: i % 9 === 0,
        sp: 0.17 + 0.38 * (i / N)
      });
    }

    window.addEventListener('pointermove', function (e) {
      mouse.x = e.clientX / window.innerWidth - 0.5;
      mouse.y = e.clientY / window.innerHeight - 0.5;
    }, { passive: true });

    var start = performance.now();
    var lastPhase = '';

    function draw(now) {
      if (!W || !H) { resize(); if (!reduced) requestAnimationFrame(draw); return; }

      var p = reduced ? 0.62 : ((now - start) % T) / T;
      var phase = p < 0.17 ? 'INITIALIZING'
        : p < 0.55 ? 'AGENTS ACTIVATING'
        : p < 0.76 ? 'SYSTEM RUNNING'
        : p < 0.92 ? 'COMPANY FORMED'
        : 'RESETTING';
      if (phase !== lastPhase) {
        lastPhase = phase;
        state.phase = phase;
        if (elPhase) elPhase.textContent = phase;
      }

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);

      var wide = W > 900;
      var cx = (wide ? W * 0.68 : W * 0.5) + mouse.x * 14;
      var cy = (wide ? H * 0.5 : (narrowCy || H * 0.42)) + mouse.y * 10;
      var scale = Math.min(1, W / 1400) * (wide ? 1 : 0.7);
      var q = ease((p - 0.76) / 0.13);
      var fade = p > 0.92 ? 1 - (p - 0.92) / 0.08 : 1;

      // the zero: a ring that draws itself in
      var ringA = ease((p - 0.03) / 0.12);
      if (ringA > 0) {
        ctx.beginPath();
        ctx.arc(cx, cy, 58 * scale, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * ringA);
        ctx.strokeStyle = 'rgba(237,235,230,' + (1 - q) * fade * 0.9 + ')';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      var rw = 320 * scale, rh = 200 * scale;

      // the company the network resolves into
      if (q > 0) {
        ctx.strokeStyle = 'rgba(255,90,54,' + q * fade * 0.9 + ')';
        ctx.lineWidth = 1;
        ctx.strokeRect(cx - rw / 2, cy - rh / 2, rw, rh);
        ctx.font = '11px "IBM Plex Mono", monospace';
        ctx.fillStyle = 'rgba(237,235,230,' + q * fade + ')';
        ctx.fillText(nextId + '  ·  COMPANY', cx - rw / 2, cy + rh / 2 + 22);
      }

      var per = 2 * (rw + rh);
      var pos = nodes.map(function (n, idx) {
        var age = ease((p - n.sp) / 0.07);
        if (age <= 0) return null;
        var drift = Math.sin(now / 1400 + idx) * 3;
        var rx = cx + Math.cos(n.ang) * (n.r * scale * age + drift);
        var ry = cy + Math.sin(n.ang) * (n.r * scale * age + drift);
        var d = (idx / N) * per, tx, ty;
        if (d < rw) { tx = cx - rw / 2 + d; ty = cy - rh / 2; }
        else if (d < rw + rh) { tx = cx + rw / 2; ty = cy - rh / 2 + (d - rw); }
        else if (d < 2 * rw + rh) { tx = cx + rw / 2 - (d - rw - rh); ty = cy + rh / 2; }
        else { tx = cx - rw / 2; ty = cy + rh / 2 - (d - 2 * rw - rh); }
        return { x: rx + (tx - rx) * q, y: ry + (ty - ry) * q, a: age * fade, acc: n.acc };
      });

      // edges
      var edges = [];
      var reach = (105 * scale) * (105 * scale);
      ctx.lineWidth = 1;
      for (var a1 = 0; a1 < N; a1++) {
        var A = pos[a1];
        if (!A) continue;
        for (var b1 = a1 + 1; b1 < N; b1++) {
          var B = pos[b1];
          if (!B) continue;
          var dx = A.x - B.x, dy = A.y - B.y;
          if (dx * dx + dy * dy < reach) {
            edges.push([A, B]);
            ctx.strokeStyle = 'rgba(237,235,230,' + Math.min(A.a, B.a) * (1 - q) * 0.22 + ')';
            ctx.beginPath();
            ctx.moveTo(A.x, A.y);
            ctx.lineTo(B.x, B.y);
            ctx.stroke();
          }
        }
      }

      // packets travelling the edges
      if (p > 0.45 && p < 0.8) {
        var k = Math.min(14, edges.length);
        for (var e = 0; e < k; e++) {
          var pair = edges[(e * 7) % edges.length];
          var t = ((now / 1500) + e * 0.37) % 1;
          ctx.fillStyle = 'rgba(255,90,54,' + (1 - q) * fade * 0.9 + ')';
          ctx.beginPath();
          ctx.arc(pair[0].x + (pair[1].x - pair[0].x) * t, pair[0].y + (pair[1].y - pair[0].y) * t, 1.6, 0, 7);
          ctx.fill();
        }
      }

      // nodes
      pos.forEach(function (n) {
        if (!n) return;
        ctx.fillStyle = n.acc ? 'rgba(255,90,54,' + n.a + ')' : 'rgba(237,235,230,' + n.a * 0.85 + ')';
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.acc ? 2.4 : 1.6, 0, 7);
        ctx.fill();
      });

      if (!reduced) requestAnimationFrame(draw);
    }

    window.addEventListener('resize', function () {
      resize();
      if (reduced) requestAnimationFrame(draw);
    });

    requestAnimationFrame(draw);
  }
})();
