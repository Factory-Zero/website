<p align="center">
  <img src="assets/readme-banner.png" alt="Factory Zero. We build companies that operate and grow themselves." width="100%">
</p>

<p align="center">
  <img src="https://img.shields.io/badge/STATUS-PRE--LAUNCH-FF5A36?style=flat-square&labelColor=0A0A0B" alt="Status: pre-launch">
  <img src="https://img.shields.io/badge/PAGES-6-EDEBE6?style=flat-square&labelColor=0A0A0B" alt="Pages: 6">
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

### First venture

**FZ-001 Kontinuum.** An AI composer performing on a deterministic real-time
engine. Music written and performed continuously, personalised to the listener,
and playable offline. Not a streaming app and not a DAW: a living instrument.
Currently at prototype stage, with no public surface yet.

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
index.html              home
ventures/index.html     the venture registry
system/index.html       three-layer architecture + design principles
thesis/index.html       the working paper, 7 sections
about/index.html        what Factory Zero is and is not
enter/index.html        access request
404.html                styled not-found page
assets/
  fz.css                design tokens and every component style
  fz-data.js            ← venture data lives here (single source of truth)
  fz-common.js          loaded on every page
  fz-app.js             home: hero canvas, rolling log, agent rotation
  fz-ventures.js        registry selection
  fz-enter.js           access-request form
  kontinuum-animated.svg  FZ-001 brand mark (animated, self-contained)
  favicon.svg
  og.png, og-*.png      per-page 1200x630 Open Graph cards (generated)
  readme-banner.png     the banner above (generated)
  apple-touch-icon.png, icon-512.png
robots.txt              allows AI and answer-engine crawlers explicitly
sitemap.xml             all six pages
llms.txt                plain-text summary for machine readers
site.webmanifest
_headers                Cloudflare Pages response headers
.well-known/
  security.txt          RFC 9116
tools/
  og-render.html        OG card template (takes ?t=&k=&s= overrides)
  banner-render.html    README banner
  render-og.sh          regenerates every raster asset
  sync-ventures.js      writes fz-data.js into the static HTML
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
- **After editing `ventures`, run `node tools/sync-ventures.js`.** The registry
  rows and the default detail panel are written into `ventures/index.html` and
  `system/index.html` as static HTML so they are indexable with JavaScript off.
  That script regenerates them from `fz-data.js`, which stays the only place
  venture data is authored. It only rewrites the regions between the
  `<!-- fz:*:start -->` / `<!-- fz:*:end -->` markers.
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
| `og.png`, `og-*.png` | A 1200x630 card per page, generated from the real hero visual |
| JSON-LD per page | Page type plus `BreadcrumbList`; the thesis also emits an `Article` |
| Directory-style URLs | `/ventures/` rather than `/ventures.html`, so nothing needs redirecting later |
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

### The access-request form

`/enter/` has no backend. Rather than fake a submission the way the design
prototype did, the form composes a real `mailto:contact@factory0.ventures`
with the channel, name, email and message pre-filled, and says plainly that
nothing left the page on its own. The address is also shown directly under the
form. Swap in a Cloudflare Pages Function later if you want true server-side
handling.

### Venture data: one real, six placeholders

`FZ-001 Kontinuum` is a real venture: an AI composer performing on a
deterministic real-time engine. It has no public website yet, so its record
deliberately shows `NO PUBLIC SURFACE YET` and its `autonomy` is `null`, which
renders as an em dash rather than an invented percentage. Set a figure in
`fz-data.js` when there is one.

`FZ-002` through `FZ-007` are still placeholders, and the FZ/LOG panel on the
home page is labelled an illustrative sequence. `llms.txt` states both
explicitly so answer engines do not cite them as real portfolio holdings.
Replace before launch.

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
