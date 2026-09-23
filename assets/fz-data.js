// Factory Zero central data model. Add real ventures here.
window.FZ_DATA = {
  ventures: [
    // Only real records belong here. `autonomy: null` renders as an em dash
    // rather than an invented percentage; `stage: null` keeps a venture out of
    // the home-page pipeline until it genuinely has one.
    //
    // `target` is the autonomy level the venture is designed to reach (0-5,
    // see LEVELS in fz-app.js). It is a design aim, not a measurement, and the
    // registry labels it as such. `aims` says in words what that autonomy is
    // for: what the venture should run on its own, the kind of intelligence
    // that takes, and how it grows. None of it carries a figure, and the
    // growth line names what will be counted rather than a count. A record
    // with `target: null` and no `aims` shows a dash in each of those rows.
    // `github` lists public repositories only; private ones are not linked.
    { id: 'FZ-001', name: 'Kontinuum', status: 'BUILDING', stage: 'PROTOTYPE', launched: null, category: 'MUSIC', autonomy: null, site: 'kontinuum.audio', logo: 'kontinuum-animated.svg', logoW: 360, logoH: 264,
      target: 4,
      aims: {
        operate: 'Composition, performance and release are the engine\u2019s job, not a studio\u2019s. The aim is a catalogue that writes and renews itself while people set the taste boundaries and sign off on what ships.',
        intelligence: 'A deterministic real-time engine that plays and a critic that listens: instruments and scenes as code, a scoring model that judges each take against a reference, and distillation from what listeners keep. No cloud model in the playback loop.',
        growth: 'Listener-led. One listener, one continuous stream; growth is listeners who come back the next day, counted from the first installed build and not before.'
      },
      github: [['KONTINUUM-AI/KONTINUUM-ENGINE', 'https://github.com/Kontinuum-ai/kontinuum-engine'], ['KONTINUUM-AI', 'https://github.com/Kontinuum-ai']],
      pitch: {
        problem: "Playlists run out, repeat themselves, or break the mood you were in.",
        solution: "Kontinuum plays music that never ends and never repeats. It is written while you listen.",
        how: ["A real-time music engine composes and plays each moment as it goes", "Plays on your device, offline, with nothing to stream or buffer", "Designed to learn which moments you keep and lean towards them"],
        offer: "The engine is free and open source (MIT). Try it in your browser at kontinuum.audio.",
        saves: "No more skipping, shuffling or building playlists.",
        now: "Browser demo works today. The app is still being built; there is no download yet."
      },
      desc: 'An AI composer performing on a deterministic real-time engine. Music written and performed continuously, personalised to the listener, and playable offline. Not a streaming app and not a DAW: a living instrument.' },
    { id: 'FZ-002', name: 'Undercover Rockstars', status: 'BUILDING', stage: 'LAUNCH', launched: null, category: 'APPAREL', autonomy: null, site: 'undercoverrockstars.com', logo: 'undercover-rockstars-animated.svg', logoW: 100, logoH: 100,
      target: 3,
      aims: {
        operate: 'The garments are cut by people in Bali and that stays. Everything around them is the target for agents: stock, orders, fulfilment, support, content and the brief for the next drop.',
        intelligence: 'Operational rather than creative: demand and stock forecasting per pair and size, fit guidance from a body measurement taken in the browser, and language models for support and copy. Design direction stays human.',
        growth: 'Drop by drop. Growth is pairs sold per drop and buyers who return for the next one, counted from the first drop that is open for sale.'
      },
      github: [['UNDERCOVER-ROCKSTARS/WEBSITE', 'https://github.com/Undercover-Rockstars/website'], ['UNDERCOVER-ROCKSTARS', 'https://github.com/Undercover-Rockstars']],
      pitch: {
        problem: "Clothes that look right in the day look wrong at night, so you change, pack a second outfit or compromise.",
        solution: "Every Undercover Rockstars piece comes as a matched pair: one cut for the day, the same cut for the night.",
        how: ["One pattern, cut twice, so the fit never changes", "Drop 01: eight pairs, sixteen garments", "Cut in small runs in Bali"],
        offer: "Drop 01 is not on sale yet. The collection is on the site.",
        saves: "One fit, two looks. No second outfit.",
        now: "The site is live. Nothing can be bought yet."
      },
      desc: 'A clothing house built on one idea: every piece comes as a matched pair. One pattern is cut twice, once for the day and once for the night, so the fit never changes when the room does. Drop 01 is eight pairs, sixteen garments, cut in Bali.' },
    { id: 'FZ-003', name: 'Yoginini', status: 'BUILDING', stage: 'VALIDATION', launched: null, category: 'WELLNESS', autonomy: null, site: 'yoginini.us', logo: 'yoginini-animated.svg', logoW: 120, logoH: 120,
      target: 3,
      aims: {
        operate: 'The teacher on the phone runs itself; the real teachers are people and stay that way. Agents run bookings, payouts, support, the coach cohort and the teaching content around them.',
        intelligence: 'Perception on the device: a pose model tracking 33 landmarks, angle and score models that never see video, and a voice that chooses one correction at a time. The backend\u2019s intelligence is scheduling and matching, not vision.',
        growth: 'Practice-led. Growth is people who practise every week and the hours booked with real teachers, counted from the first app in hands.'
      },
      github: [['YOGININI/WEBSITE', 'https://github.com/Yoginini/website'], ['YOGININI', 'https://github.com/Yoginini']],
      pitch: {
        problem: "Yoga videos can’t see you. Nobody tells you when your knee drifts or your back rounds.",
        solution: "Yoginini is a yoga teacher on your phone that watches your pose and gives one calm correction at a time.",
        how: ["Follows 33 points on your body through the phone camera", "Speaks one correction at a time, like a teacher across the room", "Video never leaves your phone. Book a real teacher by the hour when you want one"],
        offer: "Free to join the waitlist.",
        saves: "Private-lesson feedback without booking a private lesson.",
        now: "Being built. The site and the waitlist are open; the app is not out yet."
      },
      desc: 'A yoga teacher that can see you. A pose model running on the phone tracks 33 body landmarks and speaks one calm correction at a time, and no video ever leaves the device. Real teachers are bookable by the hour alongside it. The site and the waitlist are open; the app is not built.' },
    { id: 'FZ-004', name: 'Cratefield', status: 'BUILDING', stage: 'VALIDATION', launched: null, category: 'INFRASTRUCTURE', autonomy: null, site: 'cratefield.com', logo: 'cratefield-animated.svg', logoW: 120, logoH: 120,
      target: 4,
      aims: {
        operate: 'Provisioning, upgrades, backups, incident response and support are the product, so they are the automation target. The aim is a control plane that runs each customer\u2019s backend without a person on call.',
        intelligence: 'Systems intelligence: compile-time composition, migration and drift checks, anomaly detection on worker and database telemetry, and an agent that reads a failing deploy and proposes the fix. Not a chat model on top of a dashboard.',
        growth: 'Developer-led. Growth is backends running in customers\u2019 own Cloudflare accounts and harness crates in use, counted once the control plane exists.'
      },
      github: [['CRATEFIELD/HARNESS', 'https://github.com/Cratefield/harness'], ['CRATEFIELD', 'https://github.com/Cratefield']],
      pitch: {
        problem: "Every new product starts with weeks of the same plumbing: sign-ups, database, emails, deploys, secrets.",
        solution: "Cratefield is a backend you compile. Pick the modules you need and ship one small service to your own Cloudflare account.",
        how: ["Modules plug in at build time, so you ship only what you use", "One service and one database per product, in an account you own", "Email sign-up and waitlist modules work today"],
        offer: "Free and open source (MIT). A managed version that runs it for you is planned.",
        saves: "Skip weeks of backend setup on every new product.",
        now: "The open-source core works today. The managed service is not built yet."
      },
      desc: 'A backend you compile rather than a platform you configure. The Rust harness underneath is open source, MIT and running today; the managed control plane, which would provision the worker, the database and the secrets inside your own Cloudflare account and then operate them, is designed and not yet written. The site and the early-access list are open.' },
    { id: 'FZ-005', name: 'VibeCaddie', status: 'BUILDING', stage: 'VALIDATION', launched: null, category: 'DEVTOOLS', autonomy: null, site: 'vibecaddie.com', logo: 'vibecaddie-animated.svg', logoW: 120, logoH: 120,
      target: 5,
      aims: {
        operate: 'The product is an agent and the company should be too: install, audit, findings, credits, support and skill updates all run without a person in the loop. People review the review skills and set the prices.',
        intelligence: 'Reasoning over code: repository classification, skill selection, severity ranking and fix suggestions, with a verification pass so a finding is confirmed before it is shown. Judged on precision, not volume.',
        growth: 'Usage-led. Growth is repositories audited and credits bought again, counted from the first run of the GitHub app.'
      },
      github: [['VIBECADDIE/WEBSITE', 'https://github.com/VibeCaddie/website'], ['VIBECADDIE', 'https://github.com/VibeCaddie']],
      pitch: {
        problem: "You shipped code you didn’t fully write, and nobody has really reviewed it.",
        solution: "VibeCaddie reviews your repository and tells you what to fix first.",
        how: ["Works out what kind of codebase it is and checks only what applies", "Every finding comes with the file, the line, why it matters and a fix", "Double-checks each finding before showing it, so you get fewer false alarms"],
        offer: "Pay per run with prepaid credits, so you know the price before it starts. Early access is open.",
        saves: "Built to turn days of waiting for a review into minutes.",
        now: "Being built. The site and early-access list are open; the GitHub app is not out yet."
      },
      desc: 'A code review agent for the code you did not fully write. It reads a repository, works out what kind of codebase it is, loads only the review skills that apply to it, and returns findings ranked by severity with the file, the line, why it matters and a suggested fix. Prepaid credits rather than a subscription, so the price of a run is known before it starts. The site and the early-access list are open; the GitHub app is not built.' },
    { id: 'FZ-006', name: 'Colonizer', status: 'BUILDING', stage: 'PROTOTYPE', launched: null, category: 'DEVTOOLS', autonomy: null, site: 'colonizer.dev', logo: 'colonizer-animated.svg', logoW: 120, logoH: 120,
      target: 4,
      aims: {
        operate: 'The backlog is the thing that should clear itself. A person picks the issue and reviews the pull request; everything between (the sandbox, the worktree, the agent, the mesh, the commit and the push) is the automation target.',
        intelligence: 'Isolation and judgement rather than a bigger model: one settler per colony, questions returned as multiple-choice cards instead of prose, a watchdog that notices a colony has stopped making progress, and a router that puts the right model on each slot.',
        growth: 'Repository-led. Growth is repositories with colonies running and pull requests merged from them, counted from the first install that is not the author\u2019s.'
      },
      github: [['COLONIZER-DEV/HARNESS', 'https://github.com/Colonizer-dev/harness'], ['COLONIZER-DEV', 'https://github.com/Colonizer-dev']],
      pitch: {
        problem: "Working through GitHub issues takes hours you’d rather spend building.",
        solution: "Colonizer sends coding agents to solve your GitHub issues and hands back pull requests you can review and merge.",
        how: ["Each agent works in its own isolated VM, away from your machine and your keys", "Runs locally, on your own computer", "Returns ready-to-review pull requests"],
        offer: "Free and open source (MIT). Runs on your own machine; nothing is hosted.",
        saves: "Save yourself hours of coding work on every backlog.",
        now: "Works today on Linux, with Claude Code as the agent."
      },
      desc: 'A local-first app that turns GitHub issues into pull requests. Each task gets a coding agent, Claude Code today, inside its own disposable KVM microVM with a fresh git worktree, linked to the host over a private mesh that never touches your own tailnet. The web UI shows the chat, a terminal in the VM and the agent\u2019s questions as multiple-choice cards. The host, not the VM, commits, pushes and opens the pull request, so the GitHub and Claude tokens never enter it. The Rust host, the in-VM daemon and the React UI are open source under MIT and run locally on Linux x86_64 with KVM. There is no hosted service; more coding agents, a model router, remote outposts and GitLab, Linear and Jira sources are planned, not built.' },
    { id: 'FZ-007', name: 'FindsYou.work', status: 'BUILDING', stage: 'VALIDATION', launched: null, category: 'CAREERS', autonomy: null, site: 'findsyou.work', logo: 'findsyou-animated.svg', logoW: 120, logoH: 120,
      target: 4,
      aims: {
        operate: 'The search itself is the automation target: reading the boards, discarding what the person could never take, drafting the documents and tracking what was sent. The person decides what to apply for and presses send; nothing is ever submitted on their behalf.',
        intelligence: 'Eligibility before relevance. A model of right to work, employment type, hours, travel and timezone decides what is even possible, a reading of the listing decides whether it is worth the time, and a provenance check refuses to print a number that is not in the person\u2019s own CV.',
        growth: 'Outcome-led. Growth is replies received per person and people who come back for the next search, counted from the first scan that runs for someone else.'
      },
      github: [['FINDSYOU-WORK/WEBSITE', 'https://github.com/FindsYou-Work/website'], ['FINDSYOU-WORK', 'https://github.com/FindsYou-Work']],
      pitch: {
        problem: "Job hunting means scrolling hundreds of listings you could never actually take.",
        solution: "FindsYou reads the job boards for you and hands back only the jobs you can really get, with a CV and cover letter written for each.",
        how: ["Drops listings that don’t fit: wrong country, hours, visa, or jobs that are not really open", "Shows why each one was dropped", "Writes a matching CV and cover letter for every job that’s left"],
        offer: "Free to join the waitlist.",
        saves: "Most of a week of job-board scrolling, gone.",
        now: "Being built. The site and waitlist are open; the search is not running yet."
      },
      desc: 'A job search that runs without the person doing the searching. It reads the boards continuously, throws out the listings they could never actually take (wrong residency, wrong hours, full-time only, no sponsorship, reposted ghost jobs) and hands back the few that survive with a CV and cover letter already written for each. The value is in what it removes: most of a week\u2019s listings, with the reason each one was discarded shown rather than hidden. The site and the waitlist are open; the scan, the filter and the documents are designed and not yet written.' },
    { id: 'FZ-008', name: 'SupportGenius', status: 'BUILDING', stage: 'VALIDATION', launched: null, category: 'SUPPORT', autonomy: null, site: 'supportgeni.us', logo: 'supportgenius-animated.svg', logoW: 120, logoH: 120,
      target: 4,
      aims: {
        operate: 'The support desk is the automation target: answering from the company\u2019s own docs, tickets and files, turning what it cannot answer into a ticket, a lead or an issue with reproduction steps, and keeping the customer told until it is closed. People stay on call to approve, take over and hand back; nothing is filed on one model\u2019s say-so.',
        intelligence: 'Two models that check each other rather than one bigger one. A drafting model turns the conversation into a structured ticket and an independent judge decides whether, where and with what priority it is filed; the agent answers only above a confidence threshold, and each correction a person makes is kept as a reviewed source for the next customer.',
        growth: 'Resolution-led. Growth is conversations resolved without a handoff and escalations filed without a correction, counted from the first widget that runs on a site that is not the author\u2019s.'
      },
      github: [['SUPPORTGENIUS/WEBSITE', 'https://github.com/SupportGenius/website'], ['SUPPORTGENIUS', 'https://github.com/SupportGenius']],
      pitch: {
        problem: "Customers wait for answers already in your docs, and real bugs get lost in the inbox.",
        solution: "SupportGenius answers customers from your own docs and files, and turns what it can’t answer into a proper ticket.",
        how: ["Answers by chat, voice or phone, from your docs, tickets and files", "What it can’t answer becomes a support ticket, a sales lead or a GitHub issue with steps to reproduce", "Every ticket is checked a second time before it is filed, and the customer gets updates until it is closed"],
        offer: "The core is planned as free and open source (MIT).",
        saves: "Built to take repeat questions and ticket triage off your week.",
        now: "Being built. Only the site exists; the waitlist opens soon."
      },
      desc: 'A customer-support agent that answers from a company\u2019s own docs, tickets and files, by text or voice, through a web widget, an iOS or Android SDK, a phone line, an API or an MCP server. What it cannot answer becomes a ticket for support, a lead for sales or a GitHub issue with reproduction steps for engineering: a drafting model writes it, an independent judge model checks it before anything is filed, and the customer hears back as it moves until it is closed. The ticketing and routing core is planned in Rust, open source under MIT. Only the site exists. The agent, the widget, the SDKs, the phone line, the integrations and the core are designed and not yet written, and the waitlist is not open yet.' },
    { id: 'FZ-009', name: 'promptdecode', status: 'BUILDING', stage: 'VALIDATION', launched: null, category: 'SECURITY', autonomy: null, site: 'promptdeco.de', logo: 'promptdecode-animated.svg', logoW: 120, logoH: 120,
      target: 4,
      aims: {
        operate: 'Review is the automation target. A coding agent with a write token reads a pull request that a human reviewer has already approved, and the two of them are not reading the same document: tag-block characters, bidi overrides and variation selectors render as nothing and tokenize normally. The scanners are meant to run in CI on every change, decode what they find rather than merely flag it, and post the plain text back on the pull request, with no model in the loop and nothing leaving the runner.',
        intelligence: 'Deliberately none where none is needed. Both planned engines are deterministic: one tracing untrusted workflow input to an agent step that holds a write token, one matching named Unicode classes across repository content. A detector that needs a model to decide what is suspicious cannot state its own coverage, and coverage that can be stated is the product.',
        growth: 'Evidence-led, and slower for it. No percentage of attacks blocked is published, because character-level evasion rates move too far with technique for one number to mean anything. What gets published is deterministic coverage of a named list of Unicode classes and recall at a stated false-positive rate on a named corpus, with the corpus and the harness in the open. Growth is repositories scanned per week once the Action exists.'
      },
      github: [['PROMPTDECODE/WEBSITE', 'https://github.com/PromptDecode/website'], ['PROMPTDECODE', 'https://github.com/PromptDecode']],
      pitch: {
        problem: "Hidden text in a pull request or issue can tell a coding agent to approve or merge, and the human reviewer can’t see it.",
        solution: "promptdecode finds invisible text and shows you, in plain words, what it says.",
        how: ["Paste any text and it reveals hidden characters and decodes their message", "Runs entirely in your browser; nothing is sent anywhere", "A config scanner checks your GitHub workflows for agent steps that untrusted input can reach"],
        offer: "Free to use today at promptdeco.de.",
        saves: "Catch a hidden instruction before your agent acts on it.",
        now: "The decoder works today, and the config scanner runs from source (no release yet). The content scanner and the GitHub Action are being built."
      },
      desc: 'Finds text that is invisible to a human reviewer and fully legible to a language model, and decodes it. Hidden instructions in a pull request title, an issue body or a repository file can tell a coding agent to approve, merge or comment, while the diff shows nothing unusual. Two parts work today. The decoder on the site, which reads three named classes of code point (the Unicode tag block, bidi controls and overrides, variation selectors), reconstructs the payload they encode, and runs entirely in the reader\u2019s browser, sending nothing anywhere. And the config scanner, which traces untrusted workflow input to an agent step holding a write token, and runs from source with no release yet. The rest is designed and unwritten: a content engine that decodes payloads across a repository, a command-line scanner, a GitHub Action, and an open benchmark. If a class is not on the published list, it is not detected; the list is the claim.' },
    { id: 'FZ-010', name: 'Groove Guru', status: 'BUILDING', stage: 'VALIDATION', launched: null, category: 'MUSIC', autonomy: null, site: 'groove.guru', logo: 'groove-guru-animated.svg', logoW: 120, logoH: 120,
      target: 4,
      aims: {
        operate: 'Teaching is the automation target. A small harness on the booth LAN reads what Pioneer Pro DJ Link gear already announces (beat, tempo, sync, master, on-air, crossfader) and a coach speaks one note at a time when the mix drifts: a Camelot clash, a blend that misses the phrase, a deck sliding off the grid. It listens and never sends control, so there is nothing for it to break in a live set.',
        intelligence: 'Deterministic where timing matters, language where it does not. Beat, phrase and key checks are rules over packet data and run locally; a model only turns a finding into a sentence, because speech arrives 300 to 800 milliseconds late and cannot coach a downbeat. The click stays on the laptop.',
        growth: 'Practice-led. Free, open-source harness first, a $6.99 a month Pro tier for hosted history and sessions at launch. Growth is drills completed on real gear, counted from the first booth that is not the author’s.'
      },
      github: [['GROOVE-GURU/WEBSITE', 'https://github.com/Groove-Guru/website'], ['GROOVE-GURU', 'https://github.com/Groove-Guru']],
      pitch: {
        problem: "Learning to DJ on your own, nobody tells you why the mix sounded off.",
        solution: "Groove Guru listens to your Pioneer decks and tells you, in a calm voice, when the key clashes, the blend misses the phrase or the beat drifts.",
        how: ["A small app on the booth network reads your CDJs and mixer, and never touches your mix", "Mirrors your decks in the browser", "Six drills take you from zero to your first mix, free on the site today"],
        offer: "The booth app will be free and open source (MIT). Pro coaching at launch: $6.99 a month.",
        saves: "Stop guessing what went wrong in your practice sets.",
        now: "The drills work today. The booth app and the coach are being built. Needs Pioneer Pro DJ Link gear."
      },
      desc: 'A DJ tutor for Pioneer Pro DJ Link gear. A harness on a machine plugged into the booth switch listens to the CDJs and mixer on UDP 50000 to 50002, mirrors the decks in a browser, and coaches key, phrase and timing in a calm voice, then gets out of the way. It needs the gear: it is not a browser DJ app. One part exists and works today: the site at groove.guru, with six zero-to-booth drills that run in the browser on a visual beat clock (count the bar, cue on the one, ride the phrase, blend on the Camelot wheel, the first mix). The rest is designed and unwritten: the harness, one Rust binary under MIT; the spoken coach; Pro on Cloudflare; and an iPad and iPhone companion over local Wi-Fi or Cloudflare. Independent, and not affiliated with Pioneer DJ.' },
    { id: 'FZ-011', name: 'PosPlugin', status: 'BUILDING', stage: 'VALIDATION', launched: null, category: 'INTEGRATIONS', autonomy: null, site: 'posplug.in', logo: 'posplug-animated.svg', logoW: 120, logoH: 120,
      target: 4,
      aims: {
        operate: 'Integration upkeep is the automation target. Connecting a merchant’s point-of-sale system is meant to be a guided half hour instead of a custom project, and keeping it connected is meant to need nobody: a monitor watches every sync for schema drift and failures, proposes the mapping fix, and tells ops what broke and why.',
        intelligence: 'A model reads a POS’s API docs, specs or sample payloads and proposes how each field maps to one data model, with a confidence score on every field. It proposes and a person confirms: a low-confidence mapping never goes live on its own, and every decision is kept in an audit log. Moving the data is plain code.',
        growth: 'Developer-led. A free sandbox with test POS data first, then pricing per connected location, set with the first customers. Restaurants are the first vertical. Growth is merchant locations connected, counted from the first customer that is not a pilot.'
      },
      github: [['POSPLUGIN/WEBSITE', 'https://github.com/POSplugin/website'], ['POSPLUGIN', 'https://github.com/POSplugin']],
      pitch: {
        problem: "Every app that needs a merchant’s sales data has to build a new integration for each point-of-sale system, and each one breaks when the vendor changes its API.",
        solution: "PosPlugin connects to any POS once and gives your app all of them through one API.",
        how: ["Connect a merchant’s POS with a login or an API key; nothing is written to it", "AI maps its fields to one clean model, and a person confirms anything it is unsure of", "Your app reads orders, payments, menus and locations through one REST API and webhooks"],
        offer: "A free sandbox for developers at launch; live pricing per connected location.",
        saves: "Connect a new merchant in half an hour instead of weeks of integration work.",
        now: "The site and the early-access list are open. The connectors, the mapping engine and the API are being built."
      },
      desc: 'An integration layer for point-of-sale systems. It connects to a merchant’s POS with OAuth or an API key, pulls sample data read-only, and a model maps the POS’s fields to one data model (orders, payments, catalog items, locations) with a confidence score on every field; a person confirms the uncertain ones. Apps then read every merchant through one REST API and one webhook stream, with the original POS payload kept on each record, and write orders back where the POS allows. A monitor watches for schema drift and failing syncs. Card numbers never pass through it. The first vertical is restaurants. What exists today is the site at posplug.in and its early-access list; the connectors, the mapping engine, the unified API and the sandbox are designed and not yet written.' },
    { id: 'FZ-012', name: 'Keep Shipping', status: 'BUILDING', stage: 'VALIDATION', launched: null, category: 'DEVTOOLS', autonomy: null, site: 'keepshipping.run', logo: 'keepshipping-animated.svg', logoW: 120, logoH: 120,
      target: 4,
      aims: {
        operate: 'Deploys are the automation target. One typed workflow file per repository builds the images, plans and applies the infrastructure and rolls out, and it is checked before anything runs, so a broken pipeline is caught on the laptop instead of in the tenth CI run. The same engine runs locally and in CI, so nobody has to push to find out.',
        intelligence: 'Coding agents can write, check and run the workflow, fenced by a policy in the same file: what they may do alone, what waits for a named person. A decide step asks Jev, a typed decision model, how risky a plan is; it answers with one of the answers you defined and a confidence score, low-risk changes can go through, and destroys always wait for a human. The engine itself is plain code.',
        growth: 'Developer-led. An early-access list first, opened in small batches; typed, versioned blocks that one team writes and forty repos reuse carry it inside a company. Pricing is not set. Growth is repositories shipping through it, counted from the first team that is not a pilot.'
      },
      github: [['KEEP-SHIPPING/WEBSITE', 'https://github.com/Keep-Shipping/website'], ['KEEP-SHIPPING', 'https://github.com/Keep-Shipping']],
      pitch: {
        problem: "Changing a deploy pipeline takes a string of \u201cfix ci\u201d commits: hundreds of lines of YAML nobody fully understands, glued to Terraform and Docker with shell scripts, and the only test is to push and wait.",
        solution: "Keep Shipping replaces that with one readable workflow file per repo that is checked before it runs.",
        how: ["Build images, plan and apply Terraform or OpenTofu, and deploy, as typed steps instead of scripts", "Run the exact same pipeline on your laptop before you push it", "Let agents ship too: a policy decides what waits for a person"],
        offer: "Early access by invite, in small batches.",
        saves: "Stop spending afternoons on eleven commits to change one pipeline.",
        now: "The site and the early-access list are open. The engine, the CLI and the built-in steps are being built."
      },
      desc: 'A deploy workflow engine. Each repository gets one typed workflow file that builds and signs OCI images, plans and applies Terraform or OpenTofu (apply runs the exact plan a reviewer approved), waits for a human where the file says so, and rolls out to Kubernetes, VMs over SSH or serverless. Every step has typed inputs and outputs, so a tag wired where a digest belongs or a misspelled step fails the check before anything runs, and the same engine runs the file on a laptop and in CI. Steps can be packaged as typed, versioned blocks and reused across repos; a step that needs real code is a TypeScript function with typed inputs. For coding agents, a policy in the file says what they may do alone and what waits for a named person, and a decide step asks Jev (TypeSafe AI) to rate a plan, with destroys always going to a human. What exists today is the site at keepshipping.run and its early-access list; the engine, the CLI, the steps and the runner are designed and not yet written.' }
  ],
  layers: [
    { name: 'DISCOVER', agents: [['RESEARCH', 'Analyzing 14,284 market signals'], ['STRATEGY', 'Scoring opportunity 0.91'], ['ANALYTICS', 'Cohort model refreshed']] },
    { name: 'BUILD', agents: [['PRODUCT', 'Specification v7 generated'], ['ENGINEERING', 'Deploying build 4218'], ['DESIGN', 'Interface variant 3 rendered'], ['QA', '1,102 tests passing']] },
    { name: 'OPERATE', agents: [['INFRASTRUCTURE', 'Region eu-west scaled to 4 nodes'], ['SECURITY', 'Policy audit complete'], ['SUPPORT', 'Resolution generated · ticket 3,314'], ['FINANCE', 'Ledger reconciled']] },
    { name: 'DISTRIBUTE', agents: [['GROWTH', 'Experiment 882 running'], ['CONTENT', 'Release note published'], ['SALES', 'Outbound sequence adjusted']] },
    { name: 'LEARN', agents: [['LEGAL', 'Terms update drafted for review'], ['KNOWLEDGE', 'Playbook updated · 3 patterns'], ['OPTIMIZATION', 'Retention delta +2.1%']] }
  ],
  logPool: [
    'market signal identified', 'research swarm deployed', 'opportunity score 0.91', 'venture workspace created',
    'product specification generated', 'prototype build started', 'infrastructure provisioned', 'identity layer attached',
    'billing configured', 'first deploy successful', 'observability online', 'support agent initialized',
    'growth experiment 001 scheduled', 'first customer session recorded', 'retention model trained', 'weekly review generated',
    'human approval requested', 'approval granted', 'autonomy level raised to 3', 'next signal queued'
  ]
};

// Editable presentation values. In the Claude Design source these were `data-props`
// on the component; here they are plain overrides you can edit without touching logic.
window.FZ_CONFIG = {
  headline: 'We build companies that operate and grow themselves.', // also rendered statically in index.html
  factoryStatus: 'ONLINE',   // ONLINE | MAINTENANCE | INITIALIZING
  agentNetwork: 1284
};
