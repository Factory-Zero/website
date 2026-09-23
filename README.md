<p align="center">
  <img src="assets/readme-banner.png" alt="Factory Zero. We build companies that operate and grow themselves." width="100%">
</p>

<p align="center">
  <img src="https://img.shields.io/badge/STATUS-PRE--LAUNCH-FF5A36?style=flat-square&labelColor=0A0A0B" alt="Status: pre-launch">
  <img src="https://img.shields.io/badge/PAGES-7-EDEBE6?style=flat-square&labelColor=0A0A0B" alt="Pages: 7">
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

### One factory, many distinct ventures

Every venture inherits the same foundation, so nothing is rebuilt. Identity,
payments and billing, analytics, deployment, observability, agent
orchestration, customer support, marketing automation, finance, knowledge,
security, experimentation and internal tooling are all shared.

Each venture runs with its own brand, product, customers, data boundaries
and strategy.

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
level, and a named human is accountable for every venture.

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
  build-dist.sh         assembles dist/ (allowlist + cache-bust stamping)
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
  `<!-- fz:*:start -->` / `<!-- fz:*:end -->` markers. The same run writes one
  page per venture at `ventures/<slug>/index.html` (the registry with that record
  selected, plus its own title, description and canonical URL), the venture
  entries in `sitemap.xml`, and `functions/api/activity-sources.json`. Commit
  all of it; never edit the generated venture pages by hand.
- **GitHub activity.** The detail panel charts weekly commits and issues (open count, opened/closed per week, the five newest open ones; titles that look like security reports are left out of that list) across a
  venture's public repositories (its `github` links; an owner-only link means
  all of that owner's public, non-fork repositories). `functions/api/activity.js`
  fetches them from GitHub and keeps the last good result in Workers KV
  (binding `ACTIVITY`, declared in `wrangler.toml`). Visitors are always served
  that copy; once it is a day old the next request refreshes it in the
  background, and a failed refresh keeps the old copy and retries in 10 minutes,
  so a GitHub outage or expired token makes the chart older, never empty.
