# DESIGN.md · Factory Zero UI (2026-10)

The design system for factory0.ventures. Dark, Swiss, square: a near-black ground,
off-white type, hairline 1px grid lines, generous space and one accent, the lime of
the imagery. Modelled on lemon.io's structure (big light headline, floating UI cards
over sculptural imagery, stats band, logo marquee, numbered steps, hairline cards),
translated to dark mode.

Files: `assets/fz-ui.css` (tokens, the @font-face rules and every component), `assets/fz-ui.js` (reveal,
count-up, hero loop, grid filters, live log), `tools/ui.js` (shared header, footer,
venture card and filter markup used by `tools/sync-ventures.js`).

**Status of the move.** Every page uses this system: the home page, `/ventures/`, every
`/ventures/<slug>/` page, `/stack/` (written by `tools/stack-page.js`), `/system/`,
`/technology/`, `/thesis/`, `/about/`, `/enter/` and `404.html`. The previous stylesheet
is gone. A new page takes its `<head>` assets from `headAssets()` in `tools/ui.js`, its
header and footer from `header()` and `footer()`, and its body from the components below.

## Principles

1. **Square.** `border-radius` is 0 everywhere. Corners are a hairline, not a curve.
2. **Hairlines, not boxes.** Sections are divided by `1px var(--hair)` rules; card grids
   draw their lines with border-right/bottom on each cell so a short last row stays empty.
3. **One accent.** `--acc` (lime) marks the one thing to look at: the primary dot of an
   eyebrow, a live tag, the FZ stack chip, a hover glow, the first step. Never a fill
   for large areas except the CTA button.
4. **Light type, big.** Headlines are weight 400 at display sizes with tight tracking;
   body is 300–400 in `--fg-2`. Labels are IBM Plex Mono, uppercase, tracked.
5. **Only real data.** Every number on a page is computed from `assets/fz-data.js` by
   `tools/sync-ventures.js` or fetched live (`/api/log`, `/api/activity`). Never type a
   number into a template.
6. **Motion is quiet and optional.** Everything reads with JavaScript off and with
   `prefers-reduced-motion: reduce`.

## Tokens (`:root` in `assets/fz-ui.css`)

| Token | Value | Use |
|---|---|---|
| `--bg` | `#0A0B0A` | page ground |
| `--bg-1` / `--bg-2` / `--bg-3` | `#0F110F` / `#151815` / `#1C201C` | raised cards, hover, inputs |
| `--hair` / `--hair-2` / `--hair-3` | off-white at 9% / 16% / 28% | rules, chip borders, ghost buttons |
| `--fg` | `#EDEFE8` | headings, primary text |
| `--fg-2` | `#B4B8AE` | body copy (9.6:1 on `--bg`) |
| `--fg-3` | `#858A80` | labels, meta (5.2:1 on `--bg`, AA) |
| `--fg-4` | `#5D6259` | decoration only, never text |
| `--acc` | `#C6FF3D` | the accent; text on it is `--acc-ink` |
| `--hl` | lime → lavender at 24% | `.hl` highlight under key words |
| `--sans` | Inter Tight 300/400/500/600 (self-hosted, `assets/fonts/`) | everything |
| `--mono` | IBM Plex Mono 400/500 (self-hosted) | eyebrows, labels, ids, chips |
| `--wrap` | 1320px | content width |
| `--gut` | `clamp(16px, 4vw, 48px)` | side gutter |
| `--sec` | `clamp(72px, 10vw, 144px)` | vertical section padding |

Why lime and not the old `#FF5A36`: every generated image glows lime, and two accents
compete. The orange of the previous system is retired.

## Type scale

| Class | Size | Notes |
|---|---|---|
| `.display` | `clamp(44px, 6.4vw, 92px)` / .98 / -.04em | the home hero only |
| `.h1` | `clamp(36px, 5vw, 68px)` / 1.02 / -.035em | page titles, CTA bands |
| `.h2` | `clamp(30px, 3.8vw, 52px)` / 1.06 / -.03em | section titles |
| `.h3` | `clamp(20px, 1.8vw, 24px)`, weight 500 | card titles |
| `.lede` | `clamp(17px, 1.45vw, 20px)`, weight 300, `--fg-2` | intro paragraphs, max 58ch |
| `.body` | 16px, `--fg-2`, max 64ch | running text |
| `.eyebrow` | 12px mono, .12em, uppercase, lime square before | above every section title (`.eyebrow--plain` drops the square) |
| `.hl` | lime→lavender band under the lower 42% of the line | one phrase per headline at most |

## Layout

- `.wrap` centres content at `--wrap` with `--gut` gutters.
- `.sec` is a section: `--sec` padding and a hairline on top (`.sec--flush` drops the line).
- `.sec-head` = title block left, an aside (a `.link` or `.vcount`) right; stacks under 760px.
- `.split` = 5/7 columns, stacks under 900px.
- No horizontal overflow from 320px up; grids use `minmax(min(Npx, 100%), 1fr)` and `min-width: 0`.

## Components

