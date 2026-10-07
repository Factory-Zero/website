// The /stack/ page, generated from the registry (assets/fz-data.js) by
// tools/sync-ventures.js: an App Store-style catalogue of the ventures on the
// Factory Zero stack (`stack`, `stackRole`, `stackGroup`, `open_source`), with
// each venture's real brand mark vendored into assets/logos/. Static HTML,
// no script needed to read it.
'use strict';
const fs = require('fs');
const path = require('path');

const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const FOUNDATION = 'The foundation';
// marks whose artwork sits small inside their own box get zoomed so every icon has a similar weight
const ZOOM = { 'Ledgers': 1.18, 'Sealbin': 1.35, 'PosPlugin': 1.25, 'Kontinuum': 1.2 };

module.exports = function stackPage(ctx) {
  const { V, ROOT, SITE, slug, pitch } = ctx;
  const stack = V.filter(v => v.stack);

  // The brand marks are the registry's own (assets/<name>-animated.svg); copy each
  // to assets/logos/<slug>.svg. A mark that carries its own rounded background tile
  // fills the squircle; one that does not sits padded on a dark tile.
  fs.mkdirSync(path.join(ROOT, 'assets', 'logos'), { recursive: true });
  const icon = (v, big) => {
    const cls = 'as-icon' + (big ? ' as-icon--lg' : '');
    if (!v.logo) return `<span class="${cls} as-icon--initial" aria-hidden="true">${esc(v.name.slice(0, 1))}</span>`;
    const src = fs.readFileSync(path.join(ROOT, 'assets', v.logo), 'utf8');
    // frozen on a lit frame: the marks animate on the registry, here they sit still
    // Kontinuum's trail is many dots with staggered delays: keep those delays, only pause, and show its loop
    const frozen = v.name === 'Kontinuum'
      ? '*{animation-play-state:paused!important}.kg{animation:none!important;opacity:.9!important}'
      : '*{animation-play-state:paused!important;animation-delay:-1.35s!important}';
    fs.writeFileSync(path.join(ROOT, 'assets', 'logos', `${slug(v)}.svg`),
      src.replace(/<svg\b[^>]*>/, mm => mm + `<style>${frozen}</style>`));
    const vb = src.match(/viewBox="([^"]+)"/), vw = vb ? parseFloat(vb[1].split(/[ ,]+/)[2]) : 120;
    let bg = false;
    src.replace(/<rect\b[^>]*>/g, m => {
      const w = m.match(/\bwidth="([\d.]+)"/), h = m.match(/\bheight="([\d.]+)"/);
      if (w && h && +w[1] >= vw * 0.45 && +h[1] >= vw * 0.2) bg = true;
      return m;
    });
    const z = ZOOM[v.name];
    return `<span class="${cls}${bg ? ' as-icon--bg' : ''}"${z ? ` style="--z:${z}"` : ''} aria-hidden="true"><img src="/assets/logos/${slug(v)}.svg" alt="" width="64" height="64" loading="lazy" decoding="async"></span>`;
  };
  const one = v => {
    const s = pitch(v).solution || v.desc || '';
    const m = s.match(/^.*?[.!?](\s|$)/);
    return m ? m[0].trim() : s;
  };
  const os = v => v.open_source ? `<span class="fzs-os" title="${esc(v.license)} licence">OPEN SOURCE</span>` : '';

  // who uses whom, from `uses`
  const users = new Map(stack.map(v => [v.id, []]));
  for (const v of V) for (const u of v.uses || []) if (users.has(u.id)) users.get(u.id).push({ v, live: u.status === 'live' });

  const row = v => `<li><a class="as-row" href="/ventures/${slug(v)}/">${icon(v)}<span class="as-txt"><span class="as-name">${esc(v.name)}</span><span class="as-sub">${esc(v.stackRole)}</span>${os(v)}</span><span class="as-pill">Open</span></a></li>`;
  const feat = v => `<li><a class="as-feat" href="/ventures/${slug(v)}/">${icon(v, true)}<span class="as-feat-b"><span class="as-feat-k">${esc(v.stackRole)}${os(v)}</span><span class="as-feat-name">${esc(v.name)}</span><span class="as-feat-one">${esc(one(v))}</span></span><span class="as-pill as-pill--lg">Open</span></a></li>`;

  const foundation = stack.filter(v => v.stackGroup === FOUNDATION);
  const groups = [];
  for (const v of stack) if (v.stackGroup !== FOUNDATION) {
    let g = groups.find(x => x.name === v.stackGroup);
    if (!g) groups.push(g = { name: v.stackGroup, items: [] });
    g.items.push(v);
  }
  const ranked = stack.slice().sort((a, b) => users.get(b.id).length - users.get(a.id).length || a.name.localeCompare(b.name));
  const chart = ranked.map((v, i) => {
    const n = users.get(v.id).length, live = users.get(v.id).filter(x => x.live).length;
    return `<li><a class="as-row as-row--chart" href="/ventures/${slug(v)}/"><span class="as-rank">${i + 1}</span>${icon(v)}<span class="as-txt"><span class="as-name">${esc(v.name)}</span><span class="as-sub">${n ? `${n} ${n === 1 ? 'venture uses' : 'ventures use'} it${live ? ` \u00b7 ${live} live` : ''}` : esc(v.stackRole)}</span></span><span class="as-pill">Open</span></a></li>`;
  }).join('\n');

  const osN = stack.filter(v => v.open_source).length;
  const osLine = `${osN * 2 > stack.length ? 'Most' : 'Part'} of the stack is open source: ${osN} of ${stack.length}.`;
  const cf = V.find(v => v.name === 'Cratefield');
  const eg = V.find(v => !v.stack && v.name === 'Undercover Rockstars') || V.find(v => !v.stack);
  const faq = [
    ['Is every venture part of the stack?', `No. ${stack.length} of ${V.length} are. The rest are standalone companies with their own product and brand; ${eg.name}, for example, uses some of the stack but does not add to it.`],
    ['Who decides what is on it?', 'A venture is on the stack when other ventures are built on it, or is meant to be. The list is the registry’s stack field, edited by hand, and the registry refuses to build if a venture that another venture uses is not marked.'],
    ['Can outside companies use these?', `Only where the registry says so, and each venture’s page says what you can use today. ${cf && pitch(cf).offer ? `For example, Cratefield: ${pitch(cf).offer}` : ''}`],
    ['What do live and planned mean?', 'Live means in use today, and checked. Planned means decided and tracked, not in use yet. Most links between ventures are still planned, and each venture’s page says which are live.']
  ];

  const hero = 'Every new venture is built on the same set of products, so it launches with email, deploys, support, agents, point of sale and more on day one.';
  const desc = 'The Factory Zero stack: the products every new venture is built on, what each one does, and which ventures use it.';
  const title = 'The stack · Factory Zero';
  const url = `${SITE}/stack/`;
  const tech = fs.readFileSync(path.join(ROOT, 'technology', 'index.html'), 'utf8');
  const head = fs.readFileSync(path.join(ROOT, 'ventures', 'index.html'), 'utf8').split('<script type="application/ld+json">')[0]
    .replace(/<title>[^<]*<\/title>/, `<title>${title}</title>`)
    .replace(/(<meta name="description" content=")[^"]*/, `$1${esc(desc)}`)
    .replace(/<link rel="canonical" href="[^"]*"/, `<link rel="canonical" href="${url}"`)
    .replace(/(<meta property="og:url" content=")[^"]*/, `$1${url}`)
    .replace(/(<meta property="og:title" content=")[^"]*/, `$1${title}`)
    .replace(/(<meta property="og:description" content=")[^"]*/, `$1${esc(desc)}`)
    .replace(/(<meta property="og:image:alt" content=")[^"]*/, `$1${title}`)
    .replace(/(<meta name="twitter:title" content=")[^"]*/, `$1${title}`)
    .replace(/(<meta name="twitter:description" content=")[^"]*/, `$1${esc(desc)}`);
  const header = tech.match(/<header class="site-header">[\s\S]*?<\/header>/)[0].replace(/ aria-current="page"/, '').replace('<a href="/stack/">STACK</a>', '<a href="/stack/" aria-current="page">STACK</a>');
  const footer = tech.match(/<footer class="site-subfooter">[\s\S]*?<\/footer>/)[0];
  const ld = JSON.stringify({ '@context': 'https://schema.org', '@graph': [
    { '@type': 'WebPage', '@id': `${url}#webpage`, url, name: title, description: desc, isPartOf: { '@id': `${SITE}/#website` }, about: { '@id': `${SITE}/#organization` }, inLanguage: 'en' },
    { '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Factory Zero', item: `${SITE}/` }, { '@type': 'ListItem', position: 2, name: 'The stack', item: url }] }
  ] }, null, 2).replace(/</g, '\\u003c');

  return `${head}<script type="application/ld+json">\n${ld}\n</script>
</head>
<body>
<a class="skip-link" href="#main">Skip to content</a>
${header}

<main id="main" class="as">

<section class="as-wrap as-hero">
  <p class="eyebrow">THE FACTORY ZERO STACK &middot; ${String(stack.length).padStart(2, '0')} OF ${String(V.length).padStart(2, '0')} VENTURES</p>
  <h1 class="as-h1">The foundation to launch ventures at&nbsp;scale.</h1>
  <p class="as-lede">${esc(hero)}</p>
  <p class="sk-os-line"><span class="fzs-os">OPEN SOURCE</span>${esc(osLine)}</p>
</section>

<section class="as-wrap as-sec" aria-labelledby="as-f">
  <h2 class="as-h2" id="as-f">${FOUNDATION}</h2>
  <ul class="as-feats">
${foundation.map(feat).join('\n')}
  </ul>
</section>

<div class="as-wrap as-shelves">
${groups.map((g, gi) => `  <section class="as-sec" aria-labelledby="as-g${gi}">
    <h2 class="as-h2" id="as-g${gi}">${esc(g.name)}</h2>
    <ul class="as-shelf">
