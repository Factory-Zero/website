# DESIGN.md · Factory Zero UI (2026-10)

The design system for factory0.ventures. Dark, Swiss, square: a near-black ground,
off-white type, hairline 1px grid lines, generous space and one accent, the lime of
the imagery. Modelled on lemon.io's structure (big light headline, floating UI cards
over sculptural imagery, stats band, logo marquee, numbered steps, hairline cards),
translated to dark mode.

Files: `assets/fz-ui.css` (tokens + every component), `assets/fz-ui.js` (reveal,
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
| `--sans` | Inter Tight 300/400/500/600 | everything |
| `--mono` | IBM Plex Mono 400/500 | eyebrows, labels, ids, chips |
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
| Venture card | `.vgrid > li > a.vcard` with `.vcard-top .vicon .vid .vname .vcat .vdesc .chips .vgo` | square (`aspect-ratio: 1`), lime hairline glow on hover; written by `UI.vcard()` |
| Grid tools | `.vtools .vfilter button[data-f] .vsearch input[data-vsearch]`, `[data-vempty]`, `[data-vreset]` | `fz-ui.js` filters by `data-stage`, `data-stack` and free text in `data-q`; `?stack=1` preselects FZ stack |
| Cards | `.cards2 > .card` (`.card--acc` for the highlighted one), `.card-k` | hairline grid of text cards |
| Steps | `ol.steps > li.step .step-n h3 ul` | numbered diamonds, like lemon.io's "you ask / we do the rest / you choose" |
| Couplets | `.couplets .couplet .was` | struck-through "before" vs "after" |
| Levels | `ol.levels > li.level(.is-target) .level-n .level-name .level-bar i.on` | autonomy levels |
| Image band | `section.band > img` (`data-rv` zooms it in) | generated imagery between sections |
| Films | `.films-grid > li > figure.film`, `.film-cap .film-name .film-title .film-line` | written by `sync-ventures.js` |
| Panel | `.panel .panel-head .rec` | live log (`.log .log-line`) and the authors chart |
| Timeline | `.tl .tl-scroll .tl-svg …` | ported from the previous system, new palette |
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

- Reveal: add `data-rv` (and `style="--d:N"` for a 70ms stagger). `fz-ui.js` sets
  `html.rv-on` only when motion is allowed and IntersectionObserver exists; a 4s fallback
  reveals anything a throttled tab never intersected.
- Count-up: `[data-count]` inside a revealed element, 1.1s ease-out.
- Hero loop: `video[data-hero-video]` stays `preload="none"` and starts only with motion
  allowed, no data saver and a viewport ≥600px; it fades in on `playing` over the still and
  pauses off screen.
- Hover: cards lift their icon 3px and draw a lime inset hairline with a soft glow; buttons
  swap to lime; arrows nudge 3px.
- Floating hero cards drift ±6px over 9–11s.
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
| `layers.webp` | Five thick black clay slabs stacked with small gaps between them like floors of a building, each slab slightly offset, the lime wireframe tracing their edges and connecting them with thin vertical lines. Centered. | MiniMax image-01, 16:9 |
| `films.webp` | A sculptural black clay film reel and a camera lens form lying on a black surface, the lime wireframe mesh swirling out of the lens like light. | MiniMax image-01, 16:9 |
| `ventures.webp` | A grid of rounded-square black clay tiles like app icons standing upright on a black floor in perfect rows, a few tiles glowing with the lime wireframe mesh. | MiniMax image-01, 16:9 |
| `cta.webp` | A wide horizon of many small black clay crates in a grid receding into darkness, one crate in the foreground open and glowing with the lime wireframe mesh rising from it. Wide panoramic. | MiniMax image-01, 21:9 |
| `hero-loop.webm`, `hero-loop.mp4` | image-to-video from the hero still: "[Static shot] The camera does not move. The neon-lime wireframe mesh slowly pulses and flows upward along the tower like light, a few small black cubes drift very slowly in the air above the plinth and settle, subtle dust in the light. Calm, slow, minimal motion, everything else still. No text, no people." 6 s 1080P, played forward then reversed for a seamless 11.6 s loop, 1600px, no audio (VP9 crf 40 / H.264 crf 27) | MiniMax-Hailuo-2.3 |

Credit (in the footer): "Images: MiniMax image-01 · motion: MiniMax Hailuo-2.3".