| Component | Classes | Notes |
|---|---|---|
| Header | `.site-header .wordmark .site-nav .nav-toggle` | sticky, blurred, hairline below; `aria-current="page"` gets a lime underline; mobile menu driven by `fz-common.js` |
| Buttons | `.btn` + `--primary` (off-white) / `--acc` (lime) / `--ghost` (hairline) / `--sm`; `.btns` row; `.arr` arrow nudges on hover | min height 48px |
| Text link | `.link` | underline hairline, lime on hover |
| Chip | `.chip`, `--dot`, `--acc`, `--solid`; `.chips` row | 24px tall mono labels: stage, status, tags |
| Hero | `.hero .hero-media .hero-grid .hero-in .hero-copy .hero-cards .hcard` | full-bleed image + loop video, gradient from the left, 120px grid lines fading out; up to three floating `.hcard`s from real data (hidden under 1100px) |
| Stats band | `.stats` (`--n` columns) `.stat .stat-n[data-count] .stat-k` | numbers count up once in view |
| Marquee | `.marquee .marquee-track` | each item twice, the copy `aria-hidden` + `tabindex=-1`; pauses on hover; static under reduced motion |
| Venture card | `.vgrid > li > a.vcard` with `.vicon` (the logo, centred) and `.vover` (`.vid .vname .vcat .chips`, shown on hover and focus, under the tile on touch) | square black tile, one hairline, mark only at rest; 5 columns, 3 under 1024px, 2 under 600px; the link text is `.vh` (name + description); written by `UI.vcard()`, with `UI.icon()` giving the initial monogram for a venture without a logo |
| Grid tools | `.vtools .vfilter button[data-f] .vsearch input[data-vsearch]`, `[data-vempty]`, `[data-vreset]` | `fz-ui.js` filters by `data-stage`, `data-stack` and free text in `data-q`; `?stack=1` preselects FZ stack |
| Cards | `.cards2 > .card` (`.card--acc` for the highlighted one), `.card-k` | hairline grid of text cards |
| Steps | `ol.steps > li.step .step-n h3 ul` | numbered diamonds, like lemon.io's "you ask / we do the rest / you choose" |
| Couplets | `.couplets .couplet .was` | struck-through "before" vs "after" |
| Levels | `ol.levels > li.level(.is-target) .level-n .level-name .level-bar i.on` | autonomy levels |
| Image band | `section.band > img` (`data-rv` zooms it in) | generated imagery between sections |
| Chip band | `section.chip-band > .cb-layer(.cb-board, .cb-traces, .cb-pair, .cb-die)` with `[data-cb-layer data-speed]` | home, between the ventures grid and the five layers; three parallax layers over an SVG circuit-trace overlay with travelling pulses; 12% overscan top and bottom, transform only, fades into the page at both ends |
| Films | `.films-grid > li > figure.film`, `.film-cap .film-name .film-title .film-line` | written by `sync-ventures.js` |
| Panel | `.panel .panel-head .rec` | live log (`.log .log-line`) and the authors chart |
| Timeline | `.tl .tl-scroll .tl-svg …` | ported from the previous system, new palette |
| Page hero | `main.has-ph > .ph-media(.ph-media--app / --dim) > img + video[data-hero-video][data-webm][data-mp4]` | full-bleed loop behind the top of every subpage, made by `pageHero(slug, variant)` in `tools/ui.js`; no frame, a veil fades it into the page (left + bottom); `--app` is shorter and fades before the venture stats row, `--dim` darkens the right half where a form or title sits there |
| Product page | `.crumbs .app-hero .app-icon .app-name .app-sub .app-meta .app-cta .app-stats .app-body .app-sec .how .deal .side .uses .use` | the venture page; keeps every `d-*` id the chart script reads |
| CTA band | `.cta-band > img + .wrap > .cta-in` | image ground with a left gradient |
| Footer | `.site-footer .foot-grid .foot-brand .foot-col .foot-legal` | written by `UI.footer()`; carries the image credit |
| Page top | `.page-top` + `.eyebrow`, `.h1`, `.lede` | the head of every sub page; `.page-top .btns` for actions |
| Facts | `dl.cards2.facts > div.card > dt.card-k + dd` | labelled facts, hairline cells (the same grid as cards) |
| Prose | `.prose .rich` (`.lede` paragraphs, `.link` for inline links) | running copy at 64ch, in two columns with `.split-lede` |
| Rows | `ul.rows > li > a.row > .row-lead (.row-id, .vicon) + .row-main (.row-name, .row-sub) + .row-end (.chip, .fzs-os)` | hairline list rows: the stack catalogue, the most-used ranking, repository lists |
| Q and A | `dl.qa > div > dt + dd` | questions in the left column, answers in the right |
| Prose steps | `ol.steps.steps--prose` | the numbered steps with sentence-case titles |
| Code | `pre.code > code` | a bordered monospace block beside a `.split` column |
| Paper | `.paper > aside.paper-meta (.paper-toc) + .paper-body > section.clause (.n, h2) + .paper-end` | the working paper: sticky contents, hairline sections |
| Layers | `.layers > .layer(.layer--core) > .layer-head (.n, .mode) + .layer-cells > .cell (.id, .label, .st)`, `.rung` between | the system diagram; ventures are `a.cell` links |
| Access form | `.enter-grid`, `form.enter-form`, `.channels > .channel[aria-checked]`, `.field`, `.transmit`, `.form-error`, `.receipt`, `.direct`, `.hp` | the ids and names in `assets/fz-enter.js` are fixed |
| Not found | `main.notfound` | the 404 page |

