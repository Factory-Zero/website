/* Factory Zero — runtime.
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
  var elVentures = $('fz-ventures');
  var elAgents = $('fz-agents');
  var elPhase = $('fz-phase');

  if (elStatus) elStatus.textContent = C.factoryStatus || 'ONLINE';
  if (elVentures) elVentures.textContent = pad2(C.activeVentures != null ? C.activeVentures : live.length) + ' ACTIVE';
  if (C.headline) {
    var elHeadline = $('fz-headline');
    if (elHeadline) elHeadline.textContent = C.headline;
  }

  function renderAgentCount() {
    if (!elAgents) return;
    var base = C.agentNetwork != null ? C.agentNetwork : 1284;
    elAgents.textContent = (base + state.drift).toLocaleString('en-US');
  }
  renderAgentCount();

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
      elReadoutTime.textContent = agent ? agent.layer + ' · T+' + pad2((state.tick * 3) % 60) + 's' : '';
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
          'aria-label': agent.name + ' agent — ' + agent.msg
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
        el('span', { class: 'own', text: 'OWN BRAND · OWN P&L' })
      ]));
    });
    branchHost.appendChild(el('div', null, [el('span', { class: 'next', text: 'FZ-N' })]));
  }

  /* -------------------------------------------------------- 04 pipeline */

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
        body.appendChild(el('a', { class: 'unit', href: '/ventures/' }, [
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

  var logHost = $('fz-log');
  var logSeconds = 21 * 3600 + 4 * 60 + 18;
  var logIndex = 0;
  var KEY_LINE = /approval|signal identified/;

  function pushLog() {
    if (!logHost) return;
    logSeconds += 4 + Math.floor(Math.random() * 700);
    var h = pad2(Math.floor(logSeconds / 3600) % 24);
    var m = pad2(Math.floor(logSeconds / 60) % 60);
    var s = pad2(logSeconds % 60);
    var msg = D.logPool[logIndex % D.logPool.length];
    logIndex++;

    logHost.appendChild(el('div', {
      class: 'log-line' + (KEY_LINE.test(msg) ? ' is-key' : '')
    }, [
      el('span', { class: 't', text: h + ':' + m + ':' + s }),
      el('span', { text: msg })
    ]));

    while (logHost.children.length > 9) logHost.removeChild(logHost.firstChild);
  }

  for (var seed = 0; seed < 6; seed++) pushLog();
  setInterval(pushLog, reduced ? 4000 : 1600);

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
    state.drift += Math.random() < 0.6 ? 1 : -1;
    state.tick += 1;
    renderAgentCount();
    if (elReadoutTime && state.active) {
      elReadoutTime.textContent = state.active.layer + ' · T+' + pad2((state.tick * 3) % 60) + 's';
    }
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
    }
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
      var cy = H * (wide ? 0.5 : 0.42) + mouse.y * 10;
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
        ctx.fillText('FZ-008  ·  COMPANY', cx - rw / 2, cy + rh / 2 + 22);
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
