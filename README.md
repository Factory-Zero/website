<p align="center">
  <img src="assets/readme-banner.png" alt="Factory Zero. We build companies that operate themselves." width="100%">
</p>

<p align="center">
  <img src="https://img.shields.io/badge/STATUS-PRE--LAUNCH-FF5A36?style=flat-square&labelColor=0A0A0B" alt="Status: pre-launch">
  <img src="https://img.shields.io/badge/STACK-VANILLA%20JS-EDEBE6?style=flat-square&labelColor=0A0A0B" alt="Stack: vanilla JS">
  <img src="https://img.shields.io/badge/BUILD%20STEP-NONE-EDEBE6?style=flat-square&labelColor=0A0A0B" alt="Build step: none">
  <img src="https://img.shields.io/badge/DEPENDENCIES-ZERO-FF5A36?style=flat-square&labelColor=0A0A0B" alt="Dependencies: zero">
  <img src="https://img.shields.io/badge/DEPLOY-CLOUDFLARE%20PAGES-EDEBE6?style=flat-square&labelColor=0A0A0B" alt="Deploy: Cloudflare Pages">
</p>

<p align="center">
  <b>factory0.ventures</b> · FZ/01
</p>

---

# The company

Factory Zero is an AI-native venture studio. It creates, launches and operates
companies through a shared network of autonomous agents.

> **The company is becoming software.**
> Software automated the worker. Agents automate the organization.
> The traditional company coordinates humans. The AI-native company coordinates
> intelligence.

Historically, software automated individual workflows. The next step is
software coordinating the organization itself. Factory Zero builds real
companies around that transition.

### One operating system, every function an agent

Factory Zero OS runs as five layers. Each function in each layer is an agent.

| Layer | Agents |
| :--- | :--- |
| `DISCOVER` | Research · Strategy · Analytics |
| `BUILD` | Product · Engineering · Design · QA |
| `OPERATE` | Infrastructure · Security · Support · Finance |
| `DISTRIBUTE` | Growth · Content · Sales |
| `LEARN` | Legal · Knowledge · Optimization |

### One factory, many independent companies

Every venture inherits the same foundation, so nothing is rebuilt. Identity,
payments and billing, analytics, deployment, observability, agent
orchestration, customer support, marketing automation, finance, knowledge,
security, experimentation and internal tooling are all shared.

Each venture still holds its own brand, product, customers, data boundaries,
strategy, economics and P&L.

### Signal to company, as a production line

```
SIGNAL → VALIDATION → PROTOTYPE → LAUNCH → AUTONOMY → SCALE
```

### Autonomy is an architecture, not a claim

| Level | | |
| :--- | :--- | :--- |
| `LEVEL 0` | Human-operated | |
| `LEVEL 1` | AI-assisted | |
| `LEVEL 2` | Agent workflows | |
| `LEVEL 3` | Agent-operated | **target** |
| `LEVEL 4` | Self-optimizing | **target** |
| `LEVEL 5` | Autonomous company | **target** |

Ventures are designed to run at levels 3 to 5. Humans can intervene at every
level, and responsible humans own every entity.

### Human judgment, machine execution

| `HUMAN LAYER` | `AGENT LAYER` |
| :--- | :--- |
| Mission · Capital · Governance · Judgment | Research · Build · Operate · Optimize |
| Humans define mission, capital, ethics, ownership, risk boundaries, high-impact decisions and relationships. | Agents execute within those boundaries. Every action is logged, observable and reversible. |

---

# The website

This repo is the Factory Zero marketing site. Static HTML, CSS and vanilla
JavaScript. **No build step, no framework, no dependencies.** Serve the
directory and it runs.

It was implemented from the Claude Design source `Factory Zero.dc.html`, which
targets the `dc-runtime` preview environment (`<x-dc>` templates, `{{ }}`
bindings, `<sc-for>` loops, a React `DCLogic` class). That runtime is a
design-time dependency, so the component logic was ported to plain JavaScript.
Timings, easing, canvas geometry, colour thresholds and copy carry over
unchanged.

### Layout

