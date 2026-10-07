/* Factory Zero hero: the venture network in 3D ("spatial glass").
   Plain WebGL2, no library, no build step. Everything on screen comes from
   `window.FZ_DATA`: one tile per active venture (its real mark on a small
   frosted-glass tile), one beam per sister-venture entry in a venture's `uses`
   (live ones always, planned ones when a venture is hovered), and the Factory
   Zero core in the middle. Tiles float at real depth over a faint dot floor,
   tilt toward the pointer, and the camera orbits slowly with a little inertia
   when dragged. No bloom, glow or dust. One atlas texture for the marks; five
   draw calls a frame. It starts after `load` and idle, and hands back to the
   2D constellation in fz-app.js when WebGL2 is missing or the context is lost. */

(function () {
  'use strict';

  var D = window.FZ_DATA;
  var hero = document.querySelector('.hero');
  var base2d = document.getElementById('fz-canvas');
  if (!D || !hero || !base2d || !window.Promise) return;

  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var saveData = navigator.connection && navigator.connection.saveData;
  if (saveData) return;

  var MAXN = 32;           // ventures the shader arrays hold
  var MAXE = 128;          // edges (venture pairs + spokes)
  var SEG = 14;            // segments per edge ribbon
  var CELL = 160, COLS = 6;          // logo atlas
  var LCW = 256, LCH = 40, LCOLS = 4; // label atlas

  function slug(v) { return v.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }
  function clamp(x, a, b) { return x < a ? a : x > b ? b : x; }
  function mulberry(a) {
    return function () {
      a |= 0; a = a + 0x6D2B79F5 | 0;
      var t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  /* --------------------------------------------------------------- graph */

  var ventures = D.ventures.filter(function (v) { return v.status !== 'ARCHIVED'; }).slice(0, MAXN);
  var N = ventures.length;
  if (!N) return;
  var index = {};
  ventures.forEach(function (v, i) { index[v.id] = i; });

  var roles = D.roles || {};
  var edgeMap = {};
  var edges = [];
  // roles whose traffic runs from the venture to the thing it uses
  var OUTBOUND = { 'bug-reports': 1, 'security-screening': 1 };
  ventures.forEach(function (v, i) {
    (v.uses || []).forEach(function (u) {
      if (!(u.id in index) || index[u.id] === i) return;
      var j = index[u.id];
      var key = Math.min(i, j) + '|' + Math.max(i, j);
      var e = edgeMap[key];
      if (!e) {
        e = edgeMap[key] = { a: Math.min(i, j), b: Math.max(i, j), live: false, uses: [] };
        edges.push(e);
      }
      var isLive = u.status === 'live';
      if (isLive) e.live = true;
      e.uses.push({ user: i, provider: j, role: u.role, live: isLive });
    });
  });
  edges = edges.slice(0, MAXE - N);
  var liveCount = 0;
  edges.forEach(function (e) { if (e.live) liveCount++; });

  var adj = ventures.map(function () { return {}; });
  edges.forEach(function (e, k) { adj[e.a][e.b] = k; adj[e.b][e.a] = k; });

  /* 3D layout: a small deterministic force simulation, so the cluster is the
     shape of the real dependency graph (the hubs sit between their users). */
  function layout() {
    var rnd = mulberry(20260810);
    var p = [], i, j, k;
    for (i = 0; i < N; i++) {
      var y = 1 - (i + 0.5) / N * 2, r = Math.sqrt(1 - y * y), ph = i * 2.39996;
      var s = 0.6 + 0.4 * rnd();
      p.push([Math.cos(ph) * r * s, y * s, Math.sin(ph) * r * s]);
    }
    var ITER = 420;
    for (var it = 0; it < ITER; it++) {
      var cool = 1 - it / ITER, f = [];
      for (i = 0; i < N; i++) f.push([0, 0, 0]);
      for (i = 0; i < N; i++) {
        for (j = i + 1; j < N; j++) {
          var dx = p[i][0] - p[j][0], dy = p[i][1] - p[j][1], dz = p[i][2] - p[j][2];
          var dist = Math.max(Math.sqrt(dx * dx + dy * dy + dz * dz), 0.04);
          var F = 0.5 / (dist * dist) * 0.5;
          dx /= dist; dy /= dist; dz /= dist;
          f[i][0] += dx * F; f[i][1] += dy * F; f[i][2] += dz * F;
          f[j][0] -= dx * F; f[j][1] -= dy * F; f[j][2] -= dz * F;
        }
      }
      for (k = 0; k < edges.length; k++) {
        var e = edges[k], A = p[e.a], B = p[e.b];
        var ex = B[0] - A[0], ey = B[1] - A[1], ez = B[2] - A[2];
        var ed = Math.max(Math.sqrt(ex * ex + ey * ey + ez * ez), 0.04);
        var w = (e.live ? 1.5 : 0.55) * ed * 0.4 / Math.max(1, Math.sqrt(deg(e.a) * deg(e.b)) * 0.45);
        ex /= ed; ey /= ed; ez /= ed;
        f[e.a][0] += ex * w; f[e.a][1] += ey * w; f[e.a][2] += ez * w;
        f[e.b][0] -= ex * w; f[e.b][1] -= ey * w; f[e.b][2] -= ez * w;
      }
      for (i = 0; i < N; i++) {
        var P = p[i], len = Math.sqrt(P[0] * P[0] + P[1] * P[1] + P[2] * P[2]) || 1e-3;
        // sit on a shell, keep the core clear
        var want = 0.88, pull = (want - len) * 1.3;
        if (len < 0.5) pull += (0.5 - len) * 4;
        f[i][0] += P[0] / len * pull; f[i][1] += P[1] / len * pull; f[i][2] += P[2] / len * pull;
        var m = Math.sqrt(f[i][0] * f[i][0] + f[i][1] * f[i][1] + f[i][2] * f[i][2]);
        var step = Math.min(m, 0.05 * cool + 0.004) / (m || 1);
        P[0] += f[i][0] * step; P[1] += f[i][1] * step; P[2] += f[i][2] * step;
      }
    }
    var cx = 0, cy = 0, cz = 0, mx = 0;
    p.forEach(function (q) { cx += q[0]; cy += q[1]; cz += q[2]; });
    cx /= N; cy /= N; cz /= N;
    p.forEach(function (q) {
      q[0] -= cx; q[1] -= cy; q[2] -= cz;
      mx = Math.max(mx, Math.sqrt(q[0] * q[0] + q[1] * q[1] + q[2] * q[2]));
    });
    p.forEach(function (q) { q[0] = q[0] / mx * 0.92; q[1] = q[1] / mx * 0.9; q[2] /= mx; });
    return p;
  }
  function deg(i) { var n = 0; for (var k in adj[i]) if (Object.prototype.hasOwnProperty.call(adj[i], k)) n++; return n || 1; }

  var base = layout();
  var CORE = N;            // index of the core in the node arrays

  // edge list for the GPU: venture pairs first, then one spoke per venture
  var ALL = edges.map(function (e) { return { a: e.a, b: e.b, kind: e.live ? 1 : 0 }; });
  ventures.forEach(function (v, i) { ALL.push({ a: CORE, b: i, kind: 2 }); });

  /* ---------------------------------------------------------------- mats */

  function mul(a, b) {
    var o = new Float32Array(16);
    for (var c = 0; c < 4; c++) for (var r = 0; r < 4; r++) {
      var s = 0;
      for (var k = 0; k < 4; k++) s += a[k * 4 + r] * b[c * 4 + k];
      o[c * 4 + r] = s;
    }
    return o;
  }
  function rotY(a) { var c = Math.cos(a), s = Math.sin(a); return new Float32Array([c, 0, -s, 0, 0, 1, 0, 0, s, 0, c, 0, 0, 0, 0, 1]); }
  function rotX(a) { var c = Math.cos(a), s = Math.sin(a); return new Float32Array([1, 0, 0, 0, 0, c, s, 0, 0, -s, c, 0, 0, 0, 0, 1]); }
  function trans(z) { return new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, z, 1]); }

  /* ------------------------------------------------------------- shaders */

  var PRE = '#version 300 es\nprecision highp float;\n' +
    'uniform mat4 uV, uP; uniform vec3 uNP[' + (MAXN + 1) + ']; uniform vec3 uNS[' + (MAXN + 1) + '];\n' +
    'uniform float uE[' + MAXE + ']; uniform vec2 uRes; uniform float uDpr, uD, uR, uTime;\n' +
    'const vec3 ACC = vec3(1.0, 0.353, 0.212);\n';
  var PREF = '#version 300 es\nprecision highp float;\n' +
    'uniform float uDpr, uD, uR, uTime;\nconst vec3 ACC = vec3(1.0, 0.353, 0.212);\n';
  var BEZ = 'vec3 bez(vec3 a, vec3 b, float t, float k){\n' +
    '  vec3 m = (a + b) * 0.5; vec3 c = k > 1.5 ? m : m * 0.88;\n' +
    '  float u = 1.0 - t; return u * u * a + 2.0 * u * t * c + t * t * b;\n}\n';

  var SRC = {};

  // edges: one-pixel ribbons. Live links are always drawn; planned links and
  // the factory's spokes only appear when a venture (or the core) is hovered.
  SRC.edgeV = PRE + BEZ +
    'in vec4 aE; in vec2 aT;\n' +
    'out float vH, vK, vAp, vX, vT, vEi;\n' +
    'vec2 scr(vec4 c){ return c.xy / c.w * uRes * 0.5; }\n' +
    'void main(){\n' +
    '  int ia = int(aE.x + 0.5), ib = int(aE.y + 0.5);\n' +
    '  vec3 A = uNP[ia], B = uNP[ib]; float k = aE.w;\n' +
    '  vec4 c0 = uP * (uV * vec4(bez(A, B, aT.x, k), 1.0));\n' +
    '  float t2 = aT.x < 0.97 ? aT.x + 0.03 : aT.x - 0.03; float sg = aT.x < 0.97 ? 1.0 : -1.0;\n' +
    '  vec4 c1 = uP * (uV * vec4(bez(A, B, t2, k), 1.0));\n' +
    '  vec2 dir = normalize((scr(c1) - scr(c0)) * sg + vec2(1e-5));\n' +
    '  vec2 off = vec2(-dir.y, dir.x) * aT.y * 1.0;\n' +
    '  gl_Position = c0 + vec4(off / uRes * 2.0 * c0.w, 0.0, 0.0);\n' +
    '  vH = uE[int(aE.z + 0.5)]; vK = k; vAp = min(uNS[ia].z, uNS[ib].z); vX = aT.y; vT = aT.x; vEi = aE.z;\n}\n';
  SRC.edgeF = PREF +
    'in float vH, vK, vAp, vX, vT, vEi; out vec4 o;\n' +
    'void main(){\n' +
    '  float cov = clamp(1.0 - abs(vX) * 0.8, 0.0, 1.0);\n' +
    '  float k = vK, h = vH; bool live = k > 0.5 && k < 1.5;\n' +
    '  float ph = fract(uTime * 0.045 + vEi * 0.381) * 1.5 - 0.25;\n' +
    '  float beam = exp(-pow((vT - ph) / 0.1, 2.0));\n' +
    '  float a = live ? 0.3 + 0.55 * beam : 0.0;\n' +
    '  if (h > 0.0) a = live ? a + 0.2 * h : (k < 0.5 ? 0.26 + 0.3 * beam : 0.16) * h;\n' +
    '  else a *= 1.0 + h * 0.85;\n' +
    '  a *= cov * vAp;\n' +
    '  vec3 col = mix(vec3(0.93, 0.92, 0.9), ACC, min(beam * 0.55, 0.55) * (live || h > 0.0 ? 1.0 : 0.0));\n' +
    '  o = vec4(col * a, a);\n}\n';

  // the core: a one-pixel ring and a small dot, nothing else
  SRC.coreV = PRE +
    'in vec2 aC; uniform float uSz; out vec2 vC;\n' +
    'void main(){\n' +
    '  vec4 c = uP * (uV * vec4(0.0, 0.0, 0.0, 1.0));\n' +
    '  gl_Position = c + vec4(aC * uSz / uRes * 2.0 * c.w, 0.0, 0.0);\n' +
    '  vC = aC;\n}\n';
  SRC.coreF = PREF +
    'in vec2 vC; uniform float uSz, uRc, uEm, uAp; out vec4 o;\n' +
    'void main(){\n' +
    '  float d = length(vC) * uSz;\n' +
    '  float ring = 1.0 - smoothstep(0.35, 1.0, abs(d - uRc));\n' +
    '  float nuc = 1.0 - smoothstep(1.6, 2.6, d);\n' +
    '  float ra = (0.5 + 0.4 * clamp(uEm, 0.0, 1.0)) * ring;\n' +
    '  vec3 col = vec3(0.93, 0.92, 0.9) * ra + ACC * nuc;\n' +
    '  o = vec4(col * uAp, max(ra, nuc) * uAp);\n}\n';

  // tiles: a frosted-glass rounded square per venture, drawn in true perspective
  // and tilted toward the pointer; the mark is flat and monochrome until hover
  SRC.nodeV = PRE +
    'in vec2 aC; in float aId; uniform float uSz, uRp, uTk; uniform vec2 uPtr;\n' +
    'out vec2 vC, vTl; out float vId, vEm, vAp;\n' +
    'void main(){\n' +
    '  int id = int(aId + 0.5);\n' +
    '  vec4 vp = uV * vec4(uNP[id], 1.0); vec3 s = uNS[id];\n' +
    '  vec2 nd = (uP * vp).xy / (uP * vp).w;\n' +
    '  float idle = 0.05 * sin(uTime * 0.35 + aId * 1.7);\n' +
    '  vec2 d = (uPtr - nd) * uTk;\n' +
    '  float ry = clamp(d.x * 0.7, -0.5, 0.5) + idle, rx = clamp(-d.y * 0.7, -0.5, 0.5) + idle * 0.6;\n' +
    '  float hw = uSz * 0.5 * 1.38 / uRp * (0.5 + 0.5 * s.z) * (1.0 + 0.22 * max(s.x, 0.0));\n' +
    '  vec3 q = vec3(aC * hw, 0.0);\n' +
    '  q = vec3(q.x, q.y * cos(rx), q.y * sin(rx));\n' +
    '  q = vec3(q.x * cos(ry), q.y, q.z - q.x * sin(ry));\n' +
    '  gl_Position = uP * vec4(vp.xyz + q + vec3(0.0, 0.0, max(s.x, 0.0) * 0.08), 1.0);\n' +
    '  vC = aC; vTl = vec2(ry, rx); vId = aId; vEm = s.x; vAp = s.z;\n}\n';
  SRC.nodeF = PREF +
    'in vec2 vC, vTl; in float vId, vEm, vAp; uniform sampler2D uAt; uniform vec2 uGrid; out vec4 o;\n' +
    'float rr(vec2 p, float r){ vec2 q = abs(p) - vec2(1.0 - r); return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r; }\n' +
    'void main(){\n' +
    '  vec2 p = vC * 1.38;\n' +
    '  float d = rr(p, 0.36); float aa = fwidth(d) * 0.9 + 1e-4;\n' +
    '  float inside = 1.0 - smoothstep(-aa, aa, d);\n' +
    '  float em = vEm; float hl = clamp(em, 0.0, 1.0);\n' +
    '  float dim = em < 0.0 ? mix(1.0, 0.28, -em) : 1.0;\n' +
    '  float sd = rr(p - vec2(0.0, 0.17), 0.36);\n' +
    '  float shadow = (1.0 - smoothstep(-0.1, 0.42, sd)) * 0.55 * (1.0 - inside);\n' +
    '  float top = clamp(p.y * 0.5 + 0.5 + vTl.y * 0.7, 0.0, 1.0);\n' +
    '  float body = mix(0.035, 0.15, top * top) + 0.06 * hl;\n' +
    '  float rim = smoothstep(-aa * 3.0, -aa * 0.4, d) * inside;\n' +
    '  float lightDir = p.y * 0.8 - p.x * 0.35 + vTl.x * 0.9 + 0.25;\n' +
    '  float rimA = rim * (0.1 + 0.5 * smoothstep(0.0, 1.0, lightDir));\n' +
    '  float sweep = (1.0 - smoothstep(0.0, 0.5, abs(p.x * 0.55 - p.y * 0.8 + 0.2 - vTl.x * 1.5))) * 0.06 * inside;\n' +
    '  float gA = inside * body + rimA + sweep;\n' +
    '  vec3 gc = mix(vec3(0.95, 0.94, 0.92), ACC, hl * rim * 0.8);\n' +
    '  vec2 mp = vec2(p.x, p.y) / 0.62;\n' +
    '  float mm = step(abs(mp.x), 1.0) * step(abs(mp.y), 1.0);\n' +
    '  float col = floor(vId + 0.5); float row = floor(col / uGrid.x); col = col - row * uGrid.x;\n' +
    '  vec2 uv = (vec2(col, row) + clamp(vec2(mp.x, -mp.y) * 0.5 + 0.5, 0.01, 0.99)) / uGrid;\n' +
    '  vec4 t = texture(uAt, uv, -0.2) * mm;\n' +
    '  float al = max(t.a, 1e-3); vec3 rgb = t.rgb / al;\n' +
    '  float lum = dot(rgb, vec3(0.299, 0.587, 0.114));\n' +
    '  vec3 mono = vec3(0.93, 0.92, 0.9) * mix(0.34, 1.0, clamp(lum * 1.6, 0.0, 1.0)) * 0.78;\n' +
    '  vec3 mk = mix(mono, rgb, hl) * t.a;\n' +
    '  vec4 L = vec4(0.0, 0.0, 0.0, shadow);\n' +
    '  L = vec4(vec3(0.015) * inside * 0.55, inside * 0.55) + L * (1.0 - inside * 0.55);\n' +
    '  L = vec4(gc * gA, gA) + L * (1.0 - gA);\n' +
    '  L = vec4(mk, t.a) + L * (1.0 - t.a);\n' +
    '  o = L * (dim * vAp);\n}\n';

  // contact shadow on the floor under each tile
  SRC.shV = PRE +
    'in vec2 aC; in float aId; uniform float uSz, uRp, uFloor; out vec2 vC; out float vA;\n' +
    'void main(){\n' +
    '  int id = int(aId + 0.5); vec3 p = uNP[id]; vec3 s = uNS[id];\n' +
    '  float hw = uSz * 0.5 / uRp * (0.5 + 0.5 * s.z);\n' +
    '  float h = max(p.y - uFloor, 0.0);\n' +
    '  vec3 q = vec3(p.x + aC.x * hw * 1.9, uFloor, p.z + aC.y * hw * 1.5);\n' +
    '  gl_Position = uP * (uV * vec4(q, 1.0));\n' +
    '  vC = aC; vA = s.z / (1.0 + h * 1.6) * (s.x < 0.0 ? 1.0 + s.x * 0.8 : 1.0);\n}\n';
  SRC.shF = PREF +
    'in vec2 vC; in float vA; out vec4 o;\n' +
    'void main(){ float r = length(vC); float a = pow(1.0 - smoothstep(0.0, 1.0, r), 2.0) * 0.7 * vA; o = vec4(0.0, 0.0, 0.0, a); }\n';

  // the floor: an isometric (triangular) lattice of faint dots that recedes into the dark
  SRC.gridV = PRE +
    'in vec3 aG; uniform float uFloor, uIn; out float vA;\n' +
    'void main(){\n' +
    '  vec4 vp = uV * vec4(aG.x, uFloor, aG.y, 1.0); gl_Position = uP * vp;\n' +
    '  float r = length(aG.xy);\n' +
    '  gl_PointSize = 1.5 * uDpr * clamp(uD / -vp.z, 0.6, 1.3);\n' +
    '  vA = (1.0 - smoothstep(0.2, 1.65, r)) * 0.42 * uIn;\n}\n';
  SRC.gridF = PREF +
    'in float vA; out vec4 o;\n' +
    'void main(){ float d = length(gl_PointCoord - 0.5) * 2.0; float a = vA * (1.0 - smoothstep(0.5, 1.0, d)); o = vec4(vec3(0.93, 0.92, 0.9) * a, a); }\n';

  // labels: a name under a neighbouring node while a venture is hovered
  SRC.labV = PRE +
    'in vec2 aC; in float aId; uniform float uSz; uniform vec2 uLab; uniform vec2 uLGrid;\n' +
    'out vec2 vUV; out float vA;\n' +
    'void main(){\n' +
    '  int id = int(aId + 0.5);\n' +
    '  vec4 vp = uV * vec4(uNP[id], 1.0); vec4 c = uP * vp; vec3 s = uNS[id];\n' +
    '  float rad = uSz * uD / -vp.z * (0.5 + 0.5 * s.z) * (1.0 + 0.22 * max(s.x, 0.0)) * 0.5;\n' +
    '  vec2 px = aC * uLab * 0.5 + vec2(0.0, -(rad * 1.12 + uLab.y * 0.5 + 8.0));\n' +
    '  gl_Position = c + vec4(px / uRes * 2.0 * c.w, 0.0, 0.0);\n' +
    '  float em = s.x;\n' +
    '  vA = (em > 0.3 && em < 0.95) ? clamp((em - 0.3) * 2.0, 0.0, 1.0) * s.z : 0.0;\n' +
    '  float col = aId, row = floor(col / uLGrid.x); col -= row * uLGrid.x;\n' +
    '  vUV = (vec2(col, row) + vec2(aC.x * 0.5 + 0.5, 0.5 - aC.y * 0.5)) / uLGrid;\n}\n';
  SRC.labF = PREF +
    'in vec2 vUV; in float vA; uniform sampler2D uAt; out vec4 o;\n' +
    'void main(){\n' +
    '  float a = texture(uAt, vUV).a * vA * 0.85; o = vec4(vec3(0.93, 0.92, 0.9) * a, a);\n}\n';

  /* ------------------------------------------------------------- bring-up */

  var gl, canvas, progs = {}, vaos = {}, bufs = {}, tex = {};
  var W = 0, H = 0, dpr = 1, DPR_CAP = 1.5;
  var phone = false;
  var logos = null;
  var running = false, visible = true, started = false, lost = false;
  var tip, legend, srList;
  var UF = {};

  function compile(vs, fs) {
    function sh(type, src) {
      var s = gl.createShader(type);
      gl.shaderSource(s, src); gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
      return s;
    }
    var p = gl.createProgram();
    gl.attachShader(p, sh(gl.VERTEX_SHADER, vs));
    gl.attachShader(p, sh(gl.FRAGMENT_SHADER, fs));
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
    p.u = {};
    return p;
  }
  function U(p, name) {
    if (!(name in p.u)) p.u[name] = gl.getUniformLocation(p, name);
    return p.u[name];
  }
  function buf(target, data, usage) {
    var b = gl.createBuffer();
    gl.bindBuffer(target, b);
    gl.bufferData(target, data, usage || gl.STATIC_DRAW);
    return b;
  }
  function attr(p, name, size, stride, offset, divisor) {
    var loc = gl.getAttribLocation(p, name);
    if (loc < 0) return;
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, size, gl.FLOAT, false, stride, offset);
    gl.vertexAttribDivisor(loc, divisor || 0);
  }

  function loadMarks() {
    var cv = document.createElement('canvas');
    var rows = Math.ceil(N / COLS);
    cv.width = COLS * CELL; cv.height = rows * CELL;
    var c = cv.getContext('2d');
    var jobs = ventures.map(function (v, i) {
      var cx = (i % COLS) * CELL + CELL / 2, cy = Math.floor(i / COLS) * CELL + CELL / 2;
      if (!v.logo) return Promise.resolve();
      var url = '/assets/' + v.logo;
      return fetch(url).then(function (r) { return r.ok ? r.text() : Promise.reject(); }).then(function (txt) {
        // The marks are animated SVGs. Freeze each on a lit frame so the
        // atlas shows a legible mark rather than the t=0 frame, which is dim.
        txt = txt.replace(/<svg\b[^>]*>/, function (m) {
          return m + '<style>*{animation-play-state:paused!important;animation-delay:-' + (v.name === 'Kontinuum' ? 4.2 : 1.35) + 's!important}</style>';
        });
        return new Promise(function (res, rej) {
          var img = new Image();
          img.onload = function () { res(img); };
          img.onerror = rej;
          img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(txt);
        });
      }).then(function (img) {
        var lw = v.logoW || 120, lh = v.logoH || 120;
        var box = CELL * 0.84, s = Math.min(box / lw, box / lh);
        var w = lw * s, h = lh * s;
        c.drawImage(img, cx - w / 2, cy - h / 2, w, h);
        // some marks are drawn in thin, translucent strokes; as a flat
        // monochrome mark they would vanish, so thicken the faint ones
        var x0 = Math.round(cx - CELL / 2), y0 = Math.round(cy - CELL / 2);
        var px = c.getImageData(x0, y0, CELL, CELL).data, sum = 0, n = 0, q;
        for (q = 3; q < px.length; q += 4) if (px[q] > 6) { sum += px[q]; n++; }
        if (n && sum / n < 110) for (q = 0; q < 3; q++) c.drawImage(img, cx - w / 2, cy - h / 2, w, h);
      }).catch(function () { /* the disc alone is still a node */ });
    });
    return Promise.all(jobs).then(function () { return cv; });
  }

  function labelAtlas() {
    var rows = Math.ceil((N + 1) / LCOLS);
    var cv = document.createElement('canvas');
    cv.width = LCOLS * LCW; cv.height = rows * LCH;
    var c = cv.getContext('2d');
    c.fillStyle = '#fff'; c.textBaseline = 'middle'; c.textAlign = 'center';
    var names = ventures.map(function (v) { return v.name; });
    names.forEach(function (name, i) {
      var cx = (i % LCOLS) * LCW + LCW / 2, cy = Math.floor(i / LCOLS) * LCH + LCH / 2 + 1;
      var txt = name.toUpperCase();
      c.font = '500 19px "IBM Plex Mono", ui-monospace, Menlo, monospace';
      if (c.letterSpacing !== undefined) c.letterSpacing = '2px';
      var w = c.measureText(txt).width, max = LCW - 12;
      c.save(); c.translate(cx, cy);
      if (w > max) c.scale(max / w, 1);
      c.fillText(txt, 0, 0);
      c.restore();
    });
    return cv;
  }

  function upload(cv, mip) {
    var t = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, cv);
    if (mip) gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, mip ? gl.LINEAR_MIPMAP_LINEAR : gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    return t;
  }

  var floorY = -1.02, gridN = 0;

  function buildGPU(markCanvas) {
    // programs
    progs.edge = compile(SRC.edgeV, SRC.edgeF);
    progs.sh = compile(SRC.shV, SRC.shF);
    progs.grid = compile(SRC.gridV, SRC.gridF);
    progs.core = compile(SRC.coreV, SRC.coreF);
    progs.node = compile(SRC.nodeV, SRC.nodeF);
    progs.lab = compile(SRC.labV, SRC.labF);

    // edge ribbons: (SEG+1) * 2 vertices per edge, indexed triangles
    var nv = (SEG + 1) * 2, ev = new Float32Array(ALL.length * nv * 6), ei = new Uint16Array(ALL.length * SEG * 6);
    ALL.forEach(function (e, k) {
      for (var s = 0; s <= SEG; s++) for (var sd = 0; sd < 2; sd++) {
        var o = (k * nv + s * 2 + sd) * 6;
        ev[o] = e.a; ev[o + 1] = e.b; ev[o + 2] = k; ev[o + 3] = e.kind;
        ev[o + 4] = s / SEG; ev[o + 5] = sd ? 1 : -1;
      }
      for (var q = 0; q < SEG; q++) {
        var v0 = k * nv + q * 2, io = (k * SEG + q) * 6;
        ei[io] = v0; ei[io + 1] = v0 + 1; ei[io + 2] = v0 + 2;
        ei[io + 3] = v0 + 1; ei[io + 4] = v0 + 3; ei[io + 5] = v0 + 2;
      }
    });
    vaos.edge = gl.createVertexArray(); gl.bindVertexArray(vaos.edge);
    bufs.edge = buf(gl.ARRAY_BUFFER, ev);
    attr(progs.edge, 'aE', 4, 24, 0); attr(progs.edge, 'aT', 2, 24, 16);
    bufs.edgeI = buf(gl.ELEMENT_ARRAY_BUFFER, ei);
    vaos.edgeCount = ei.length;

    // floor lattice, triangular so it reads as isometric
    var rnd = mulberry(7), gp = [], sp = phone ? 0.15 : 0.12, R = 1.65, gi, gj;
    for (gj = -Math.ceil(R / (sp * 0.866)); gj <= Math.ceil(R / (sp * 0.866)); gj++) {
      for (gi = -Math.ceil(R / sp); gi <= Math.ceil(R / sp); gi++) {
        var gx = (gi + (gj & 1) * 0.5) * sp, gz = gj * sp * 0.866;
        if (gx * gx + gz * gz < R * R) gp.push(gx, gz, rnd());
      }
    }
    gridN = gp.length / 3;
    vaos.grid = gl.createVertexArray(); gl.bindVertexArray(vaos.grid);
    bufs.grid = buf(gl.ARRAY_BUFFER, new Float32Array(gp)); attr(progs.grid, 'aG', 3, 12, 0);

    // quad shared by core, nodes, labels
    var quad = buf(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]));
    vaos.core = gl.createVertexArray(); gl.bindVertexArray(vaos.core);
    gl.bindBuffer(gl.ARRAY_BUFFER, quad); attr(progs.core, 'aC', 2, 8, 0);

    bufs.ids = buf(gl.ARRAY_BUFFER, new Float32Array(N), gl.DYNAMIC_DRAW);
    vaos.node = gl.createVertexArray(); gl.bindVertexArray(vaos.node);
    gl.bindBuffer(gl.ARRAY_BUFFER, quad); attr(progs.node, 'aC', 2, 8, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, bufs.ids); attr(progs.node, 'aId', 1, 4, 0, 1);
    vaos.lab = gl.createVertexArray(); gl.bindVertexArray(vaos.lab);
    gl.bindBuffer(gl.ARRAY_BUFFER, quad); attr(progs.lab, 'aC', 2, 8, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, bufs.ids); attr(progs.lab, 'aId', 1, 4, 0, 1);
    vaos.sh = gl.createVertexArray(); gl.bindVertexArray(vaos.sh);
    gl.bindBuffer(gl.ARRAY_BUFFER, quad); attr(progs.sh, 'aC', 2, 8, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, bufs.ids); attr(progs.sh, 'aId', 1, 4, 0, 1);

    gl.bindVertexArray(null);

    gl.activeTexture(gl.TEXTURE0); tex.marks = upload(markCanvas, true);
    gl.activeTexture(gl.TEXTURE1); tex.labels = upload(labelAtlas(), false);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
    gl.enable(gl.BLEND);
  }

  /* ----------------------------------------------------------- the scene */

  var st = {
    t0: 0, time: 0, last: 0, yaw: 0.6, pitch: 0.46,
    px: 0, py: 0, tx: 0, ty: 0,          // parallax, smoothed and target
    tiltX: 0, tiltY: 0,
    rot: 1, intro: reduced ? 1 : 0,
    hov: -1, sel: -1, focus: -1,
    coreFlash: 0, vyaw: 0, tk: 0, pnx: 0, pny: 0
  };
  var NP = new Float32Array((MAXN + 1) * 3);
  var NS = new Float32Array((MAXN + 1) * 3);
  var EM = new Float32Array(MAXE);
  var emT = new Float32Array(N + 1), emC = new Float32Array(N + 1), edT = new Float32Array(MAXE), edC = new Float32Array(MAXE);
  var flash = new Float32Array(N + 1);
  var scr = [];               // projected nodes for hit testing
  var order = [];
  var V, P_, camD = 3.0, Rpx = 300, cxPx = 0, cyPx = 0, nodePx = 60;
  var ptr = { x: -999, y: -999, type: 'mouse', inside: false };
  var dirty = true, lastFrameMs = [], quality = 1;
  var drag = null, skipClick = false;

  function ease3(x) { x = clamp(x, 0, 1); return 1 - Math.pow(1 - x, 3); }

  function headlineRight() {
    var h1 = document.getElementById('fz-headline');
    if (!h1) return 0;
    var r = document.createRange(); r.selectNodeContents(h1);
    var rects = r.getClientRects(), right = 0, left = canvas.getBoundingClientRect().left;
    for (var i = 0; i < rects.length; i++) right = Math.max(right, rects[i].right - left);
    return right;
  }

  function headlineTop() {
    var h1 = document.getElementById('fz-headline');
    if (!h1) return 0;
    var r = document.createRange(); r.selectNodeContents(h1);
    var rects = r.getClientRects(), t = 1e9;
    for (var i = 0; i < rects.length; i++) t = Math.min(t, rects[i].top);
    return t === 1e9 ? 0 : t;
  }

  function resize() {
    var w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return false;
    phone = w < 760;
    dpr = Math.min(window.devicePixelRatio || 1, DPR_CAP) * (quality < 1 ? 0.75 : 1);
    dpr = Math.max(1, Math.min(dpr, DPR_CAP));
    if (w !== W || h !== H || canvas.width !== Math.round(w * dpr)) {
      W = w; H = h;
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
      gl.viewport(0, 0, canvas.width, canvas.height);
    }
    var wide = W > 900;
    if (wide) {
      // Fit the cluster into the space right of the headline's text, not
      // its box: measure where each line of the h1 actually ends.
      var free = headlineRight() + 28, edge = W - 22;
      var EXT = 1.2;                       // projected half-width of the cluster, in Rpx
      var fit = (edge - free) / 2 / EXT;
      Rpx = Math.max(Math.min(W * 0.235, H * 0.335, fit), 96);
      cxPx = Math.min(edge - Rpx * EXT, Math.max(free + Rpx * EXT, W * 0.62));
      if (cxPx - Rpx * EXT < free) cxPx = free + Rpx * EXT;
      cyPx = H * 0.44;
    } else {
      // phone: use the gap between the readout and the headline, and let the
      // cluster tuck a little way behind the first line of the headline
      var box = canvas.getBoundingClientRect(), ro = document.querySelector('.readout'), top = H * 0.2, bot = H * 0.55;
      if (ro) top = ro.getBoundingClientRect().bottom - box.top + 6;
      var tt = headlineTop();
      if (tt) bot = tt - box.top + 44;
      cxPx = W * 0.5;
      Rpx = clamp((bot - top) / 2 / 1.1, 80, W * 0.37);
      cyPx = (top + bot) / 2;
    }
    nodePx = Math.max(Rpx * (wide ? 0.158 : 0.215), 27);
    dirty = true;
    return true;
  }

  function matrices() {
    var fo = camD * Rpx;                 // focal length in px
    var sx = cxPx / W * 2 - 1, sy = 1 - cyPx / H * 2;
    var n = 0.1, f = 30;
    P_ = new Float32Array([
      fo / (W / 2), 0, 0, 0,
      0, fo / (H / 2), 0, 0,
      -sx, -sy, -(f + n) / (f - n), -1,
      0, 0, -2 * f * n / (f - n), 0
    ]);
    var yaw = st.yaw + st.px * 0.5 + st.tiltX * 0.5, pitch = st.pitch + st.py * 0.3 + st.tiltY * 0.3;
    V = mul(trans(-camD), mul(rotX(pitch), rotY(yaw)));
  }
  function viewPos(x, y, z) {
    return [V[0] * x + V[4] * y + V[8] * z + V[12], V[1] * x + V[5] * y + V[9] * z + V[13], V[2] * x + V[6] * y + V[10] * z + V[14]];
  }
  function project(x, y, z) {
    var v = viewPos(x, y, z), w = -v[2], fo = camD * Rpx;
    return { x: cxPx + v[0] * fo / w, y: cyPx - v[1] * fo / w, z: w };
  }

  function neighbours(i) {
    var out = [];
    for (var k in adj[i]) if (Object.prototype.hasOwnProperty.call(adj[i], k)) out.push([+k, adj[i][k]]);
    return out;
  }

  function setEmphasis() {
    var a = st.hov >= 0 ? st.hov : st.sel >= 0 ? st.sel : st.focus;
    var i, k;
    for (i = 0; i <= N; i++) emT[i] = 0;
    for (k = 0; k < MAXE; k++) edT[k] = 0;
    if (a >= 0) {
      for (i = 0; i <= N; i++) emT[i] = -1;
      for (k = 0; k < MAXE; k++) edT[k] = -1;
      if (a === CORE) {
        for (i = 0; i < N; i++) { emT[i] = 0.22; edT[edges.length + i] = 1; }
        emT[CORE] = 1;
      } else {
        emT[a] = 1;
        neighbours(a).forEach(function (n) { emT[n[0]] = 0.55; edT[n[1]] = 1; });
        edT[edges.length + a] = 0.5;
      }
    }
    active = a;
  }
  var active = -1;

  function frame(now) {
    var dt = Math.min(0.05, (now - (st.last || now)) / 1000);
    st.last = now;
    if (!st.t0) st.t0 = now;
    var t = reduced ? 6.5 : (now - st.t0) / 1000 + 4;
    st.time = t;

    if (!reduced) {
      st.intro = Math.min(1, st.intro + dt / 2.6);
      // slow eased orbit, plus whatever inertia a drag left behind
      st.yaw += (dt * 0.028 * st.rot + st.vyaw * dt);
      st.vyaw *= Math.exp(-dt * 2.4);
      if (!drag) st.pitch += (0.46 - st.pitch) * (1 - Math.exp(-dt * 0.5));
      st.rot += ((active >= 0 ? 0.08 : 1) - st.rot) * (1 - Math.exp(-dt * 3));
    } else st.intro = 1;
    var kp = reduced ? 1 : 1 - Math.exp(-dt * 4);
    var wantTk = (ptr.inside && ptr.type !== 'touch') || ptr.type === 'touch' ? 1 : 0;
    st.tk += (wantTk - st.tk) * (reduced ? 1 : 1 - Math.exp(-dt * 3));
    if (ptr.type === 'touch') { st.pnx = st.tiltX * 0.9; st.pny = -st.tiltY * 0.9; }
    else { st.pnx = ptr.x / W * 2 - 1; st.pny = 1 - ptr.y / H * 2; }
    st.px += (st.tx - st.px) * kp; st.py += (st.ty - st.py) * kp;

    matrices();

    // hover first, so emphasis targets are current
    if (dirty && ptr.inside && ptr.type !== 'touch' && !(drag && drag.moved > 6)) {
      var h = pick(ptr.x, ptr.y);
      if (h !== st.hov) { st.hov = h; hero.style.cursor = h >= 0 ? 'pointer' : ''; showTip(); }
    }
    setEmphasis();

    // ease emphasis and flashes
    var ke = reduced ? 1 : 1 - Math.exp(-dt * 9), kf = Math.exp(-dt * 3.6);
    var i, k;
    for (i = 0; i <= N; i++) { emC[i] += (emT[i] - emC[i]) * ke; flash[i] *= kf; }
    for (k = 0; k < MAXE; k++) edC[k] += (edT[k] - edC[k]) * ke;
    st.coreFlash *= kf;

    // node positions: layout, a slow drift, and the intro bloom out of the core
    for (i = 0; i < N; i++) {
      var ap = ease3(st.intro * 1.7 - (i / N) * 0.7);
      var b = base[i], dr = reduced ? 0 : 0.01;
      var s = 0.12 + 0.88 * ap;
      NP[i * 3] = (b[0] + Math.sin(t * 0.21 + i * 1.7) * dr) * s;
      NP[i * 3 + 1] = (b[1] + Math.sin(t * 0.17 + i * 2.3) * dr) * s;
      NP[i * 3 + 2] = (b[2] + Math.sin(t * 0.15 + i * 0.9) * dr) * s;
      NS[i * 3] = emC[i]; NS[i * 3 + 1] = flash[i]; NS[i * 3 + 2] = ap;
    }
    NP[CORE * 3] = NP[CORE * 3 + 1] = NP[CORE * 3 + 2] = 0;
    NS[CORE * 3] = emC[CORE]; NS[CORE * 3 + 1] = st.coreFlash; NS[CORE * 3 + 2] = ease3(st.intro * 3);
    for (k = 0; k < MAXE; k++) EM[k] = edC[k];

    // sort back to front for the painter's pass, and keep screen positions for picking
    order.length = 0;
    for (i = 0; i < N; i++) {
      var pr = project(NP[i * 3], NP[i * 3 + 1], NP[i * 3 + 2]);
      pr.i = i; scr[i] = pr; order.push(pr);
    }
    scr[CORE] = project(0, 0, 0);
    order.sort(function (a, b2) { return b2.z - a.z; });
    var ids = new Float32Array(N);
    for (i = 0; i < N; i++) ids[i] = order[i].i;

    var nf = 0;
    while (nf < N && order[nf].z > camD) nf++;
    draw(ids, nf);
    positionTip();
    dirty = false;
  }

  function draw(ids, nf) {
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    var glob = function (p) {
      gl.useProgram(p);
      gl.uniformMatrix4fv(U(p, 'uV'), false, V);
      gl.uniformMatrix4fv(U(p, 'uP'), false, P_);
      gl.uniform3fv(U(p, 'uNP[0]'), NP);
      gl.uniform3fv(U(p, 'uNS[0]'), NS);
      gl.uniform1fv(U(p, 'uE[0]'), EM);
      gl.uniform2f(U(p, 'uRes'), W, H);
      gl.uniform1f(U(p, 'uDpr'), dpr);
      gl.uniform1f(U(p, 'uD'), camD);
      gl.uniform1f(U(p, 'uR'), 1);
      gl.uniform1f(U(p, 'uTime'), st.time);
    };
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    glob(progs.grid);
    gl.uniform1f(U(progs.grid, 'uFloor'), floorY);
    gl.uniform1f(U(progs.grid, 'uIn'), NS[CORE * 3 + 2]);
    gl.bindVertexArray(vaos.grid);
    gl.drawArrays(gl.POINTS, 0, gridN);

    gl.bindBuffer(gl.ARRAY_BUFFER, bufs.ids);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, ids);
    glob(progs.sh);
    gl.uniform1f(U(progs.sh, 'uSz'), nodePx);
    gl.uniform1f(U(progs.sh, 'uRp'), Rpx);
    gl.uniform1f(U(progs.sh, 'uFloor'), floorY);
    gl.bindVertexArray(vaos.sh);
    gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, N);

    glob(progs.edge);
    gl.bindVertexArray(vaos.edge);
    gl.drawElements(gl.TRIANGLES, vaos.edgeCount, gl.UNSIGNED_SHORT, 0);

    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.bindBuffer(gl.ARRAY_BUFFER, bufs.ids);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, ids);

    glob(progs.node);
    gl.uniform1f(U(progs.node, 'uSz'), nodePx);
    gl.uniform1f(U(progs.node, 'uRp'), Rpx);
    gl.uniform1f(U(progs.node, 'uTk'), st.tk);
    gl.uniform2f(U(progs.node, 'uPtr'), st.pnx, st.pny);
    gl.uniform2f(U(progs.node, 'uGrid'), COLS, Math.ceil(N / COLS));
    gl.uniform1i(U(progs.node, 'uAt'), 0);
    var aIdLoc = gl.getAttribLocation(progs.node, 'aId');
    gl.bindVertexArray(vaos.node);
    function tiles(from, n) {
      if (n <= 0) return;
      gl.bindBuffer(gl.ARRAY_BUFFER, bufs.ids);
      gl.vertexAttribPointer(aIdLoc, 1, gl.FLOAT, false, 4, from * 4);
      gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, n);
    }
    // tiles behind the core, then the core, then the tiles in front of it
    tiles(0, nf);
    gl.blendFunc(gl.ONE, gl.ONE);
    glob(progs.core);
    var rc = clamp(Rpx * 0.07, 7, 20);
    gl.uniform1f(U(progs.core, 'uSz'), rc + 6);
    gl.uniform1f(U(progs.core, 'uRc'), rc);
    gl.uniform1f(U(progs.core, 'uEm'), Math.max(emC[CORE], 0));
    gl.uniform1f(U(progs.core, 'uAp'), NS[CORE * 3 + 2]);
    gl.bindVertexArray(vaos.core);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    glob(progs.node);
    gl.uniform1f(U(progs.node, 'uSz'), nodePx);
    gl.uniform1f(U(progs.node, 'uRp'), Rpx);
    gl.uniform1f(U(progs.node, 'uTk'), st.tk);
    gl.uniform2f(U(progs.node, 'uPtr'), st.pnx, st.pny);
    gl.uniform2f(U(progs.node, 'uGrid'), COLS, Math.ceil(N / COLS));
    gl.uniform1i(U(progs.node, 'uAt'), 0);
    gl.bindVertexArray(vaos.node);
    tiles(nf, N - nf);
    gl.bindBuffer(gl.ARRAY_BUFFER, bufs.ids);
    gl.vertexAttribPointer(aIdLoc, 1, gl.FLOAT, false, 4, 0);

    glob(progs.lab);
    gl.uniform1f(U(progs.lab, 'uSz'), nodePx);
    gl.uniform2f(U(progs.lab, 'uLab'), phone ? 100 : 118, phone ? 15 : 18);
    gl.uniform2f(U(progs.lab, 'uLGrid'), LCOLS, Math.ceil((N + 1) / LCOLS));
    gl.uniform1i(U(progs.lab, 'uAt'), 1);
    gl.bindVertexArray(vaos.lab);
    gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, N);
  }

  /* ------------------------------------------------------------ picking */

  function pick(x, y) {
    var best = -1, bz = 1e9, i;
    var touch = ptr.type === 'touch';
    for (i = 0; i < N; i++) {
      var s = scr[i];
      if (!s) continue;
      var rad = Math.max(nodePx * camD / s.z * 0.5 * (0.5 + 0.5 * NS[i * 3 + 2]), touch ? 24 : 15);
      var dx = x - s.x, dy = y - s.y;
      // when marks overlap under the pointer, the nearer one wins
      if (dx * dx + dy * dy < rad * rad && s.z < bz) { best = i; bz = s.z; }
    }
    if (best < 0 && scr[CORE]) {
      var c = scr[CORE], cr = Math.max(Rpx * 0.1, touch ? 30 : 22);
      if ((x - c.x) * (x - c.x) + (y - c.y) * (y - c.y) < cr * cr) return CORE;
    }
    return best;
  }

  /* ------------------------------------------------------------ tooltip */

  function mk(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }
  function oneLiner(v) {
    var s = (v.pitch && v.pitch.solution) || v.desc || '';
    var m = s.match(/^.*?[.!?](\s|$)/);
    s = m ? m[0].trim() : s;
    return s.length > 118 ? s.slice(0, 115).replace(/\s+\S*$/, '') + '…' : s;
  }
  function usesOf(i) {
    var v = ventures[i], out = [];
    (v.uses || []).forEach(function (u) {
      if (!(u.id in index)) return;
      var r = roles[u.role] || { phrase: u.role };
      out.push({ phrase: r.phrase, name: ventures[index[u.id]].name, live: u.status === 'live' });
    });
    out.sort(function (a, b) { return (b.live ? 1 : 0) - (a.live ? 1 : 0); });
    return out;
  }

  function buildTip() {
    tip = mk('div', 'h3d-tip');
    tip.setAttribute('aria-hidden', 'true');
    tip.innerHTML = '';
    tip._h = mk('div', 'h3d-tip-h');
    tip._id = mk('span', 'h3d-id'); tip._cat = mk('span', 'h3d-cat');
    tip._h.appendChild(tip._id); tip._h.appendChild(tip._cat);
    tip._name = mk('div', 'h3d-name');
    tip._one = mk('p', 'h3d-one');
    tip._uses = mk('ul', 'h3d-uses');
    tip._go = mk('a', 'h3d-go', 'OPEN VENTURE →');
    tip.appendChild(tip._h); tip.appendChild(tip._name); tip.appendChild(tip._one); tip.appendChild(tip._uses); tip.appendChild(tip._go);
    hero.appendChild(tip);
  }
  var tipFor = -2;
  function showTip() {
    var a = st.hov >= 0 ? st.hov : st.sel >= 0 ? st.sel : st.focus;
    if (a === tipFor) return;
    tipFor = a;
    if (a < 0) { tip.classList.remove('is-on'); return; }
    tip._uses.textContent = '';
    if (a === CORE) {
      tip._id.textContent = 'FZ/01'; tip._cat.textContent = 'THE FACTORY';
      tip._name.textContent = 'Factory Zero';
      tip._one.textContent = 'The shared foundation every venture inherits: identity, payments, deploys, observability and the agent network.';
      var li = mk('li', 'live'); li.appendChild(mk('i')); li.appendChild(document.createTextNode(N + ' ventures, one factory'));
      tip._uses.appendChild(li);
      tip._go.setAttribute('href', '/ventures/'); tip._go.textContent = 'THE REGISTRY →';
    } else {
      var v = ventures[a];
      tip._id.textContent = v.id; tip._cat.textContent = v.category || v.status;
      tip._name.textContent = v.name;
      tip._one.textContent = oneLiner(v);
      var us = usesOf(a), shown = us.slice(0, 5);
      if (!us.length) {
        tip._uses.appendChild(mk('li', 'none', 'No sister-venture links yet'));
      }
      shown.forEach(function (u) {
        var li2 = mk('li', u.live ? 'live' : 'plan');
        li2.appendChild(mk('i'));
        li2.appendChild(document.createTextNode(u.phrase + ' '));
        li2.appendChild(mk('b', null, u.name));
        if (!u.live) li2.appendChild(mk('em', null, ' planned'));
        tip._uses.appendChild(li2);
      });
      if (us.length > shown.length) tip._uses.appendChild(mk('li', 'none', '+' + (us.length - shown.length) + ' more'));
      tip._go.setAttribute('href', '/ventures/' + slug(v) + '/'); tip._go.textContent = 'OPEN VENTURE →';
    }
    tip.classList.add('is-on');
    tip.classList.toggle('is-touch', ptr.type === 'touch' || st.sel === a);
    positionTip(true);
  }
  function positionTip() {
    if (tipFor < 0 || !tip) return;
    var s = scr[tipFor];
    if (!s) return;
    var tw = tip.offsetWidth || 270, th = tip.offsetHeight || 160;
    var rad = tipFor === CORE ? Rpx * 0.1 : nodePx * camD / s.z * 0.62;
    var x = s.x + rad + 14, y = s.y - 26;
    if (x + tw > W - 12) x = s.x - rad - 14 - tw;
    if (x < 12) x = Math.max(12, Math.min(W - tw - 12, s.x - tw / 2));
    y = clamp(y, 70, H - th - 16);
    if (phone) { x = clamp(s.x - tw / 2, 12, W - tw - 12); y = clamp(s.y + rad + 14, 70, H - th - 16); if (s.y + rad + 14 + th > H - 16) y = clamp(s.y - rad - th - 10, 70, H - th - 16); }
    tip.style.transform = 'translate(' + Math.round(x) + 'px,' + Math.round(y) + 'px)';
  }

  /* ----------------------------------------------------------- chrome */

  function buildLegend() {
    legend = mk('div', 'h3d-legend');
    legend.setAttribute('aria-hidden', 'true');
    var planned = edges.length - liveCount;
    legend.innerHTML = '<span class="k"><i class="l"></i>LIVE LINK · ' + liveCount + '</span>' +
      '<span class="k"><i class="p"></i>PLANNED · ' + planned + ' ON HOVER</span>' +
      '<span class="h">' + (window.matchMedia('(hover: none)').matches ? 'TAP A VENTURE' : 'HOVER A VENTURE') + '</span>';
    hero.appendChild(legend);
  }

  function buildList() {
    // The canvas is decorative; this is the same graph for assistive tech.
    srList = mk('ul', 'sr-only');
    srList.setAttribute('aria-label', 'Ventures and how they connect');
    ventures.forEach(function (v, i) {
      var li = mk('li');
      var a = mk('a', null, v.name);
      a.href = '/ventures/' + slug(v) + '/';
      a.addEventListener('focus', function () { st.focus = i; dirty = true; showTip(); kick(); });
      a.addEventListener('blur', function () { if (st.focus === i) { st.focus = -1; dirty = true; showTip(); kick(); } });
      li.appendChild(a);
      li.appendChild(document.createTextNode('. ' + oneLiner(v) + ' '));
      var us = usesOf(i);
      if (us.length) {
        li.appendChild(document.createTextNode(us.map(function (u) { return u.phrase + ' ' + u.name + (u.live ? ' (live)' : ' (planned)'); }).join('; ') + '.'));
      }
      srList.appendChild(li);
    });
    hero.appendChild(srList);
  }

  /* ------------------------------------------------------------- events */

  function local(e) {
    var r = canvas.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  }
  function bind() {
    hero.addEventListener('pointermove', function (e) {
      var l = local(e);
      ptr.x = l.x; ptr.y = l.y; ptr.type = e.pointerType || 'mouse';
      ptr.inside = true;
      if (drag) {
        var ddx = e.clientX - drag.lx, ddy = e.clientY - drag.ly, nowp = performance.now();
        drag.lx = e.clientX; drag.ly = e.clientY; drag.moved += Math.abs(ddx) + Math.abs(ddy);
        if (drag.moved > 6) {
          st.yaw += ddx * 0.006; st.pitch = clamp(st.pitch + ddy * 0.004, 0.05, 0.7);
          st.vyaw = clamp(st.vyaw * 0.5 + ddx * 0.006 / Math.max((nowp - drag.t) / 1000, 0.01) * 0.5, -2.5, 2.5);
          hero.style.cursor = 'grabbing'; hero.classList.add('is-dragging');
        }
        drag.t = nowp;
      }
      if (ptr.type !== 'touch') {
        st.tx = (e.clientX / window.innerWidth - 0.5) * 0.9;
        st.ty = (e.clientY / window.innerHeight - 0.5) * 0.7;
      }
      dirty = true; kick();
    }, { passive: true });
    hero.addEventListener('pointerleave', function () {
      ptr.inside = false; st.hov = -1; hero.style.cursor = ''; st.tx = st.ty = 0;
      showTip(); dirty = true; kick();
    });
    hero.style.touchAction = 'pan-y pinch-zoom';
    hero.addEventListener('pointerdown', function (e) {
      ptr.type = e.pointerType || 'mouse';
      if ((e.target.closest && e.target.closest('a, button')) || e.button > 0) return;
      drag = { lx: e.clientX, ly: e.clientY, t: performance.now(), moved: 0 };
      st.vyaw = 0;
    }, { passive: true });
    function endDrag() { if (drag) { if (drag.moved > 6) skipClick = true; drag = null; hero.style.cursor = ''; hero.classList.remove('is-dragging'); } }
    hero.addEventListener('pointerup', endDrag, { passive: true });
    hero.addEventListener('pointercancel', endDrag, { passive: true });
    hero.addEventListener('click', function (e) {
      if (skipClick) { skipClick = false; return; }
      if (e.target.closest && e.target.closest('a, button')) {
        if (!(e.target.closest('.h3d-tip'))) return;
        return;
      }
      var l = local(e);
      ptr.x = l.x; ptr.y = l.y;
      var h = pick(l.x, l.y);
      var touch = ptr.type === 'touch' || ptr.type === 'pen';
      if (touch) {
        if (h >= 0 && h === st.sel) go(h);
        else { st.sel = h; st.hov = -1; showTip(); dirty = true; kick(); }
      } else if (h >= 0) go(h);
    });
    window.addEventListener('deviceorientation', function (e) {
      if (e.gamma == null || e.beta == null || !phone) return;
      st.tiltX = clamp(e.gamma / 45, -1, 1) * 0.9;
      st.tiltY = clamp((e.beta - 50) / 45, -1, 1) * 0.7;
      dirty = true; kick();
    }, { passive: true });
    window.addEventListener('resize', function () { if (resize()) kick(true); });
    document.addEventListener('visibilitychange', syncRun);
    canvas.addEventListener('webglcontextlost', function (e) {
      e.preventDefault(); lost = true; teardown();
    });
  }
  function go(i) {
    if (i === CORE) location.href = '/ventures/';
    else location.href = '/ventures/' + slug(ventures[i]) + '/';
  }

  /* ----------------------------------------------------------- run loop */

  var raf = 0;
  function loop(now) {
    raf = 0;
    if (!running) return;
    var t0 = performance.now();
    frame(now);
    // if the device cannot hold ~40 fps, shave the pixel ratio once
    if (!reduced && quality === 1) {
      lastFrameMs.push(now);
      if (lastFrameMs.length > 120) {
        var span = (lastFrameMs[lastFrameMs.length - 1] - lastFrameMs[0]) / (lastFrameMs.length - 1);
        lastFrameMs.length = 0;
        if (span > 26 && st.intro >= 1) { quality = 0.5; resize(); }
      }
    }
    if (!reduced) raf = requestAnimationFrame(loop);
    else if (dirty || !settled()) raf = requestAnimationFrame(loop);
    else running = false;
  }
  function settled() {
    for (var i = 0; i <= N; i++) if (Math.abs(emC[i] - emT[i]) > 0.01) return false;
    return true;
  }
  function kick(force) {
    if (!started || lost) return;
    if (reduced) { running = true; if (!raf) raf = requestAnimationFrame(loop); return; }
    if (force && !raf && running) raf = requestAnimationFrame(loop);
  }
  function syncRun() {
    var want = visible && !document.hidden && started && !lost;
    if (want && !running) {
      running = true; st.last = 0;
      if (!raf) raf = requestAnimationFrame(loop);
    } else if (!want && running && !reduced) {
      running = false;
      if (raf) { cancelAnimationFrame(raf); raf = 0; }
    }
  }

  function teardown() {
    running = false;
    if (raf) cancelAnimationFrame(raf);
    window.FZ_HERO3D = false;
    hero.classList.remove('hero--3d');
    base2d.style.display = '';
    if (canvas && canvas.parentNode) canvas.parentNode.removeChild(canvas);
    [tip, legend].forEach(function (n) { if (n && n.parentNode) n.parentNode.removeChild(n); });
  }

  /* --------------------------------------------------------------- init */

  function init() {
    canvas = document.createElement('canvas');
    canvas.className = 'hero-canvas hero-canvas--3d';
    canvas.setAttribute('aria-hidden', 'true');
    gl = canvas.getContext('webgl2', { alpha: true, antialias: false, premultipliedAlpha: true, powerPreference: 'default', depth: false, stencil: false });
    if (!gl) return;
    base2d.parentNode.insertBefore(canvas, base2d.nextSibling);
    if (!resize()) { /* hidden: size on first intersect */ }
    loadMarks().then(function (cv) {
      try {
        buildGPU(cv);
      } catch (err) {
        if (window.console) console.warn('hero3d disabled:', err && err.message);
        teardown(); return;
      }
      buildTip(); buildLegend(); buildList(); bind();
      if (!W) resize();
      started = true;
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { if (resize()) kick(true); });
      window.FZ_HERO3D = true;
      hero.classList.add('hero--3d');
      requestAnimationFrame(function () { canvas.classList.add('is-on'); });
      // the 2D canvas can go once the 3D one has faded in
      setTimeout(function () { if (window.FZ_HERO3D) base2d.style.display = 'none'; }, 1400);
      if ('IntersectionObserver' in window) {
        new IntersectionObserver(function (en) {
          visible = en[0].isIntersecting;
          syncRun();
        }, { threshold: 0 }).observe(hero);
      }
      syncRun();
      if (reduced) { running = true; raf = requestAnimationFrame(loop); }
      window.FZ_HERO3D_STATS = { nodes: N, edges: edges.length, live: liveCount, planned: edges.length - liveCount, spokes: N, pulses: 0 };
    }).catch(function () { teardown(); });
  }

  function start() {
    if (window.requestIdleCallback) window.requestIdleCallback(init, { timeout: 2500 });
    else setTimeout(init, 400);
  }
  if (document.readyState === 'complete') start();
  else window.addEventListener('load', start);
})();
