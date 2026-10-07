// The /stack/ page, generated from the registry (assets/fz-data.js) by
// tools/sync-ventures.js: which ventures are on the Factory Zero stack
// (`stack`, `stackRole`), what each one is, and who uses it (`uses`).
// Static HTML plus static line-art icons, no script needed to read it.
'use strict';
const fs = require('fs');
const path = require('path');

const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

// Same decision per mark as MODE in assets/fz-hero3d.js: line art for most,
// a solid glyph for simple solid shapes, the mark's own colours for the rest.
const MODE = { 'VibeCaddie': 'solid', 'release.show': 'solid', 'promptdecode': 'solid', 'ratecla.im': 'solid', 'Sealbin': 'plain', 'Tokker': 'plain' };
const INK = '#FF5A36';
function lineArt(txt, mode, frame) {
  const vb = txt.match(/viewBox="([^"]+)"/), vw = vb ? parseFloat(vb[1].split(/[ ,]+/)[2]) : 120, keep = [];
  txt = txt.replace(/<clipPath[\s\S]*?<\/clipPath>/g, m => { keep.push(m); return '\u0001' + (keep.length - 1) + '\u0002'; });
  txt = txt.replace(/<rect\b[^>]*>/g, m => {
    const w = m.match(/\bwidth="([\d.]+)"/), h = m.match(/\bheight="([\d.]+)"/);
    return w && h && +w[1] >= vw * 0.45 && +h[1] >= vw * 0.2 ? '' : m;
  });
  txt = txt.replace(/<circle\b[^>]*fill="url\([^>]*>/g, '');
  txt = txt.replace(/\u0001(\d+)\u0002/g, (m, i) => keep[+i]);
  const sw = vw * 0.035;
  const css = `*{animation-play-state:paused!important;animation-delay:-${frame}s!important}` + (mode === 'plain' ? '' : mode === 'solid'
    ? `svg *{fill:${INK}!important;stroke:none!important;opacity:1!important}`
    : `svg *{fill:none!important;stroke:${INK}!important;stroke-width:${sw}px!important;stroke-linecap:round!important;stroke-linejoin:round!important;opacity:1!important}`);
  return txt.replace(/<svg\b[^>]*>/, m => m.replace(/\swidth="[^"]*"/, '').replace(/\sheight="[^"]*"/, '') + '<style>' + css + '</style>');
}