```
index.html              home page, all prose is static HTML
404.html                styled not-found page
assets/
  fz.css                design tokens and all component styles
  fz-data.js            ← content lives here (ventures, agent layers, log pool)
  fz-app.js             hero canvas, rolling log, agent rotation
  favicon.svg           source icon
  og.png                1200x630 Open Graph card (generated)
  readme-banner.png     the banner above (generated)
  apple-touch-icon.png  180x180 (generated)
  icon-512.png          512x512 (generated)
robots.txt              allows AI and answer-engine crawlers explicitly
sitemap.xml
llms.txt                plain-text summary for machine readers
site.webmanifest
_headers                Cloudflare Pages response headers
.well-known/
  security.txt          RFC 9116
tools/
  og-render.html        source for og.png
  banner-render.html    source for readme-banner.png
  render-og.sh          regenerates all raster assets
```

### Run it locally

```sh
python3 -m http.server 8099
# → http://127.0.0.1:8099/
```

Paths are absolute (`/assets/...`), so open it through a server rather than
`file://`.

### Editing content

Nearly everything is data:

- **`assets/fz-data.js`** holds `ventures`, `layers` (the agent grid) and
  `logPool` (the FZ/LOG strings). Add real ventures there. The pipeline, the
  branch list and the hero counters all derive from that array.
- **`window.FZ_CONFIG`** at the bottom of the same file holds the headline,
  factory status, venture count and agent-network number. These mirror the
  editable `data-props` from the design source.
- All prose (thesis, human role, footer) is plain HTML in `index.html`.

### Regenerating raster assets

```sh
./tools/render-og.sh
```

Uses headless Chrome. ImageMagick cannot rasterize these correctly on macOS:
it silently falls back to its internal renderer and drops colour.

### Search and answer-engine surface

| File | Purpose |
| :--- | :--- |
| `llms.txt` | Structured plain-text summary for LLM readers |
| `robots.txt` | Explicit allow for GPTBot, ClaudeBot, PerplexityBot, Google-Extended and others |
| JSON-LD in `index.html` | `Organization`, `WebSite`, `WebPage`, and a `DefinedTermSet` for the autonomy levels |
| `og.png` | 1200x630 card, generated from the real hero visual |
| `.well-known/security.txt` | RFC 9116 contact |

### Deviations from the design source

Three deliberate changes, each fixing something that did not work in the
preview runtime:

1. **`style-hover`.** The design source sets `style-hover="..."` on the footer
   CTA and pipeline units, but `dc-runtime` implements no such attribute, so
   those hovers never fired. Reimplemented as real CSS `:hover`.
2. **`fzScan`.** The pipeline scan line animated `translateY(-100%)` to
   `translateY(100%)` on a 120px band, so it only ever travelled 240px inside a
   much taller grid. Reimplemented with `background-position` so it sweeps the
   full container height.
3. **Responsive behaviour.** The design is desktop-only. Added a wrapping
   header, stacking breakpoints, `minmax(min(Npx, 100%), 1fr)` and
   `min-width: 0` on grid tracks. Verified: no horizontal overflow from 320px
   to 1440px.

### Not yet implemented

The navigation links to `/ventures/`, `/system/`, `/thesis/`, `/about/` and
`/enter/`. Those five pages exist in the Claude Design project
(`Ventures.dc.html`, `System.dc.html`, `Thesis.dc.html`, `About.dc.html`,
`Enter.dc.html`) but have **not** been implemented here. Only the home page was
in scope. They currently resolve to `404.html`.

### Placeholder data

`FZ-001` through `FZ-007` in `assets/fz-data.js` are placeholders, not real
companies. The FZ/LOG panel is labelled an illustrative sequence and its
entries are generated for display. `llms.txt` states both explicitly so answer
engines do not cite them as real portfolio holdings. Replace before launch.

### Deployment

Cloudflare Pages, built from `main`. There is no build command: set the build
output directory to the repo root and Cloudflare serves the files as they are.

- Production domain is `factory0.ventures`. The zone is already on Cloudflare
  nameservers (`susan.ns.cloudflare.com`, `kolton.ns.cloudflare.com`), but no
  A record exists yet, so the Pages project still needs to be connected.
- `_headers` sets caching and security headers. Asset filenames are not
  content-hashed, so CSS and JS cache for an hour rather than a year.
  Otherwise a push would not reach visitors.
- Cloudflare Pages skips dotfiles on upload **except** `.well-known`, so
  `/.well-known/security.txt` is served as expected.
- HSTS is deliberately not set in `_headers`. Turn it on in the Cloudflare
  dashboard (SSL/TLS, Edge Certificates) where it can be rolled back.

---

<p align="center">
  <sub><code>BUILD.</code> <code>DEPLOY.</code> <code>OBSERVE.</code> <code>LEARN.</code> <b><code>REPEAT.</code></b></sub>
</p>