## Motion

- Reveal: add `data-rv` (and `style="--d:N"` for a 70ms stagger). Content is visible by
  default. `fz-ui.js` hides only `[data-rv]` elements below the first viewport, and only after
  it has set `html.rv-on`; anything above the fold is shown at once. A 4s fallback reveals
  anything a throttled tab never intersected.
- Films: the home grid is poster cards (WebP, 480/960 wide, from `assets/films/*-poster.jpg`)
  that open one shared `<dialog class="fz-player">`. Each card is also a link to the MP4.
  A venture's own player takes its poster through `data-poster` near the viewport.
- Count-up: `[data-count]` inside a revealed element, 1.1s ease-out.
- Hero loop: `video[data-hero-video]` stays `preload="none"` and starts only with motion
  allowed, no data saver and a viewport ≥600px; it fades in on `playing` over the still and
  pauses off screen.
- Hover: cards lift their icon 3px and draw a lime inset hairline with a soft glow; buttons
  swap to lime; arrows nudge 3px.
- Floating hero cards drift ±6px over 9–11s.
- Chip band (home): `fz-ui.js` moves each `[data-cb-layer]` by `transform` only, by its `data-speed`
  (board 0.5, traces 0.75, chip pair 1, chip die 1.35, clamped to the 12% overscan), from one rAF-throttled
  scroll handler that runs only while the band is within 200px of the viewport. The pulses (`.cb-pulse`,
  `stroke-dashoffset`) and the chip glow run only while `.is-live`. Reduced motion and Save-Data add
  `.is-still`: a static composite, no transforms, no pulses.
- `prefers-reduced-motion: reduce` kills every animation and transition and hides the video.

## Imagery

Art direction: matte charcoal/obsidian clay sculpture with a glowing neon-lime wireframe
mesh, near-black studio, soft top light, thin lime rim light, generous negative space.
No text, letters, logos or people. Files live in `assets/ui/` (WebP, plus 800w variants).

Shared style suffix for every image prompt:

> Museum-grade studio product photograph of abstract sculpture. Matte charcoal and obsidian-black clay forms with soft satin highlights, a fine glowing neon-lime wireframe mesh wrapping part of the forms like a 3D scan overlay, deep near-black background, soft top light and a thin lime rim light, generous negative space, minimal, calm, high detail, shallow depth of field. No text, no letters, no logos, no people.