- **Private repositories count, by number only.** With the `GH_APP_ID` and
  `GH_APP_PRIVATE_KEY` (PKCS#8 PEM) Pages secrets set, every venture org that
  installed the read-only *Factory Zero Activity* GitHub App (Metadata: read,
  Issues: read) is read through that app, so its private repositories add to
  the commit and issue totals. Private repository names, issue titles and links
  are never published: the issue list shows public repositories only and error
  messages carry status codes, not names. Orgs without the app count public
  repositories only.
  Set it up with `node tools/setup-github-app.mjs` (creates the app, stores both
  secrets without writing the key to disk, opens the install page); after a
  deploy, `node tools/setup-github-app.mjs --refresh` makes every venture refetch. It only queries the
  owners and repositories in `activity-sources.json`. Set a `GITHUB_TOKEN` Pages
  secret (a fine-grained token with no permissions is enough) to lift GitHub's
  60-requests-an-hour anonymous limit.
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

`/enter/` posts JSON to `functions/api/contact.js`, a Cloudflare Pages Function
that verifies Turnstile and sends the mail through Resend.

**Security properties**, since this is a public unauthenticated endpoint:

| Concern | How it is handled |
| :--- | :--- |
| Open relay | The recipient is fixed server-side. It is never read from the request. |
| Secret exposure | `RESEND_API_KEY` and `TURNSTILE_SECRET` are Pages secrets (encrypted). Only the public Turnstile sitekey appears in the HTML. |
| Bots | Cloudflare Turnstile, verified server-side, plus an off-screen honeypot field that is silently accepted so bots learn nothing. |
| Flooding | A zone rate-limit rule: 3 POSTs per 10s per IP. |
| Header injection | Every value that could reach a mail header is stripped of CR, LF and NUL. |
| DMARC | `from` is always our own verified domain. The submitter's address goes in `reply_to` only, never in `from`. |
| Cross-origin abuse | Requests with a foreign `Origin` are rejected. |
| Oversized input | Body capped at 20KB, message at 5,000 chars. |
| Information leak | Client errors are generic. Detail is logged server-side only. |

If Resend is unreachable or unconfigured the form falls back to showing
`contact@factory0.ventures` rather than pretending the message was sent.

**Setup that is not in this repo** (do not commit any of it):

```sh
npx wrangler pages secret put RESEND_API_KEY   --project-name factory-zero
npx wrangler pages secret put TURNSTILE_SECRET --project-name factory-zero
```

Optional overrides, as plain Pages env vars: `CONTACT_TO` (default
`contact@factory0.ventures`) and `CONTACT_FROM` (default
`noreply@send.factory0.ventures`).

**The sending domain must be verified in Resend**, and this is the part with a
trap. Verify the **subdomain** `send.factory0.ventures`, not the apex.
Verifying the apex makes Resend ask for MX records on `factory0.ventures`,
which would displace Cloudflare Email Routing and **break inbound mail to
contact@factory0.ventures**. Using a subdomain keeps the two entirely separate.

### Venture data

Eleven ventures are listed, and all eleven are real and named:

| | Venture | Stage | Target | Site | Source |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `FZ-001` | Kontinuum | `PROTOTYPE` | L4 | [kontinuum.audio](https://kontinuum.audio) | [Kontinuum-ai/kontinuum-engine](https://github.com/Kontinuum-ai/kontinuum-engine) |
| `FZ-002` | Undercover Rockstars | `LAUNCH` | L3 | [undercoverrockstars.com](https://undercoverrockstars.com) | [Undercover-Rockstars/website](https://github.com/Undercover-Rockstars/website) |
| `FZ-003` | Yoginini | `VALIDATION` | L3 | [yoginini.us](https://yoginini.us) | [Yoginini/website](https://github.com/Yoginini/website) |
| `FZ-004` | Cratefield | `VALIDATION` | L4 | [cratefield.com](https://cratefield.com) | [Cratefield/harness](https://github.com/Cratefield/harness) |
| `FZ-005` | VibeCaddie | `VALIDATION` | L5 | [vibecaddie.com](https://vibecaddie.com) | [VibeCaddie/website](https://github.com/VibeCaddie/website) |
| `FZ-006` | Colonizer | `PROTOTYPE` | L4 | [colonizer.dev](https://colonizer.dev) | [Colonizer-dev/harness](https://github.com/Colonizer-dev/harness) |
| `FZ-007` | FindsYou.work | `VALIDATION` | L4 | [findsyou.work](https://findsyou.work) | [FindsYou-Work/website](https://github.com/FindsYou-Work/website) |
| `FZ-008` | SupportGenius | `VALIDATION` | L4 | [supportgeni.us](https://supportgeni.us) | [SupportGenius/website](https://github.com/SupportGenius/website) |
| `FZ-009` | promptdecode | `VALIDATION` | L4 | [promptdeco.de](https://promptdeco.de) | [PromptDecode/website](https://github.com/PromptDecode/website) |
| `FZ-010` | Groove Guru | `VALIDATION` | L4 | [groove.guru](https://groove.guru) | [Groove-Guru/website](https://github.com/Groove-Guru/website) |
| `FZ-011` | PosPlug | `VALIDATION` | L4 | [posplug.in](https://posplug.in) | [POSplugin/website](https://github.com/POSplugin/website) |

`autonomy` is `null` on every one of them: no venture has a measured figure,
and the registry does not show one. Set a figure in `fz-data.js` when there
is one. What each record shows instead:

- `target`: the autonomy level (0–5) the venture is designed to reach. A
  stated aim, labelled `AUTONOMY TARGET`, never a measurement.
- `aims.operate`, `aims.intelligence`, `aims.growth`: in words, what the
  venture should run on its own, the kind of intelligence that takes, and what
  will count as growth. The growth line names what gets counted, not a count.
- `github`: public repositories only. Private backends are not linked.

Nothing else is listed: the registry shows only what exists, so a venture with
nothing public yet does not get a placeholder row.

None of the eleven can be bought from today, and their records and `llms.txt`
say so, and do not let any of them read as shipped.

The FZ/LOG panel on the home page is still labelled an illustrative sequence,
and the hero's `agentNetwork` figure (1,284, with simulated drift) is a design
placeholder rather than a measurement. `llms.txt` says so, so answer engines do
not report either as fact.

### Deployment

Live at **https://factory0.ventures**, on Cloudflare Pages (project
`factory-zero`, account "Kontinuum"). `www` 301s to the apex via a Single
Redirect rule.

Deploys are **direct upload**, not git-connected:

```sh
./tools/build-dist.sh
npx wrangler pages deploy dist --project-name factory-zero --branch main
```

`tools/build-dist.sh` assembles `dist/` from an explicit allowlist, so repo
tooling (`tools/`, `README.md`, `.git`) can never end up on the site. It also
stamps every CSS/JS reference with a short content hash (`?v=…`). That matters:
asset filenames are not versioned in the repo, so without the stamp a deploy
cannot invalidate a cached file and visitors keep running the old JavaScript.
With it, `_headers` can cache `/assets/*.css` and `*.js` immutably.

`dist/` is gitignored. The repo root stays the thing you serve locally, with
no build step.

Other notes:

- Cloudflare Email Routing already handles `contact@factory0.ventures` (MX, SPF,
  DKIM and DMARC records exist on the zone). Do not disturb those.
- HSTS is deliberately not set in `_headers`. Turn it on in the Cloudflare
  dashboard (SSL/TLS, Edge Certificates) where it can be rolled back.
- To connect git deploys instead, link the repo in the Pages dashboard with
  build command `./tools/build-dist.sh` and output directory `dist`.

GitHub Pages was enabled briefly while this repo was named
`Factory-Zero.github.io`; it has been deleted and the repo renamed to `website`.
