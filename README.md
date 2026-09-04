# Factory Zero — website

Marketing site for Factory Zero, an AI-native venture studio.

Static HTML, CSS and vanilla JavaScript. **No build step, no framework, no
dependencies.** Open `index.html` through any static server and it runs.

Implemented from the Claude Design source `Factory Zero.dc.html`, which targets
the `dc-runtime` preview environment (`<x-dc>` templates, `{{ }}` bindings,
`<sc-for>` loops, a React `DCLogic` class). That runtime is a design-time
dependency, so the component logic was ported to plain JavaScript. Timings,
easing, geometry, colour thresholds and copy are carried over unchanged.

## Layout

```
index.html              home page — all prose is static HTML
404.html                styled not-found page
assets/
  fz.css                design tokens + all component styles
  fz-data.js            ← content lives here (ventures, agent layers, log pool)
  fz-app.js             hero canvas, rolling log, agent rotation
  favicon.svg           source icon
  og.png                1200×630 Open Graph card (generated)
  apple-touch-icon.png  180×180 (generated)
  icon-512.png          512×512 (generated)
robots.txt              allows AI/answer-engine crawlers explicitly
sitemap.xml
llms.txt                plain-text summary for machine readers
site.webmanifest
.well-known/
  security.txt          RFC 9116
.nojekyll               required — Jekyll would strip .well-known/
tools/
  og-render.html        source for og.png
  render-og.sh          regenerates og.png + icons via headless Chrome
```

## Run it locally

```sh
python3 -m http.server 8099
# → http://127.0.0.1:8099/
```

Paths are absolute (`/assets/…`), so open it through a server rather than
`file://`.

## Editing content

Nearly everything is data:

- **`assets/fz-data.js`** — `ventures`, `layers` (the agent grid) and `logPool`
  (the FZ/LOG strings). Add real ventures here; the pipeline, the branch list
  and the hero counters all derive from that array.
- **`window.FZ_CONFIG`** at the bottom of the same file — headline, factory
  status, venture count and agent-network number. These mirror the editable
  `data-props` from the design source.
- All prose (thesis, human role, footers) is plain HTML in `index.html`.

## Regenerating the OG image

```sh
./tools/render-og.sh
```

Uses headless Chrome. ImageMagick cannot rasterize these correctly on macOS —
it silently falls back to its internal renderer and drops colour.

## Deviations from the design source

Three deliberate changes, each fixing something that did not work in the
preview runtime:

1. **`style-hover`** — the design source sets `style-hover="..."` on the footer
   CTA and pipeline units, but `dc-runtime` implements no such attribute, so
   those hovers never fired. Reimplemented as real CSS `:hover`.
2. **`fzScan`** — the pipeline scan line animated `translateY(-100%)` →
   `translateY(100%)` on a 120px-tall band, so it only ever travelled 240px at
   the top of a much taller grid. Reimplemented with `background-position` so it
   sweeps the full container height.
3. **Responsive behaviour** — the design is desktop-only. Added a wrapping
   header, stacking breakpoints, and `minmax(min(Npx, 100%), 1fr)` plus
   `min-width: 0` on grid tracks. Verified: no horizontal overflow from 320px
   to 1440px.

## Not yet implemented

The navigation links to `/ventures/`, `/system/`, `/thesis/`, `/about/` and
`/enter/`. Those five pages exist in the Claude Design project
(`Ventures.dc.html`, `System.dc.html`, `Thesis.dc.html`, `About.dc.html`,
`Enter.dc.html`) but have **not** been implemented here — only the home page
was in scope. They currently resolve to `404.html`.

## Placeholder data

`FZ-001` … `FZ-007` in `assets/fz-data.js` are placeholders, not real
companies. The FZ/LOG panel is labelled an illustrative sequence and its
entries are generated for display. `llms.txt` states both explicitly so answer
engines do not cite them as real portfolio holdings. Replace before launch.

## Deployment

GitHub Pages, served from `main`. Every push publishes.

### Moving to a custom domain

The site is currently canonical at `https://factory-zero.github.io`. To move it
to `factory0.ventures`:

1. Point DNS at GitHub Pages (four `A` records for the apex, or a `CNAME` on
   `www`).
2. Add a `CNAME` file at the repo root containing `factory0.ventures`.
3. Replace the origin in `index.html` (canonical, OG/Twitter URLs, JSON-LD),
   `sitemap.xml`, `robots.txt`, `llms.txt` and `.well-known/security.txt`:

   ```sh
   grep -rl 'factory-zero.github.io' . --exclude-dir=.git \
     | xargs sed -i '' 's|https://factory-zero.github.io|https://factory0.ventures|g'
   ```

Note the footer and OG card currently read `FACTORYZERO.VENTURES`, carried over
from the design source. The contact address is `contact@factory0.ventures`, so
this is probably meant to be `FACTORY0.VENTURES` — worth confirming before launch.