| File | Subject prompt (prefix to the style) | Model |
|---|---|---|
| `hero.webp`, `hero-960.webp`, `hero-poster.jpg` | first frame of the loop below | MiniMax-Hailuo-2.3 |
| source still for the loop | A quiet miniature factory: dozens of small matte black clay cubes and crates stacked into towers and rows on a black plinth, a few cubes lifted mid-air as if being assembled, the lime wireframe mesh flowing across the central tower. Composition weighted to the right, empty dark space on the left. | MiniMax image-01, 16:9 |
| `films.webp` | A sculptural black clay film reel and a camera lens form lying on a black surface, the lime wireframe mesh swirling out of the lens like light. | MiniMax image-01, 16:9 |
| `ventures.webp` | A grid of rounded-square black clay tiles like app icons standing upright on a black floor in perfect rows, a few tiles glowing with the lime wireframe mesh. | MiniMax image-01, 16:9 |
| `cta.webp` | A wide horizon of many small black clay crates in a grid receding into darkness, one crate in the foreground open and glowing with the lime wireframe mesh rising from it. Wide panoramic. | MiniMax image-01, 21:9 |
| `chips-board-{960,1920}.webp` (back layer) | Top-down wide macro shot of a matte black printed circuit board with a fine network of thin neon-lime traces (pure lime, not green, no orange, no copper), tiny glowing lime solder pads and vias, the traces fading into black darkness toward the edges, clean and graphic, slight depth of field. Matte black, hairline-lit, minimal, calm, high detail, deep near-black background, a thin neon-lime (#C6FF3D) accent light as the only colour, generous negative space. No text, no letters, no logos, no people. | MiniMax image-01, 21:9 (then lime duotone, below) |
| `chips-pair-{960,1920}.webp` (mid layer, screened) | Two black square AI processor chips on a pure black background, slightly isometric three-quarter view, matte black die with fine lime-lit edges and rows of thin metallic pins, one chip larger in the foreground, the other smaller and further back, lime rim light on their edges, pure black background (#000000) so it can be blended. + the style suffix above | MiniMax image-01, 21:9 (then lime duotone) |
| `chips-die-{960,1920}.webp` (front layer, screened) | A single square black processor die with a glowing neon-lime circuit pattern etched on its surface, small chiplets around it, slight isometric angle, pins along the bottom edge, pure black background (#000000) for blending. + the style suffix above | MiniMax image-01, 21:9 (then lime duotone) |
| `chips` loop (not made) | Hailuo 6 s loop from the board still with light pulses along the traces, forward and reversed. Skipped in this pass; the SVG pulses carry the motion. | MiniMax-Hailuo-2.3 (not generated) |
| `hero-loop.webm`, `hero-loop.mp4` | image-to-video from the hero still: "[Static shot] The camera does not move. The neon-lime wireframe mesh slowly pulses and flows upward along the tower like light, a few small black cubes drift very slowly in the air above the plinth and settle, subtle dust in the light. Calm, slow, minimal motion, everything else still. No text, no people." 6 s 1080P, played forward then reversed for a seamless 11.6 s loop, 1600px, no audio (VP9 crf 40 / H.264 crf 27) | MiniMax-Hailuo-2.3 |

Chip band colour treatment: the MiniMax outputs carry a green cast, so each is graded to lime. The
luminance is mapped black to `#C6FF3D` (the board onto the ground `#0A0B0A`, the two chip layers onto
pure black so `mix-blend-mode: screen` drops their background), with a small black-point lift so the
background is exactly black. Encoded with `cwebp -q 74`; the 1920 layers are 11 to 14 KB, the 960s 4 to 6 KB.

Credit (in the footer): "Images: MiniMax image-01 · motion: MiniMax Hailuo-2.3".

## Page heroes

Every subpage (`/ventures/`, each venture page, `/stack/`, `/system/`, `/technology/`,
`/thesis/`, `/about/`, `/enter/`, `/venture-as-a-service/`) opens on a full-bleed loop in
`assets/ui/heroes/<slug>.{webp,webm,mp4}` (1600×900; WebP poster ≤ 31 KB, each video ≤ 600 KB).

- Markup: `pageHero(slug, variant)` from `tools/ui.js`, as the first child of
  `<main class="has-ph">`. The generators (`sync-ventures.js`, `stack-page.js`) call it; the
  hand-written pages carry the same markup with a comment pointing here.
- Performance: only the poster is in the HTML (the one `fetchpriority="high"` image). The
  `<video>` has no `<source>`; `fz-ui.js` adds `data-webm`/`data-mp4` after `load` and an idle
  callback, and never with reduced motion, Save-Data, a 2G/3G connection or a viewport under 600px.
  Hero text never uses `data-rv`.
- Art direction: the system's matte black clay, one accent light. Venture pages glow in the
  venture's own brand colour (from its logo); every other page glows lime. Subject on the right,
  empty dark space on the left for the title. Loops play forward then reversed (seamless).
- 18 venture loops are MiniMax Hailuo-2.3 image-to-video. The other 13 (5 ventures and every
  non-venture page) are a slow push-in built from the still with ffmpeg, because the MiniMax
  plan ran out of video credits; regenerate them with Hailuo when credits allow.

| Slug | Still: MiniMax image-01, 16:9 | Motion |
|---|---|---|
| `kontinuum` | An endless infinity-shaped ribbon of sculpted black clay rippling like a frozen sound wave, thin glowing red-to-amber light lines running along the ribbon like music. Museum-grade studio product photograph of abstract sculpture. Matte charcoal and obsidian-black clay forms with soft satin highlights, glowing red-to-amber light as the only colour accent, deep near-black background, soft top light and a thin rim light, generous negative space, minimal, calm, premium, high detail, shallow depth of field. Composition: the subject sits in the RIGHT half of the frame, the LEFT half is empty dark space. No text, no letters, no numbers, no logos, no people, no faces, no hands. | Hailuo-2.3 image-to-video: "[Static shot] The camera does not move. the ribbon slowly undulates like a sound wave and the red-to-amber light lines flow along it. Calm, slow, minimal motion, everything else still. No text, no people." |
| `undercover-rockstars` | Two identical sculpted black clay jackets hanging side by side on minimal hangers, one in shadow and one rim-lit, a thin glowing red seam tracing both, mirrored like a matched pair. Museum-grade studio product photograph of abstract sculpture. Matte charcoal and obsidian-black clay forms with soft satin highlights, glowing red light as the only colour accent, deep near-black background, soft top light and a thin rim light, generous negative space, minimal, calm, premium, high detail, shallow depth of field. Composition: the subject sits in the RIGHT half of the frame, the LEFT half is empty dark space. No text, no letters, no numbers, no logos, no people, no faces, no hands. | Hailuo-2.3 image-to-video: "[Static shot] The camera does not move. the two jackets sway very slightly on their hangers and the red seam light pulses softly. Calm, slow, minimal motion, everything else still. No text, no people." |
| `yoginini` | A tall graceful arch of smooth balanced black clay stones in a calm poised curve, tiny glowing lavender points on each stone joined by fine lavender lines like a body-tracking skeleton. Museum-grade studio product photograph of abstract sculpture. Matte charcoal and obsidian-black clay forms with soft satin highlights, glowing lavender light as the only colour accent, deep near-black background, soft top light and a thin rim light, generous negative space, minimal, calm, premium, high detail, shallow depth of field. Composition: the subject sits in the RIGHT half of the frame, the LEFT half is empty dark space. No text, no letters, no numbers, no logos, no people, no faces, no hands. | Hailuo-2.3 image-to-video: "[Static shot] The camera does not move. the lavender points on the stones softly pulse one after another along the arch. Calm, slow, minimal motion, everything else still. No text, no people." |
| `cratefield` | A neat three-by-three grid of matte black clay crates on a plinth, the centre crate lifted slightly and glowing from inside with electric-blue wireframe light. Museum-grade studio product photograph of abstract sculpture. Matte charcoal and obsidian-black clay forms with soft satin highlights, glowing electric-blue light as the only colour accent, deep near-black background, soft top light and a thin rim light, generous negative space, minimal, calm, premium, high detail, shallow depth of field. Composition: the subject sits in the RIGHT half of the frame, the LEFT half is empty dark space. No text, no letters, no numbers, no logos, no people, no faces, no hands. | Hailuo-2.3 image-to-video: "[Static shot] The camera does not move. the centre crate rises a few millimetres and its blue inner light breathes slowly. Calm, slow, minimal motion, everything else still. No text, no people." |
| `vibecaddie` | A sculpted black clay golf caddie bag standing upright, its club heads shaped like angle brackets and curly braces, a glowing mint-green wireframe scan tracing the clubs. Museum-grade studio product photograph of abstract sculpture. Matte charcoal and obsidian-black clay forms with soft satin highlights, glowing mint-green light as the only colour accent, deep near-black background, soft top light and a thin rim light, generous negative space, minimal, calm, premium, high detail, shallow depth of field. Composition: the subject sits in the RIGHT half of the frame, the LEFT half is empty dark space. No text, no letters, no numbers, no logos, no people, no faces, no hands. | Hailuo-2.3 image-to-video: "[Static shot] The camera does not move. the mint-green scan line moves slowly up and down the clubs. Calm, slow, minimal motion, everything else still. No text, no people." |
| `colonizer` | A cut-away black clay ant hill showing a network of tunnels and chambers inside, small six-legged black clay ants carrying tiny cubes along the tunnels, glowing orange light flowing through the passages, insects only, no human figures. Museum-grade studio product photograph of abstract sculpture. Matte charcoal and obsidian-black clay forms with soft satin highlights, glowing orange light as the only colour accent, deep near-black background, soft top light and a thin rim light, generous negative space, minimal, calm, premium, high detail, shallow depth of field. Composition: the subject sits in the RIGHT half of the frame, the LEFT half is empty dark space. No text, no letters, no numbers, no logos, no people, no faces, no hands. | Hailuo-2.3 image-to-video: "[Static shot] The camera does not move. the small ants walk slowly along the tunnels and the orange light flickers gently inside the chambers. Calm, slow, minimal motion, everything else still. No text, no people." |
| `findsyou-work` | A loose pile of many blank black clay cards on a plinth, a single card lifted out and floating above the pile, outlined in glowing warm-gold light. Museum-grade studio product photograph of abstract sculpture. Matte charcoal and obsidian-black clay forms with soft satin highlights, glowing warm-gold light as the only colour accent, deep near-black background, soft top light and a thin rim light, generous negative space, minimal, calm, premium, high detail, shallow depth of field. Composition: the subject sits in the RIGHT half of the frame, the LEFT half is empty dark space. No text, no letters, no numbers, no logos, no people, no faces, no hands. | Hailuo-2.3 image-to-video: "[Static shot] The camera does not move. the single card floats and turns very slowly above the pile, its gold edge glowing. Calm, slow, minimal motion, everything else still. No text, no people." |
| `supportgenius` | A smooth black clay speech-bubble sculpture with thin glowing soft-blue routes branching from it to four small pedestals, like a call being routed. Museum-grade studio product photograph of abstract sculpture. Matte charcoal and obsidian-black clay forms with soft satin highlights, glowing soft-blue light as the only colour accent, deep near-black background, soft top light and a thin rim light, generous negative space, minimal, calm, premium, high detail, shallow depth of field. Composition: the subject sits in the RIGHT half of the frame, the LEFT half is empty dark space. No text, no letters, no numbers, no logos, no people, no faces, no hands. | Hailuo-2.3 image-to-video: "[Static shot] The camera does not move. soft blue light travels slowly along the routes from the bubble to the pedestals. Calm, slow, minimal motion, everything else still. No text, no people." |
| `promptdecode` | A black clay slab whose smooth surface hides faint engraved abstract marks, a sweeping amber scan beam revealing the hidden grooves as glowing lines, abstract marks not letters. Museum-grade studio product photograph of abstract sculpture. Matte charcoal and obsidian-black clay forms with soft satin highlights, glowing amber light as the only colour accent, deep near-black background, soft top light and a thin rim light, generous negative space, minimal, calm, premium, high detail, shallow depth of field. Composition: the subject sits in the RIGHT half of the frame, the LEFT half is empty dark space. No text, no letters, no numbers, no logos, no people, no faces, no hands. | Hailuo-2.3 image-to-video: "[Static shot] The camera does not move. the amber scan beam sweeps slowly across the slab revealing the hidden grooves. Calm, slow, minimal motion, everything else still. No text, no people." |
| `groove-guru` | Two sculpted black clay DJ jog wheels and a small mixer block between them on a concrete-textured plinth, thin warm-white light rings pulsing around the platters. Museum-grade studio product photograph of abstract sculpture. Matte charcoal and obsidian-black clay forms with soft satin highlights, glowing warm-white light as the only colour accent, deep near-black background, soft top light and a thin rim light, generous negative space, minimal, calm, premium, high detail, shallow depth of field. Composition: the subject sits in the RIGHT half of the frame, the LEFT half is empty dark space. No text, no letters, no numbers, no logos, no people, no faces, no hands. | Hailuo-2.3 image-to-video: "[Static shot] The camera does not move. the two platters rotate slowly and the warm-white rings pulse gently to a beat. Calm, slow, minimal motion, everything else still. No text, no people." |
| `posplugin` | A clean minimal black clay electrical plug on a thick cable, plugged into one of a neat row of many different black clay wall sockets set into a slab, glowing orange-red light at the socket it is plugged into. Museum-grade studio product photograph of abstract sculpture. Matte charcoal and obsidian-black clay forms with soft satin highlights, glowing orange-red light as the only colour accent, deep near-black background, soft top light and a thin rim light, generous negative space, minimal, calm, premium, high detail, shallow depth of field. Composition: the subject sits in the RIGHT half of the frame, the LEFT half is empty dark space. No text, no letters, no numbers, no logos, no people, no faces, no hands. | Hailuo-2.3 image-to-video: "[Static shot] The camera does not move. a soft orange-red glow pulses at the plugged socket, the cable rests still. Calm, slow, minimal motion, everything else still. No text, no people." |
| `keep-shipping` | A slow conveyor of black clay shipping containers stacked in tidy rows on a dock, a thin glowing cobalt-blue line running along the conveyor like a pipeline. Museum-grade studio product photograph of abstract sculpture. Matte charcoal and obsidian-black clay forms with soft satin highlights, glowing cobalt-blue light as the only colour accent, deep near-black background, soft top light and a thin rim light, generous negative space, minimal, calm, premium, high detail, shallow depth of field. Composition: the subject sits in the RIGHT half of the frame, the LEFT half is empty dark space. No text, no letters, no numbers, no logos, no people, no faces, no hands. | Hailuo-2.3 image-to-video: "[Static shot] The camera does not move. the containers glide slowly along the conveyor and the cobalt line pulses forward. Calm, slow, minimal motion, everything else still. No text, no people." |
| `owlpost` | A sculpted black clay owl perched on a stack of black clay envelopes, its round eyes glowing golden-amber, one envelope lifting into the air. Museum-grade studio product photograph of abstract sculpture. Matte charcoal and obsidian-black clay forms with soft satin highlights, glowing golden-amber light as the only colour accent, deep near-black background, soft top light and a thin rim light, generous negative space, minimal, calm, premium, high detail, shallow depth of field. Composition: the subject sits in the RIGHT half of the frame, the LEFT half is empty dark space. No text, no letters, no numbers, no logos, no people, no faces, no hands. | Hailuo-2.3 image-to-video: "[Static shot] The camera does not move. the owl turns its head slightly, its amber eyes glow, the top envelope drifts upward slowly. Calm, slow, minimal motion, everything else still. No text, no people." |
| `bloodrank` | A stepped black clay leaderboard podium of rising tiers, thin glowing crimson-red light lines on each step, a single drop-shaped clay form on top. Museum-grade studio product photograph of abstract sculpture. Matte charcoal and obsidian-black clay forms with soft satin highlights, glowing crimson-red light as the only colour accent, deep near-black background, soft top light and a thin rim light, generous negative space, minimal, calm, premium, high detail, shallow depth of field. Composition: the subject sits in the RIGHT half of the frame, the LEFT half is empty dark space. No text, no letters, no numbers, no logos, no people, no faces, no hands. | Hailuo-2.3 image-to-video: "[Static shot] The camera does not move. the crimson lines on the tiers pulse slowly from bottom to top. Calm, slow, minimal motion, everything else still. No text, no people." |
| `ratecla-im` | A single large antique hotel key in matte black clay standing upright on its bow on a black plinth, with a thick oval key tag hanging from it, a thin glowing lime-green light outlining the key. Museum-grade studio product photograph of abstract sculpture. Matte charcoal and obsidian-black clay forms with soft satin highlights, glowing lime-green light as the only colour accent, deep near-black background, soft top light and a thin rim light, generous negative space, minimal, calm, premium, high detail, shallow depth of field. Composition: the subject sits in the RIGHT half of the frame, the LEFT half is empty dark space. No text, no letters, no numbers, no logos, no people, no faces, no hands. | Hailuo-2.3 image-to-video: "[Static shot] The camera does not move. the key tag sways very gently and the lime-green outline glows softly. Calm, slow, minimal motion, everything else still. No text, no people." |
| `sealbin` | A sealed black clay box with a round wax-seal-like disc on its lid, glowing violet-blue light leaking from the seams, the seal intact. Museum-grade studio product photograph of abstract sculpture. Matte charcoal and obsidian-black clay forms with soft satin highlights, glowing violet-blue light as the only colour accent, deep near-black background, soft top light and a thin rim light, generous negative space, minimal, calm, premium, high detail, shallow depth of field. Composition: the subject sits in the RIGHT half of the frame, the LEFT half is empty dark space. No text, no letters, no numbers, no logos, no people, no faces, no hands. | Hailuo-2.3 image-to-video: "[Static shot] The camera does not move. violet-blue light breathes slowly from the seams of the sealed box. Calm, slow, minimal motion, everything else still. No text, no people." |
| `release-show` | A sculpted black clay film clapperboard and a looping ribbon of film frames rising from it, a thin glowing amber light along the film edge. Museum-grade studio product photograph of abstract sculpture. Matte charcoal and obsidian-black clay forms with soft satin highlights, glowing amber light as the only colour accent, deep near-black background, soft top light and a thin rim light, generous negative space, minimal, calm, premium, high detail, shallow depth of field. Composition: the subject sits in the RIGHT half of the frame, the LEFT half is empty dark space. No text, no letters, no numbers, no logos, no people, no faces, no hands. | slow push-in made from the still (ffmpeg), no generative motion |
| `living-brain` | A black clay brain sculpture built from many thin stacked pages like a book block, glowing mint light lines connecting the pages like neurons. Museum-grade studio product photograph of abstract sculpture. Matte charcoal and obsidian-black clay forms with soft satin highlights, glowing mint light as the only colour accent, deep near-black background, soft top light and a thin rim light, generous negative space, minimal, calm, premium, high detail, shallow depth of field. Composition: the subject sits in the RIGHT half of the frame, the LEFT half is empty dark space. No text, no letters, no numbers, no logos, no people, no faces, no hands. | Hailuo-2.3 image-to-video: "[Static shot] The camera does not move. mint light pulses through the brain like neurons firing, slowly. Calm, slow, minimal motion, everything else still. No text, no people." |
| `shoal` | A dense swirling school of many small black clay fish forming a spiral, a few fish glowing aqua-teal at the front of the shoal. Museum-grade studio product photograph of abstract sculpture. Matte charcoal and obsidian-black clay forms with soft satin highlights, glowing aqua-teal light as the only colour accent, deep near-black background, soft top light and a thin rim light, generous negative space, minimal, calm, premium, high detail, shallow depth of field. Composition: the subject sits in the RIGHT half of the frame, the LEFT half is empty dark space. No text, no letters, no numbers, no logos, no people, no faces, no hands. | Hailuo-2.3 image-to-video: "[Static shot] The camera does not move. the school of fish swirls slowly in its spiral, the teal fish at the front glowing. Calm, slow, minimal motion, everything else still. No text, no people." |
| `tokker` | Neat stacks of black clay tokens of different heights arranged like a bar chart, the tallest stack rimmed with glowing gold light. Museum-grade studio product photograph of abstract sculpture. Matte charcoal and obsidian-black clay forms with soft satin highlights, glowing gold light as the only colour accent, deep near-black background, soft top light and a thin rim light, generous negative space, minimal, calm, premium, high detail, shallow depth of field. Composition: the subject sits in the RIGHT half of the frame, the LEFT half is empty dark space. No text, no letters, no numbers, no logos, no people, no faces, no hands. | slow push-in made from the still (ffmpeg), no generative motion |
| `ledgers` | A stack of closed black clay ledger books with ruled edges, a thin steel-blue light line across the pages and one small amber marker ribbon. Museum-grade studio product photograph of abstract sculpture. Matte charcoal and obsidian-black clay forms with soft satin highlights, glowing steel-blue and amber light as the only colour accent, deep near-black background, soft top light and a thin rim light, generous negative space, minimal, calm, premium, high detail, shallow depth of field. Composition: the subject sits in the RIGHT half of the frame, the LEFT half is empty dark space. No text, no letters, no numbers, no logos, no people, no faces, no hands. | slow push-in made from the still (ffmpeg), no generative motion |
| `ghostwritin` | A sculpted black clay quill resting on a stack of blank black clay paper, a translucent draped sheet hovering above it like a ghost, edged in glowing pale-blue light. Museum-grade studio product photograph of abstract sculpture. Matte charcoal and obsidian-black clay forms with soft satin highlights, glowing pale-blue light as the only colour accent, deep near-black background, soft top light and a thin rim light, generous negative space, minimal, calm, premium, high detail, shallow depth of field. Composition: the subject sits in the RIGHT half of the frame, the LEFT half is empty dark space. No text, no letters, no numbers, no logos, no people, no faces, no hands. | slow push-in made from the still (ffmpeg), no generative motion |
| `squeezin` | A very long black clay chain of links on the left squeezed through a ring into one short tight loop on the right, the short loop glowing violet. Museum-grade studio product photograph of abstract sculpture. Matte charcoal and obsidian-black clay forms with soft satin highlights, glowing violet light as the only colour accent, deep near-black background, soft top light and a thin rim light, generous negative space, minimal, calm, premium, high detail, shallow depth of field. Composition: the subject sits in the RIGHT half of the frame, the LEFT half is empty dark space. No text, no letters, no numbers, no logos, no people, no faces, no hands. | slow push-in made from the still (ffmpeg), no generative motion |
| `ventures` | A wide field of many matte black clay crates in perfect rows receding into darkness, a scattering of crates glowing with neon-lime wireframe light. Museum-grade studio product photograph of abstract sculpture. Matte charcoal and obsidian-black clay forms with soft satin highlights, neon-lime light as the only colour accent, deep near-black background, soft top light and a thin rim light, generous negative space, minimal, calm, premium, high detail, shallow depth of field. Composition: the subject sits in the RIGHT half of the frame, the LEFT half is empty dark space. No text, no letters, no numbers, no logos, no people, no faces, no hands. | slow push-in made from the still (ffmpeg), no generative motion |
| `stack` | A tall stack of black clay modules of different heights fitted together like building blocks, the lowest foundation block glowing with neon-lime wireframe light. Museum-grade studio product photograph of abstract sculpture. Matte charcoal and obsidian-black clay forms with soft satin highlights, neon-lime light as the only colour accent, deep near-black background, soft top light and a thin rim light, generous negative space, minimal, calm, premium, high detail, shallow depth of field. Composition: the subject sits in the RIGHT half of the frame, the LEFT half is empty dark space. No text, no letters, no numbers, no logos, no people, no faces, no hands. | slow push-in made from the still (ffmpeg), no generative motion |
| `system` | Three thick black clay layers floating one above another with small gaps, the bottom core layer glowing neon-lime, thin vertical light lines connecting the layers. Museum-grade studio product photograph of abstract sculpture. Matte charcoal and obsidian-black clay forms with soft satin highlights, neon-lime light as the only colour accent, deep near-black background, soft top light and a thin rim light, generous negative space, minimal, calm, premium, high detail, shallow depth of field. Composition: the subject sits in the RIGHT half of the frame, the LEFT half is empty dark space. No text, no letters, no numbers, no logos, no people, no faces, no hands. | slow push-in made from the still (ffmpeg), no generative motion |
| `technology` | Precise machined black clay parts, gears, bolts and small modules laid out in an orderly row like an exploded view, a thin neon-lime wireframe outlining them. Museum-grade studio product photograph of abstract sculpture. Matte charcoal and obsidian-black clay forms with soft satin highlights, neon-lime light as the only colour accent, deep near-black background, soft top light and a thin rim light, generous negative space, minimal, calm, premium, high detail, shallow depth of field. Composition: the subject sits in the RIGHT half of the frame, the LEFT half is empty dark space. No text, no letters, no numbers, no logos, no people, no faces, no hands. | slow push-in made from the still (ffmpeg), no generative motion |
| `thesis` | A large sheet of black clay paper unfolding into a three-dimensional organisation diagram of connected blocks and lines, neon-lime light tracing the connections. Museum-grade studio product photograph of abstract sculpture. Matte charcoal and obsidian-black clay forms with soft satin highlights, neon-lime light as the only colour accent, deep near-black background, soft top light and a thin rim light, generous negative space, minimal, calm, premium, high detail, shallow depth of field. Composition: the subject sits in the RIGHT half of the frame, the LEFT half is empty dark space. No text, no letters, no numbers, no logos, no people, no faces, no hands. | slow push-in made from the still (ffmpeg), no generative motion |
| `about` | A single matte black clay crate standing alone on a plinth in a dark studio, a soft neon-lime wireframe glow outlining its edges. Museum-grade studio product photograph of abstract sculpture. Matte charcoal and obsidian-black clay forms with soft satin highlights, neon-lime light as the only colour accent, deep near-black background, soft top light and a thin rim light, generous negative space, minimal, calm, premium, high detail, shallow depth of field. Composition: the subject sits in the RIGHT half of the frame, the LEFT half is empty dark space. No text, no letters, no numbers, no logos, no people, no faces, no hands. | slow push-in made from the still (ffmpeg), no generative motion |
| `enter` | A tall narrow black clay doorway standing alone in darkness, soft neon-lime light spilling out of the opening onto the floor. Museum-grade studio product photograph of abstract sculpture. Matte charcoal and obsidian-black clay forms with soft satin highlights, neon-lime light as the only colour accent, deep near-black background, soft top light and a thin rim light, generous negative space, minimal, calm, premium, high detail, shallow depth of field. Composition: the subject sits in the RIGHT half of the frame, the LEFT half is empty dark space. No text, no letters, no numbers, no logos, no people, no faces, no hands. | slow push-in made from the still (ffmpeg), no generative motion |
| `venture-as-a-service` | A single matte black clay crate being assembled on a long workbench lined with small black clay modules and tools, the crate glowing from within with neon-lime wireframe light as the last module slots in. Museum-grade studio product photograph of abstract sculpture. Matte charcoal and obsidian-black clay forms with soft satin highlights, neon-lime light as the only colour accent, deep near-black background, soft top light and a thin rim light, generous negative space, minimal, calm, premium, high detail, shallow depth of field. Composition: the subject sits in the RIGHT half of the frame, the LEFT half is empty dark space. No text, no letters, no numbers, no logos, no people, no faces, no hands. | slow push-in made from the still (ffmpeg), no generative motion |