${g.items.map(row).join('\n')}
    </ul>
  </section>`).join('\n')}
</div>

<section class="as-wrap as-sec" aria-labelledby="as-c">
  <h2 class="as-h2" id="as-c">Most used</h2>
  <ol class="as-shelf as-chart">
${chart}
  </ol>
</section>

<section class="as-wrap as-sec" aria-labelledby="how-h">
  <h2 class="as-h2" id="how-h">How it works</h2>
  <ol class="sk-steps">
    <li class="sk-reveal"><span class="sk-n">01</span><h3>The stack ventures are real products</h3><p>Each one is a company with its own brand, and it also serves customers outside Factory Zero.</p></li>
    <li class="sk-reveal" style="--d:80ms"><span class="sk-n">02</span><h3>A new venture plugs into them on day one</h3><p>Email, deploys, support, agents and the rest are already there, so it starts with the product and not the plumbing.</p></li>
    <li class="sk-reveal" style="--d:160ms"><span class="sk-n">03</span><h3>Every new stack venture makes the next launch faster</h3><p>What a stack venture adds, infrastructure or agents, is there for the next one to build on.</p></li>
  </ol>
</section>

<section class="as-wrap as-sec" aria-labelledby="faq-h">
  <h2 class="as-h2" id="faq-h">Questions</h2>
  <dl class="sk-faq-list">
${faq.map(([q, a]) => `    <div><dt>${esc(q)}</dt><dd>${esc(a)}</dd></div>`).join('\n')}
  </dl>
  <p><a class="detail-link" href="/ventures/?stack=1">SEE THE STACK IN THE REGISTRY &rarr;</a></p>
</section>

</main>

${footer}

<script src="/assets/fz-common.js"></script>
</body>
</html>
`;
};