module.exports = function stackPage(ctx) {
  const { V, ROOT, SITE, slug, pitch, uses, STATUS_WORD } = ctx;
  const stack = V.filter(v => v.stack);
  const BY_ID = new Map(V.map(v => [v.id, v]));
  // line-art icons, generated into assets/stack/
  const dir = path.join(ROOT, 'assets', 'stack');
  fs.mkdirSync(dir, { recursive: true });
  const icon = v => {
    if (!v.logo) return '';
    const f = `${slug(v)}-line.svg`;
    fs.writeFileSync(path.join(dir, f), lineArt(fs.readFileSync(path.join(ROOT, 'assets', v.logo), 'utf8'), MODE[v.name], v.name === 'Kontinuum' ? 4.2 : 1.35));
    return `<img class="sk-icon" src="/assets/stack/${f}" alt="" width="40" height="40" loading="lazy">`;
  };
  const one = v => {
    const s = pitch(v).solution || v.desc || '';
    const m = s.match(/^.*?[.!?](\s|$)/);
    return (m ? m[0].trim() : s);
  };
  // who uses whom: from the `uses` entries that name a stack venture
  const users = new Map(stack.map(v => [v.id, []]));
  for (const v of V) for (const u of v.uses || []) if (users.has(u.id)) users.get(u.id).push({ v, live: u.status === 'live' });
  const usedBy = v => users.get(v.id).sort((a, b) => (b.live - a.live) || a.v.name.localeCompare(b.v.name));

  const foundation = stack.filter(v => v.name === 'Cratefield' || v.name === 'Colonizer');
  const blocks = stack.filter(v => !foundation.includes(v));
  const os = v => v.open_source ? `<span class="fzs-os" title="${esc(v.license)} licence">OPEN SOURCE</span>` : '';
  const osN = stack.filter(v => v.open_source).length;
  const osLine = `${osN * 2 > stack.length ? 'Most' : 'Part'} of the stack is open source: ${osN} of ${stack.length}.`;
  const block = (v, i) => `        <li class="sd-block sk-reveal" style="--d:${(i % 6) * 60}ms"><a href="/ventures/${slug(v)}/">${icon(v)}<span class="sd-role">${esc(v.stackRole)}</span><span class="sd-name">${esc(v.name)}</span>${os(v)}</a></li>`;
  const found = (v, i) => `        <li class="sd-found sk-reveal" style="--d:${i * 80}ms"><a href="/ventures/${slug(v)}/">${icon(v)}<span class="sd-role">${esc(v.stackRole)}</span><span class="sd-name">${esc(v.name)}</span>${os(v)}</a></li>`;

  const card = (v, i) => {
    const us = usedBy(v), live = us.filter(x => x.live).length;
    return `      <article class="sk-card sk-reveal" style="--d:${(i % 3) * 70}ms" id="${slug(v)}">
        <div class="sk-card-h">${icon(v)}<div><p class="sk-card-role">${esc(v.stackRole)}${os(v)}</p><h3><a href="/ventures/${slug(v)}/">${esc(v.name)}</a></h3></div></div>
        <p class="sk-card-one">${esc(one(v))}</p>
        <p class="sk-card-meta"><span>${esc(v.id)}</span><span>${esc(v.status)}</span><span>${us.length ? `${us.length} ${us.length === 1 ? 'venture uses' : 'ventures use'} it${live ? `, ${live} live` : ', all planned'}` : 'no venture lists it yet'}</span></p>
        ${us.length ? `<p class="sk-chips-k">WHICH VENTURES USE IT</p><ul class="sk-chips">${us.map(x => `<li class="${x.live ? 'live' : 'plan'}"><a href="/ventures/${slug(x.v)}/">${esc(x.v.name)}</a></li>`).join('')}</ul>` : ''}
        <a class="sk-card-link" href="/ventures/${slug(v)}/">${esc(v.name.toUpperCase())} &rarr;</a>
      </article>`;
  };

  const cf = V.find(v => v.name === 'Cratefield');
  const standalone = V.filter(v => !v.stack);
  const eg = standalone.find(v => v.name === 'Undercover Rockstars') || standalone[0];
  const faq = [
    ['Is every venture part of the stack?', `No. ${stack.length} of ${V.length} are. The rest are standalone companies with their own product and brand; ${eg.name}, for example, uses some of the stack but does not add to it.`],
    ['Who decides what is on it?', 'A venture is on the stack when other ventures are built on it, or is meant to be. The list is the registry’s stack field, edited by hand, and the registry refuses to build if a venture that another venture uses is not marked.'],
    ['Can outside companies use these?', `Only where the registry says so, and each venture’s page says what you can use today. ${cf && pitch(cf).offer ? `For example, Cratefield: ${pitch(cf).offer}` : ''}`],
    ['What do live and planned mean?', 'Live means in use today, and checked. Planned means decided and tracked, not in use yet. Most links between ventures are still planned, and each venture’s page says which are live.']
  ];

  const hero = 'Every new venture is built on the same set of products, so it launches with email, payments, deploys, support, agents and more on day one.';
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

<main id="main">

<section class="page stack-hero">
  <p class="eyebrow">THE FACTORY ZERO STACK &middot; ${String(stack.length).padStart(2, '0')} OF ${String(V.length).padStart(2, '0')} VENTURES</p>
  <h1 class="h-page">One foundation, many launches.</h1>
  <p class="lede lede--wide">${esc(hero)}</p>
  <p class="sk-os-line"><span class="fzs-os">OPEN SOURCE</span>${esc(osLine)}</p>
</section>

<section class="sd" aria-labelledby="sd-h">
  <h2 class="sd-title" id="sd-h">How a new venture plugs in</h2>
  <div class="sd-new sk-reveal"><span class="sd-new-k">A NEW VENTURE</span><span class="sd-new-t">its own product and brand</span></div>
  <div class="sd-bus" aria-hidden="true"></div>
  <ul class="sd-blocks" aria-label="Products on the stack">
${blocks.map(block).join('\n')}
  </ul>
  <div class="sd-base">
    <p class="sd-base-k">FOUNDATION</p>
    <ul class="sd-found-row" aria-label="The foundation">
${foundation.map(found).join('\n')}
    </ul>
  </div>
</section>

<section class="section sk-how" aria-labelledby="how-h">
  <p class="eyebrow">HOW IT WORKS</p>
  <h2 class="h-lg" id="how-h" style="max-width:20ch">Three steps.</h2>
  <ol class="sk-steps">
    <li class="sk-reveal"><span class="sk-n">01</span><h3>The stack ventures are real products</h3><p>Each one is a company with its own brand, and it also serves customers outside Factory Zero.</p></li>
    <li class="sk-reveal" style="--d:80ms"><span class="sk-n">02</span><h3>A new venture plugs into them on day one</h3><p>Email, deploys, support, agents and the rest are already there, so it starts with the product and not the plumbing.</p></li>
    <li class="sk-reveal" style="--d:160ms"><span class="sk-n">03</span><h3>Every new stack venture makes the next launch faster</h3><p>What a stack venture adds, infrastructure or agents, is there for the next one to build on.</p></li>
  </ol>
</section>

<section class="section sk-list" aria-labelledby="list-h">
  <p class="eyebrow">THE STACK, ONE BY ONE</p>
  <h2 class="h-lg" id="list-h" style="max-width:20ch">${stack.length} products.</h2>
  <div class="sk-cards">
${stack.map(card).join('\n')}
  </div>
</section>

<section class="section sk-faq" aria-labelledby="faq-h">
  <p class="eyebrow">QUESTIONS</p>
  <h2 class="h-lg" id="faq-h" style="max-width:20ch">Short answers.</h2>
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
