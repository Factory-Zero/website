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
    //
    // `uses` is what the venture is built with: sister ventures (by id) and
    // third parties (by a key of `services` below), each with the role it
    // plays and whether that is `live` (in use today) or `planned`. Live means
    // checked, not hoped: a Worker answering on its route, a sending key that
    // actually sends, a module merged and running. A mailer that is a no-op is
    // not live email. Notes are public, so they never name a private repository.
    // tools/sync-ventures.js renders it on each venture page and writes
    // /stack.json, which the venture sites vendor into their footers.
    // The evidence behind each entry is in tools/STACK-SOURCES.md.
    { id: 'FZ-001', name: 'Kontinuum', status: 'BUILDING', stage: 'PROTOTYPE', launched: null, category: 'MUSIC', autonomy: null, site: 'kontinuum.audio', logo: 'kontinuum-animated.svg', logoW: 360, logoH: 264,
      target: 4,
      uses: [
        { id: 'FZ-012', role: 'deploys', status: 'planned', note: 'Every venture site and Worker deployed from the Keep Shipping console.' },
        { id: 'cloudflare', role: 'hosting', status: 'live', note: 'The site.' }
      ],
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
      uses: [
        { id: 'FZ-012', role: 'deploys', status: 'planned', note: 'Every venture site and Worker deployed from the Keep Shipping console.' },
        { id: 'google-fonts', role: 'fonts', status: 'live', note: 'The site\u2019s typefaces (Archivo, JetBrains Mono), loaded from Google.' },
        { id: 'cloudflare', role: 'hosting', status: 'live', note: 'The site and its forms.' }
      ],
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
      uses: [
        { id: 'FZ-004', role: 'framework', status: 'planned', note: 'The bookings backend is being written to run on the Cratefield harness; it is not deployed.' },
        { id: 'FZ-008', role: 'bug-reports', status: 'planned', note: 'Errors and bug reports become deduplicated GitHub issues, through the Cratefield error reporter.' },
        { id: 'FZ-012', role: 'deploys', status: 'planned', note: 'Every venture site and Worker deployed from the Keep Shipping console.' },
        { id: 'google-fonts', role: 'fonts', status: 'live', note: 'The site\u2019s typefaces (Cormorant Garamond, Figtree, Space Mono), loaded from Google.' },
        { id: 'cloudflare', role: 'hosting', status: 'live', note: 'The site and its forms.' }
      ],
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
      uses: [
        { id: 'resend', role: 'email', status: 'live', note: 'Waitlist confirmation mail (double opt-in) from send.cratefield.com.' },
        { id: 'FZ-013', role: 'email', status: 'planned', note: 'Owlpost replaces Resend, through an Owlpost adapter in the harness.' },
        { id: 'FZ-008', role: 'bug-reports', status: 'planned', note: 'Errors and bug reports become deduplicated GitHub issues, through the Cratefield error reporter.' },
        { id: 'polar', role: 'payments', status: 'planned', note: 'Polar as Merchant of Record behind the harness Payments port, for the managed service. Nothing is on sale yet.' },
        { id: 'FZ-012', role: 'deploys', status: 'planned', note: 'Every venture site and Worker deployed from the Keep Shipping console.' },
        { id: 'google-fonts', role: 'fonts', status: 'live', note: 'The site\u2019s typefaces (Archivo, IBM Plex Mono), loaded from Google.' },
        { id: 'cloudflare', role: 'hosting', status: 'live', note: 'The site, and the waitlist Worker with its D1 database.' }
      ],
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
      uses: [
        { id: 'FZ-012', role: 'deploys', status: 'planned', note: 'Every venture site and Worker deployed from the Keep Shipping console.' },
        { id: 'google-fonts', role: 'fonts', status: 'live', note: 'The site\u2019s typefaces (Sora, IBM Plex Mono), loaded from Google.' },
        { id: 'cloudflare', role: 'hosting', status: 'live', note: 'The site and its forms.' }
      ],
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
      uses: [
        { id: 'FZ-004', role: 'framework', status: 'live', note: 'The fleet waitlist Worker at api.colonizer.dev runs on the Cratefield harness, and the app uses its telemetry module.' },
        { id: 'FZ-013', role: 'email', status: 'planned', note: 'Waitlist confirmation mail. Double opt-in is off today, so no mail is sent yet.' },
        { id: 'FZ-008', role: 'bug-reports', status: 'planned', note: 'Errors and bug reports become deduplicated GitHub issues, through the Cratefield error reporter.' },
        { id: 'polar', role: 'payments', status: 'planned', note: 'Paid plans through Polar as Merchant of Record, via the Cratefield Payments port. Nothing is on sale yet.' },
        { id: 'FZ-009', role: 'screening-engine', status: 'live', note: 'Colony output is screened before a pull request opens by the screen module\u2019s promptdecode provider, a built-in decoder for promptdecode\u2019s three code-point classes.' },
        { id: 'FZ-016', role: 'secrets-handoff', status: 'planned', note: 'Optional sealed handoffs between colonies on different machines.' },
        { id: 'FZ-012', role: 'deploys', status: 'planned', note: 'Every venture site and Worker deployed from the Keep Shipping console.' },
        { id: 'google-fonts', role: 'fonts', status: 'live', note: 'The site\u2019s typefaces (Instrument Sans, JetBrains Mono), loaded from Google.' },
        { id: 'cloudflare', role: 'hosting', status: 'live', note: 'The site and the waitlist Worker.' }
      ],
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
      uses: [
        { id: 'FZ-004', role: 'framework', status: 'live', note: 'The waitlist Worker at api.findsyou.work runs on the Cratefield harness waitlist module.' },
        { id: 'FZ-013', role: 'email', status: 'planned', note: 'Waitlist confirmation mail. Double opt-in is off today, so no mail is sent yet.' },
        { id: 'stripe', role: 'payments', status: 'planned', note: 'A paywall through the Cratefield Stripe adapter. Nothing is on sale yet.' },
        { id: 'FZ-008', role: 'bug-reports', status: 'planned', note: 'Errors and bug reports become deduplicated GitHub issues, through the Cratefield error reporter.' },
        { id: 'FZ-012', role: 'deploys', status: 'planned', note: 'Every venture site and Worker deployed from the Keep Shipping console.' },
        { id: 'google-fonts', role: 'fonts', status: 'live', note: 'The site\u2019s typefaces (Instrument Serif, Manrope, IBM Plex Mono), loaded from Google.' },
        { id: 'cloudflare', role: 'hosting', status: 'live', note: 'The site and the waitlist Worker.' }
      ],
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
      uses: [
        { id: 'FZ-004', role: 'framework', status: 'planned', note: 'The ticketing and routing core is being written on the Cratefield harness; it is not deployed.' },
        { id: 'polar', role: 'payments', status: 'planned', note: 'Paid plans through Polar as Merchant of Record, via the Cratefield Payments port. Nothing is on sale yet.' },
        { id: 'FZ-009', role: 'security-screening', status: 'planned', note: 'Free text in bug reports is screened for hidden instructions before a model drafts the ticket.' },
        { id: 'FZ-012', role: 'deploys', status: 'planned', note: 'Every venture site and Worker deployed from the Keep Shipping console.' },
        { id: 'google-fonts', role: 'fonts', status: 'live', note: 'The site\u2019s typefaces (Geist, Geist Mono), loaded from Google.' },
        { id: 'cloudflare', role: 'hosting', status: 'live', note: 'The site.' }
      ],
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
      uses: [
        { id: 'polar', role: 'payments', status: 'planned', note: 'Paid tiers (the GitHub Action, private repositories) through Polar as Merchant of Record. Nothing is on sale yet.' },
        { id: 'FZ-012', role: 'deploys', status: 'planned', note: 'Every venture site and Worker deployed from the Keep Shipping console.' },
        { id: 'google-fonts', role: 'fonts', status: 'live', note: 'The site\u2019s typefaces (Instrument Serif, Instrument Sans, JetBrains Mono), loaded from Google.' },
        { id: 'cloudflare', role: 'hosting', status: 'live', note: 'The site, where the decoder runs in the browser.' }
      ],
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
      uses: [
        { id: 'FZ-012', role: 'deploys', status: 'planned', note: 'Every venture site and Worker deployed from the Keep Shipping console.' },
        { id: 'google-fonts', role: 'fonts', status: 'live', note: 'The site\u2019s typefaces (Big Shoulders Display, Big Shoulders Stencil Display, Instrument Sans, JetBrains Mono), loaded from Google.' },
        { id: 'cloudflare', role: 'hosting', status: 'live', note: 'The site.' }
      ],
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
      uses: [
        { id: 'FZ-004', role: 'framework', status: 'live', note: 'The waitlist Worker at api.posplug.in runs on the Cratefield harness waitlist module.' },
        { id: 'FZ-013', role: 'email', status: 'planned', note: 'Waitlist confirmation mail. Double opt-in is off today, so no mail is sent yet.' },
        { id: 'FZ-008', role: 'bug-reports', status: 'planned', note: 'Errors and bug reports become deduplicated GitHub issues, through the Cratefield error reporter.' },
        { id: 'FZ-012', role: 'deploys', status: 'planned', note: 'Every venture site and Worker deployed from the Keep Shipping console.' },
        { id: 'google-fonts', role: 'fonts', status: 'live', note: 'The site\u2019s typefaces (Archivo, IBM Plex Mono), loaded from Google.' },
        { id: 'cloudflare', role: 'hosting', status: 'live', note: 'The site and the waitlist Worker.' }
      ],
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
      uses: [
        { id: 'FZ-004', role: 'framework', status: 'planned', note: 'The hosted parts (waitlist, approvals, run logs) are planned as a Cratefield venture.' },
        { id: 'FZ-008', role: 'bug-reports', status: 'planned', note: 'Errors and bug reports become deduplicated GitHub issues, through the Cratefield error reporter.' },
        { id: 'polar', role: 'payments', status: 'planned', note: 'Paid plans through Polar as Merchant of Record, via the Cratefield Payments port. Nothing is on sale yet.' },
        { id: 'google-fonts', role: 'fonts', status: 'live', note: 'The site\u2019s typefaces (Bricolage Grotesque, DM Mono), loaded from Google.' },
        { id: 'cloudflare', role: 'hosting', status: 'live', note: 'The site.' }
      ],
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
      desc: 'A deploy workflow engine. Each repository gets one typed workflow file that builds and signs OCI images, plans and applies Terraform or OpenTofu (apply runs the exact plan a reviewer approved), waits for a human where the file says so, and rolls out to Kubernetes, VMs over SSH or serverless. Every step has typed inputs and outputs, so a tag wired where a digest belongs or a misspelled step fails the check before anything runs, and the same engine runs the file on a laptop and in CI. Steps can be packaged as typed, versioned blocks and reused across repos; a step that needs real code is a TypeScript function with typed inputs. For coding agents, a policy in the file says what they may do alone and what waits for a named person, and a decide step asks Jev (TypeSafe AI) to rate a plan, with destroys always going to a human. What exists today is the site at keepshipping.run and its early-access list; the engine, the CLI, the steps and the runner are designed and not yet written.' },
    { id: 'FZ-013', name: 'Owlpost', status: 'BUILDING', stage: 'VALIDATION', launched: null, category: 'EMAIL', autonomy: null, site: 'owlpost.to', logo: 'owlpost-animated.svg', logoW: 120, logoH: 120,
      target: 4,
      uses: [
        { id: 'FZ-004', role: 'framework', status: 'live', note: 'The email API is a Cratefield venture, deployed at api.owlpost.to.' },
        { id: 'aws-ses', role: 'inbound-email', status: 'live', note: 'Receives inbound mail for agents.owlpost.to in production.' },
        { id: 'aws-ses', role: 'email', status: 'planned', note: 'Outbound sending through SES, once AWS lifts the sandbox on the account.' },
        { id: 'FZ-008', role: 'bug-reports', status: 'planned', note: 'Errors and bug reports become deduplicated GitHub issues, through the Cratefield error reporter.' },
        { id: 'polar', role: 'payments', status: 'planned', note: 'Paid plans and usage through Polar as Merchant of Record. Nothing is on sale yet.' },
        { id: 'FZ-012', role: 'deploys', status: 'planned', note: 'Every venture site and Worker deployed from the Keep Shipping console.' },
        { id: 'cloudflare', role: 'hosting', status: 'live', note: 'The site, Email Routing, and the API Worker with D1 and R2.' }
      ],
      aims: {
        operate: 'Sending runs itself: a message is accepted, split, signed, delivered and watched, and bounces and complaints feed the suppression list with no one in the loop. People set limits and look at the dashboard; they do not push mail through by hand.',
        intelligence: 'Mostly plain code. Models help at the edges: an AI panel that edits a template and shows every change as a diff to accept or reject, and screening that holds a suspicious inbound message before an agent reads it.',
        growth: 'Developer-led, and first inside Factory Zero: Owlpost replaces Resend in the ventures that send mail today. Growth is emails sent and agent inboxes in use by teams outside Factory Zero, counted from the first of those.'
      },
      github: [['OWLPOST-TO', 'https://github.com/Owlpost-to']],
      pitch: {
        problem: "Apps send email through one service, parse replies with another, and AI agents have no real inbox at all.",
        solution: "Owlpost is one email API: send, receive inbound mail as JSON, and give an agent its own address.",
        how: ["Transactional and marketing email from one SDK, with a timeline for every message", "Inbound email parsed to JSON and posted to your webhook", "Real inboxes for AI agents, created with one API call"],
        offer: "The plan is a free tier of 5,000 emails a month; paid plans are not open.",
        saves: "Stop stitching a sending service, an inbound parser and a mailbox together.",
        now: "The site and the API at api.owlpost.to are live, and inbound mail reaches inboxes. Sending waits on Amazon SES production access; its first job is to replace Resend in the Factory Zero ventures."
      },
      desc: 'An email API for apps and AI agents. One key sends transactional and marketing email, receives inbound mail as JSON by webhook, and creates persistent inboxes for agents on owlpost.to or your own domain. Deliverability is part of the path: separate transactional and marketing streams, DKIM, SPF and DMARC records set up for you, a suppression list checked before every send, one-click unsubscribe. It is built in Rust on the Cratefield harness and Cloudflare’s email service. What exists today is the site, the API at api.owlpost.to and inbound mail into inboxes; sending waits on Amazon SES production access, and the SDKs are still being built. Its first job is to replace Resend inside Factory Zero.' },
    { id: 'FZ-014', name: 'Bloodrank', status: 'BUILDING', stage: 'VALIDATION', launched: null, category: 'COMMUNITY', autonomy: null, site: 'bloodrank.dev', logo: 'bloodrank-animated.svg', logoW: 120, logoH: 120,
      target: 3,
      uses: [
        { id: 'FZ-012', role: 'deploys', status: 'planned', note: 'Every venture site and Worker deployed from the Keep Shipping console.' },
        { id: 'google-fonts', role: 'fonts', status: 'live', note: 'The site\u2019s typefaces (Big Shoulders Display, Grenze Gotisch, Jolly Lodger, Cormorant Garamond, Geist, Geist Mono), loaded from Google.' },
        { id: 'cloudflare', role: 'hosting', status: 'live', note: 'The site.' }
      ],
      aims: {
        operate: 'The boards keep themselves: spend and shipped work are read from the tools and from GitHub and Stripe, scored, ranked and published every night without anyone entering numbers.',
        intelligence: 'Plain scoring code, log-scaled and published. A model only helps check that a claimed kill (a deploy, a launch, revenue) is real before it counts.',
        growth: 'Community-led: builders share their coffin cards. Growth is verified profiles on the public board, counted from the first one that is not ours.'
      },
      github: [['BLOODRANK', 'https://github.com/Bloodrank']],
      pitch: {
        problem: "Token leaderboards reward spending, not shipping, and most teams that ran them dropped them.",
        solution: "Bloodrank ranks people who run AI coding agents on what they spend and what they actually ship, side by side.",
        how: ["Blood: monthly AI spend, log-scaled so a big budget cannot buy the top", "Kills: deploys, launches and revenue, verified through GitHub and Stripe", "A Sunlight board for days fully offline"],
        offer: "The public board is planned to be free.",
        saves: "Stop guessing whether your agent spend is paying off.",
        now: "The site is live with sample data, labelled as such. The service, the board and `npx bloodrank` are not built."
      },
      desc: 'A leaderboard for AI vampires: builders who run several AI coding agents at once. Each profile gets a Vampire Score from 0 to 1000: 40% blood (monthly AI spend, log-scaled), 40% kills (deploys, launches, merged features and revenue, verified through GitHub and Stripe) and 20% night (parallel agents and late-night usage), with ranks from Thrall to Count. A Sunlight board counts days fully offline, because the essay that coined the term was about burnout. What exists today is the concept site with sample data; the service is not built.' },
    { id: 'FZ-015', name: 'ratecla.im', status: 'BUILDING', stage: 'VALIDATION', launched: null, category: 'TRAVEL', autonomy: null, site: 'ratecla.im', logo: 'rateclaim-animated.svg', logoW: 120, logoH: 120,
      target: 4,
      uses: [
        { id: 'FZ-004', role: 'framework', status: 'planned', note: 'The request backend is being written on the Cratefield harness; it is not deployed.' },
        { id: 'FZ-008', role: 'bug-reports', status: 'planned', note: 'Errors and bug reports become deduplicated GitHub issues, through the Cratefield error reporter.' },
        { id: 'FZ-012', role: 'deploys', status: 'planned', note: 'Every venture site and Worker deployed from the Keep Shipping console.' },
        { id: 'google-fonts', role: 'fonts', status: 'live', note: 'The site\u2019s typefaces (Plus Jakarta Sans, JetBrains Mono), loaded from Google.' },
        { id: 'cloudflare', role: 'hosting', status: 'live', note: 'The site.' }
      ],
      aims: {
        operate: 'A request runs itself: find the hotel’s reservations desk, ask, wait, read the reply, check it beats the lowest public price for the same stay, hold it for 24 hours, and bill the hotel after the stay. A person steps in only when a reply is unclear.',
        intelligence: 'An agent that says it is an AI in every message, drafts the email and reads the reply into a checked quote. It never invents a price: anything uncertain goes to a human. The workflow around it is a plain, durable state machine.',
        growth: 'Traveller-led, with hotels following: every quote is a reason for a hotel to list itself. Growth is accepted quotes at hotels that list with ratecla.im, counted from the first stay.'
      },
      github: [['RATECLAIM', 'https://github.com/Rateclaim']],
      pitch: {
        problem: "Hotels pay booking platforms 15 to 25 percent, and the lower rate they could give you directly is never published.",
        solution: "ratecla.im asks the hotel for that rate on your behalf and brings back a quote held for 24 hours.",
        how: ["Paste a hotel link, or use the browser extension on the page you are on", "An AI agent, which says it is one, asks the reservations desk directly", "You only see a quote that beats the lowest public price found for the same stay"],
        offer: "Free for travellers; hotels pay five percent after the stay.",
        saves: "Stop overpaying for a rate the hotel would have given you if you asked.",
        now: "The site is live and says requests are not open yet. The agent, the backend and the extension are being built."
      },
      desc: 'Hotel rates nobody publishes. A traveller pastes a hotel link; an AI agent that identifies itself contacts the hotel’s reservations desk directly, asks for availability and its best unpublished rate, checks it against the lowest public price for the same stay, and returns a quote held for 24 hours. Free for travellers; hotels pay five percent after the stay instead of the 15 to 25 percent booking platforms charge. Built on the Cratefield harness. What exists today is the site; requests, the agent and the extension are being built.' },
    { id: 'FZ-016', name: 'Sealbin', status: 'BUILDING', stage: 'VALIDATION', launched: null, category: 'SECURITY', autonomy: null, site: 'sealb.in', logo: 'sealbin-animated.svg', logoW: 120, logoH: 120,
      target: 4,
      uses: [
        { id: 'FZ-004', role: 'framework', status: 'live', note: 'The waitlist Worker at api.sealb.in runs on the Cratefield harness waitlist module.' },
        { id: 'FZ-013', role: 'email', status: 'planned', note: 'Sealed links delivered to agent inboxes, and waitlist mail. Double opt-in is off today, so no mail is sent yet.' },
        { id: 'FZ-008', role: 'bug-reports', status: 'planned', note: 'Errors and bug reports become deduplicated GitHub issues, through the Cratefield error reporter.' },
        { id: 'polar', role: 'payments', status: 'planned', note: 'Pro and Team subscriptions through Polar as Merchant of Record. Nothing is on sale yet.' },
        { id: 'FZ-009', role: 'security-screening', status: 'planned', note: 'Optional local promptdecode scan when a handoff is opened.' },
        { id: 'FZ-012', role: 'deploys', status: 'planned', note: 'Every venture site and Worker deployed from the Keep Shipping console.' },
        { id: 'cloudflare', role: 'hosting', status: 'live', note: 'The site and the waitlist Worker.' }
      ],
      aims: {
        operate: 'The service runs itself: sealing, one-time opens, expiry and deletion are plain state on Cloudflare with no human in the path. Signup, keys, billing and abuse handling are automated; a person steps in only for security reports and enterprise contracts.',
        intelligence: 'No model ever sees a handoff: everything is end-to-end encrypted on the sender’s machine. Agents are the customers, not the operators. The skill teaches them when to seal and how to read a handoff index-first.',
        growth: 'Developer-led: every sealed link one agent sends is a sealb.in link another agent opens. Growth is agents with a key, counted from the first seal, and paid plans when those agents run in CI or production.'
      },
      github: [['SEALBIN', 'https://github.com/sealbin']],
      pitch: {
        problem: "Agents hand each other context, files and secrets through prompts, chat threads and public pastes: leaky, permanent and too big for a prompt.",
        solution: "sealb.in seals the handoff on the sender’s machine and gives one link that the receiving agent opens once, then it is deleted.",
        how: ["/seal ./context.tar in Claude Code, Codex or any agent with a shell", "The key stays in the link’s #fragment; the server only holds ciphertext", "/open puts the files on disk, burns the link, and leaves no copies behind"],
        offer: "Open source under Apache-2.0; free to start, then priced per agent, not per seal.",
        saves: "Stop leaving tokens in chat history and pasting megabytes of context into prompts.",
        now: "The site is live and early access is a waitlist. The CLI, MCP server, skill and hosted service are being built."
      },
      desc: 'The sealed handoff between AI agents. The sending agent encrypts files, context or secrets on its own machine and uploads only ciphertext; the key travels in the link’s #fragment and never reaches the server. The receiving agent opens the link once, the contents land on disk, and the ciphertext is deleted. Burn-after-read by default, or a TTL, with an optional password. A CLI, an MCP server with seal and open tools, an agent skill and a REST API; open source under Apache-2.0 with a hosted service on Cloudflare. What exists today is the site and the early-access waitlist; the product is being built.' },
    { id: 'FZ-017', name: 'release.show', status: 'BUILDING', stage: 'VALIDATION', launched: null, category: 'VIDEO', autonomy: null, site: 'release.show', logo: 'releaseshow-animated.svg', logoW: 120, logoH: 120,
      target: 4,
      uses: [
        { id: 'FZ-004', role: 'framework', status: 'live', note: 'The waitlist Worker at api.release.show runs on the Cratefield harness waitlist module.' },
        { id: 'FZ-013', role: 'email', status: 'planned', note: 'Release digests and transactional notices. No mail is sent today.' },
        { id: 'FZ-008', role: 'bug-reports', status: 'planned', note: 'Errors and bug reports become deduplicated GitHub issues, through the Cratefield error reporter.' },
        { id: 'polar', role: 'payments', status: 'planned', note: 'Paid plans through Polar as Merchant of Record, via the Cratefield Payments port. Nothing is on sale yet.' },
        { id: 'FZ-009', role: 'security-screening', status: 'planned', note: 'Untrusted release text is screened before any model reads it.' },
        { id: 'FZ-012', role: 'deploys', status: 'planned', note: 'Every venture site and Worker deployed from the Keep Shipping console.' },
        { id: 'google-fonts', role: 'fonts', status: 'live', note: 'The site\u2019s typefaces (Geist, Geist Mono), loaded from Google.' },
        { id: 'cloudflare', role: 'hosting', status: 'live', note: 'The site and the waitlist Worker.' }
      ],
      aims: {
        operate: 'Release announcements are the automation target. Once a project connects GitHub, nobody has to write them: a merged pull request, a published release or a change to the site is picked up on its own, and the video, blog post, release widget, social posts and email digest follow from it.',
        intelligence: 'Models read what changed in the code and on the site and write the story of the release: the script, the captions, the blog post and the social copy, in the project’s own brand. An AI-avatar presenter can front the video. Detecting changes and rendering the output are plain code.',
        growth: 'Developer-led: every release video is ready to post to X, LinkedIn or YouTube, and every project gets a public channel page at release.show/<project>. An early-access waitlist first. Growth is projects publishing through it, counted from the first project that is not a pilot.'
      },
      github: [['RELEASE-SHOW', 'https://github.com/Release-Show']],
      pitch: {
        problem: "A release ships with a changelog entry, and turning it into a video, a post and an email for the people it was built for is a separate job that rarely gets done.",
        solution: "release.show turns GitHub releases, merged pull requests and website changes into 30 to 90 second videos: branded, captioned and ready to post. Every release deserves a premiere.",
        how: ["Each release becomes a short branded, captioned video", "The same release also becomes an AI-avatar presenter video, a blog post, an in-app release widget, social posts and an email digest", "Every project gets a public channel page at release.show/<project>"],
        offer: "Early access by waitlist.",
        saves: "Ship the release; the announcements come with it.",
        now: "Early access is a waitlist at release.show. The product has not launched."
      },
      desc: 'Release videos made from the work itself. release.show reads GitHub releases, merged pull requests and website changes and turns them into 30 to 90 second videos, branded, captioned and ready to post. Each release also becomes an AI-avatar presenter video, a blog post, an in-app release widget, social posts and an email digest, and every project gets a public channel page at release.show/<project>. What exists today is the site and its early-access waitlist; the product has not launched.' },
    { id: 'FZ-018', name: 'Living Brain', status: 'BUILDING', stage: 'VALIDATION', launched: null, category: 'DEVTOOLS', autonomy: null, site: 'livingbrain.wiki', logo: 'livingbrain-animated.svg', logoW: 120, logoH: 120,
      target: 4,
      uses: [
        { id: 'FZ-004', role: 'framework', status: 'planned', note: 'Built in Rust as a Cratefield venture; nothing is deployed yet, including the waitlist.' },
        { id: 'FZ-006', role: 'agents', status: 'planned', note: 'Colonizer colonies take the bigger jobs and open a pull request; nothing is dispatched yet.' },
        { id: 'FZ-013', role: 'email', status: 'planned', note: 'Waitlist confirmation, digests and the brain\u2019s own inbox.' },
        { id: 'FZ-008', role: 'support', status: 'planned', note: 'Customer-safe answers and tickets routed back in from SupportGenius.' },
        { id: 'FZ-008', role: 'bug-reports', status: 'planned', note: 'Errors and bug reports become deduplicated GitHub issues, through the Cratefield error reporter.' },
        { id: 'polar', role: 'payments', status: 'planned', note: 'Hosted plans through Polar as Merchant of Record. Nothing is on sale yet.' },
        { id: 'FZ-009', role: 'security-screening', status: 'planned', note: 'Every way in and out screened for hidden text with the promptdecode engine.' },
        { id: 'FZ-012', role: 'deploys', status: 'planned', note: 'Every venture site and Worker deployed from the Keep Shipping console.' },
        { id: 'cloudflare', role: 'hosting', status: 'live', note: 'The site.' }
      ],
      aims: {
        operate: 'The wiki is the thing that should keep itself: conversations become pages with their sources linked, and a nightly pass merges duplicates, surfaces contradictions and refreshes stale facts, with no one assigned to tend it. People ask questions and correct it; they do not write it.',
        intelligence: 'Models read team conversations and write the pages, citing the source message for every fact; the nightly passes reconcile what changed, and a learning layer models how each person works. Teams bring their own LLM, LiteLLM included. Reading is always done with the asker’s own access.',
        growth: 'Team-led, inside the tools people already use: coding agents over MCP, the terminal, and team chat (Slack, Discord). A free self-hosted tier for small teams first. Growth is workspaces with a wiki that is being kept, counted from the first one that is not ours.'
      },
      github: [['LIVINGBRAIN-WIKI/LIVINGBRAIN', 'https://github.com/Livingbrain-wiki/livingbrain'], ['LIVINGBRAIN-WIKI', 'https://github.com/Livingbrain-wiki']],
      pitch: {
        problem: "What a team knows is spread across chat threads, agent sessions and people’s heads, and the wiki meant to hold it is written once and then goes stale.",
        solution: "Living Brain is planned as a brain for your team that writes its own company wiki and keeps improving it: in your coding agent over MCP, in your terminal with one fast Rust binary, and in team chat (Slack, Discord).",
        how: ["Team conversations would become Markdown pages for people, projects, decisions and customers, every fact linked to its source message", "Nightly passes would merge duplicates, surface contradictions and refresh stale facts", "It would read only with the asker’s own access, in chat, over MCP and in the CLI alike"],
        offer: "Planned pricing per workspace, your own LLM on every plan: Community free (self-hosted, up to 5 people); Teams $5 a month self-hosted, or $9 a month hosted ($90 a year) with 25 people included; Crew $15 a month ($150 a year), hosted with $5 of DeepSeek credit a month and 25 people included. Hosted usage is metered like memory: writing $1 per million tokens, reading unlimited, harder questions from $0.001 each. Nothing is on sale.",
        saves: "Stop writing the wiki by hand and finding it out of date.",
        now: "In design. The plan is four epics and 38 issues in the open product repository; nothing is built, and early access is a waitlist at livingbrain.wiki."
      },
      desc: 'A company wiki that writes and maintains itself. The plan: Living Brain turns team conversations into Markdown pages for people, projects, decisions and customers, with every fact linked to the message it came from; nightly passes merge duplicates, surface contradictions and refresh stale facts, and a learning layer models how each person works. It would be reachable from coding agents through an MCP server and a Claude Code plugin, from the terminal through the `livingbrain` CLI, one Rust binary, and in team chat (Slack and Discord, with WhatsApp and Telegram later); an installable app (PWA) and a 3D graph view sit alongside. Bigger jobs would go to a Colonizer colony that returns a pull request, and email (digests and an inbox) would go through Owlpost. Bring your own model, LiteLLM included, and it reads only with the asker’s own access. Built in Rust as a Cratefield venture on Cloudflare Workers (D1, R2, KV, Durable Objects); open core, Apache-2.0 with an `ee/` directory under a commercial licence. What exists today is the site, its early-access waitlist and the plan as issues; nothing is built and nothing is sold.' },
    { id: 'FZ-019', name: 'Shoal', status: 'BUILDING', stage: 'VALIDATION', launched: null, category: 'SIMULATION', autonomy: null, site: 'shoal.ing', logo: 'shoal-animated.svg', logoW: 120, logoH: 120,
      target: 4,
      uses: [
        { id: 'google-fonts', role: 'fonts', status: 'live', note: 'The site\u2019s typefaces (Geist, Geist Mono, Instrument Serif), loaded from Google.' }
      ],
      aims: {
        operate: 'A rehearsal should need nobody to run it: paste a launch post or README, and seeding the crowd, simulating the thread and scoring the outcome happen on their own, on your own machine or server. The person decides what to change and when to launch.',
        intelligence: 'Jev, a deterministic engine, runs the simulated developers: who reads, who votes, who argues. A language model writes text only when an agent posts, from a local model or an API. The predicted thread, the top objections and the edits that change the outcome come out of that run.',
        growth: 'Developer-led: a single open-core binary, written in Rust and self-hostable, for people about to post to Hacker News, Reddit or X. An early-access waitlist first. Growth is launches rehearsed before they are posted, counted from the first one that is not ours.'
      },
      github: [['SHOAL-ING/WEBSITE', 'https://github.com/shoal-ing/website'], ['SHOAL-ING', 'https://github.com/shoal-ing']],
      pitch: {
        problem: "A launch post gets one shot: you find out what Hacker News, Reddit or X thinks of it only after it is live.",
        solution: "Shoal lets you rehearse the launch first. Paste a launch post or README, and thousands of simulated developers read it, vote and argue about it on a simulated Hacker News, Reddit or X.",
        how: ["Seed: paste a launch post or README", "Simulate: thousands of simulated developers read it, vote and argue on a simulated Hacker News, Reddit or X", "Score: the predicted thread, the top objections and the edits that change the outcome"],
        offer: "Early access by waitlist.",
        saves: "Find the objections before the launch thread does.",
        now: "Early access is a waitlist at shoal.ing. The CLI is in development and cannot be installed yet."
      },
      desc: 'Launch rehearsal. Paste a launch post or README, and thousands of simulated developers read it, vote and argue about it on a simulated Hacker News, Reddit or X; you get the predicted thread, the top objections and the edits that change the outcome. Seed, simulate, score. Planned as a single open-core binary written in Rust, self-hostable, with a local model or an API: Jev is the deterministic engine, and a language model writes text only when an agent posts. What exists today is the site and its early-access waitlist; the CLI is in development and cannot be installed yet.' },
    { id: 'FZ-020', name: 'Tokker', status: 'BUILDING', stage: 'VALIDATION', launched: null, category: 'PRICING', autonomy: null, site: 'tokker.dev', logo: 'tokker-animated.svg', logoW: 120, logoH: 120,
      target: 4,
      uses: [
        { id: 'FZ-004', role: 'framework', status: 'planned', note: 'The API and MCP server are planned as a Rust Worker on the Cratefield harness; nothing is deployed yet.' },
        { id: 'FZ-006', role: 'agents', status: 'planned', note: 'Scheduled Colonizer loops re-check every price source and open a pull request when a price moves. Not running yet.' },
        { id: 'FZ-013', role: 'email', status: 'planned', note: 'Price-drop alerts, the weekly change email and waitlist confirmation. No mail is sent today.' },
        { id: 'FZ-008', role: 'bug-reports', status: 'planned', note: 'Errors and bug reports become deduplicated GitHub issues, through the Cratefield error reporter.' },
        { id: 'polar', role: 'payments', status: 'planned', note: 'A paid API tier later, through Polar. The index is free and nothing is on sale.' },
        { id: 'FZ-012', role: 'deploys', status: 'planned', note: 'Every venture site and Worker deployed from the Keep Shipping console.' },
        { id: 'cloudflare', role: 'hosting', status: 'live', note: 'The site.' }
      ],
      aims: {
        operate: 'Keeping the prices true is the job that should run on its own: scheduled agents re-check every source, save the page as evidence, confirm a change with a second fetch and open a pull request, and small confirmed changes merge by themselves. A person reviews changes to limits, units or fair-use wording, and anything from a secondary source.',
        intelligence: 'Mostly plain code: an extractor per source, the diff, the currency conversion and the token math that turns published limits into $ per 1M. A language model is only the fallback extractor, its output checked against the saved page and always sent to review.',
        growth: 'Developer- and agent-led: a free JSON API and an MCP server, so coding agents can ask which provider is cheapest, and price-drop alerts by email. Free and open, with no affiliate links at launch. Growth is people and agents using the index, counted from the first API call that is not ours.'
      },
      github: [['TOKKER-DEV/TOKKER', 'https://github.com/Tokker-dev/tokker'], ['TOKKER-DEV', 'https://github.com/Tokker-dev']],
      pitch: {
        problem: "AI token prices are hard to compare: about 60 API providers price them differently, and subscriptions hide their limits in 5-hour windows and weekly caps.",
        solution: "Tokker is a free, open price index for AI tokens. It puts every model API and every AI subscription on one scale, US dollars per 1M tokens, so you can see the cheapest way to get the tokens you need.",
        how: ["Compares API prices per 1M tokens across about 60 providers, each number linked to its source and the date it was checked", "Turns subscription limits (5-hour windows, weekly caps) into real tokens and $ per 1M at full use", "Scheduled agents are planned to re-check every source and update a price when it moves"],
        offer: "Free and open: the data is in a public repository, and there are no affiliate links at launch.",
        saves: "Stop working out by hand whether a plan or an API is cheaper for the way you use AI.",
        now: "The homepage is live at tokker.dev with an early index (prices as of 5 Oct 2026). The API, MCP server, scheduled re-checks and price-drop alerts are planned and do not work yet."
      },
      desc: 'An open, sourced price index for AI tokens and subscriptions. Tokker lists what AI model APIs cost in US dollars per 1M tokens across about 60 providers, and turns subscription limits (5-hour windows, weekly caps, credit pools) into real tokens and an estimated $ per 1M at full use, so an API and a $200 plan sit on one scale. Every number carries its source and the date it was checked; what a provider does not publish is marked unknown. Scheduled agents on Colonizer are planned to keep the prices fresh, and a free JSON API, an MCP server and price-drop alerts by email through Owlpost are planned on a Rust Worker on the Cratefield harness. Free and open, with no affiliate links at launch; the code is Apache-2.0 and the data CC BY 4.0 (proposed). What exists today is the homepage and an early index (62 providers and 103 plans, prices as of 5 Oct 2026); the API, MCP server and alerts do not work yet.' },
    { id: 'FZ-021', name: 'Ledgers', status: 'BUILDING', stage: 'VALIDATION', launched: null, category: 'ACCOUNTING', autonomy: null, site: 'ledgers.sh', logo: 'ledgers-animated.svg', logoW: 120, logoH: 120,
      target: 4,
      uses: [
        { id: 'FZ-004', role: 'framework', status: 'planned', note: 'Every module (ledger, invoice, bills, matching, bank, tax, documents, reports) is planned as a Rust crate on the Cratefield harness. Nothing is published yet.' },
        { id: 'google-fonts', role: 'fonts', status: 'live', note: 'The site’s typefaces (Source Sans 3, Source Code Pro), loaded from Google.' },
        { id: 'cloudflare', role: 'hosting', status: 'live', note: 'The site.' }
      ],
      aims: {
        operate: 'The bookkeeping is the work meant to run without people: agents read incoming bills, match them to orders, receipts and payments, and draft and post entries within the limits each agent key is given. People stay in the loop by design: anything above a limit stops for approval, and paying money out, closing a period and filing tax always need a person.',
        intelligence: 'A language model reads documents and proposes matches, each field with a confidence score and a link to its place on the source; the ledger itself is plain double-entry code. Every action is audited, entries are reversed rather than edited, and a dry run shows each debit and credit before anything posts.',
        growth: 'Open source first: free for a single user with their own AI model key, so developers and their agents can start from the CLI and MCP tools. Growth is companies moving to managed plans, which include the agents, counted from the first document an agent books that is not ours.'
      },
      github: [['LEDGERS-SH', 'https://github.com/Ledgers-sh']],
      pitch: {
        problem: "Bookkeeping is mostly reading invoices and matching them to orders and payments, and agents could do that work, but nobody wants an AI posting whatever it likes to the books.",
        solution: "Ledgers is open-source accounting built for AI agents. Agents read invoices, match payments and draft entries; policy decides what they may post; you approve the rest.",
        how: ["Every agent key gets a tier (read, draft, post within limits) and amount limits per currency; paying out, closing periods and filing tax always need a person", "A dry run shows every debit and credit before anything posts, and every action is audited and reversible", "Agents use the CLI and MCP tools, people review in a browser and phone app, and all of them run the same commands"],
        offer: "Planned to be free and open source (MIT) for a single user with your own AI model key; managed plans would include the agents.",
        saves: "Stop typing invoices into your books and only look at the few entries an agent isn’t sure about.",
        now: "The homepage is live at ledgers.sh. The crates, CLI, MCP server, app, waitlist and managed plans are planned and do not exist yet."
      },
      desc: 'Open-source, double-entry accounting built for AI agents. Agents extract vendor bills, propose invoice, order, receipt and payment matches with confidence scores, and draft journal entries; each agent key has a tier (read, draft, post within limits) and per-currency amount limits, and paying money out, closing a period and filing tax always need a person. Every action is audited and reversible, and a dry run shows each debit and credit before anything posts. Agents work through a CLI and MCP tools, people supervise in a browser and phone app (PWA, offline, push approvals), and an HTTP API shares the same commands. Multi-currency and right-to-left from the start; one company, internal units or a group with consolidation. Eight modules (ledger, invoice, bills, matching, bank, tax, documents, reports) are planned as Rust crates on the Cratefield harness, MIT-licensed, self-hosted or managed. What exists today is the homepage; nothing is released.' },
    { id: 'FZ-022', name: "Ghostwritin'", status: 'BUILDING', stage: 'VALIDATION', launched: null, category: 'WRITING', autonomy: null, site: 'ghostwrit.in', logo: 'ghostwritin-animated.svg', logoW: 120, logoH: 120,
      target: 4,
      uses: [
        { id: 'FZ-004', role: 'framework', status: 'planned', note: 'The open-source app (engine, API Worker, CLI, MCP server) is being built on the Cratefield harness, with the meaning lock and diff offered upstream as generic Cratefield modules.' },
        { id: 'google-fonts', role: 'fonts', status: 'live', note: 'The site’s typefaces (Newsreader, JetBrains Mono), loaded from Google.' },
        { id: 'cloudflare', role: 'hosting', status: 'live', note: 'The site.' }
      ],
      aims: {
        operate: 'The rewriting is the work meant to run on its own: drafts come in through the web app, API, CLI or MCP server, the engine rewrites them in the chosen voice, checks the result against the original and returns the diff and scores. People handle what a machine should not decide: support, abuse reports and the use policy.',
        intelligence: 'A language model does the rewrite; plain code does the checking. The meaning lock compares names, numbers, quotes and code against the original, and a rewrite that moved one is rejected. The human score is a detector estimate shown as a guide, never a promise.',
        growth: 'Open source first: the engine, CLI and MCP server are planned under MIT, so writers and developers can self-host with their own model key. Growth is people moving to hosted plans for My voice and the score, counted from the first rewrite that is not ours.'
      },
      github: [['GHOSTWRITIN', 'https://github.com/Ghostwritin']],
      pitch: {
        problem: "A tool helped with your first draft, and now it doesn’t sound like you, and your own writing sometimes gets misread as AI-written.",
        solution: "Ghostwritin’ rewrites AI-assisted drafts into your own natural voice, then checks that the meaning stayed exactly the same.",
        how: ["Choose a voice (Casual, Professional, Academic, or My voice, learned from three to five of your samples) and a strength", "Names, numbers, quotes and code stay locked, and every rewrite is checked against your original", "A diff shows every change, with a human score before and after; the web app, API, CLI and MCP server share one engine"],
        offer: "Planned to be open source (MIT): self-host with your own model key, or use the hosted version, with a free tier of 500 words a day.",
        saves: "Stop rewriting a tool’s draft line by line until it sounds like you again.",
        now: "The homepage is live. The web app, API, CLI, MCP server, waitlist and hosted plans are planned and do not exist yet."
      },
      desc: 'Rewrites AI-assisted drafts into the writer’s own voice and checks that the meaning stayed the same. A draft of up to 10,000 words is pasted in and the passages a detector would flag are marked; the writer picks a voice (Casual, Professional, Academic, or My voice built from three to five of their own samples) and a strength from light polish to a full rewrite. A meaning lock keeps names, numbers, quotes and code exactly as written and checks each rewrite against the original; a diff shows every change, with a human score (a detector estimate, a guide not a guarantee) before and after. Web app, REST API, CLI and MCP server are planned on one MIT-licensed engine, self-hosted or hosted. Intended for writers whose own work gets misread and for drafts a tool helped with; users are told to follow their school’s, client’s or publisher’s rules. What exists today is the homepage; nothing is released.' }
  ],
  // Third parties named in a venture's `uses`. Sister ventures are not listed
  // here: they resolve to their own record (name and site) by id.
  services: {
    cloudflare: { name: 'Cloudflare', url: 'https://www.cloudflare.com' },
    'google-fonts': { name: 'Google Fonts', url: 'https://fonts.google.com' },
    'aws-ses': { name: 'Amazon SES', url: 'https://aws.amazon.com/ses/' },
    resend: { name: 'Resend', url: 'https://resend.com' },
    polar: { name: 'Polar', url: 'https://polar.sh' },
    stripe: { name: 'Stripe', url: 'https://stripe.com' }
  },
  // What each `uses` role is called, as a label and as the phrase a footer uses.
  roles: {
    framework: { label: 'FRAMEWORK', phrase: 'Built with' },
    email: { label: 'EMAIL', phrase: 'Email by' },
    support: { label: 'SUPPORT', phrase: 'Support by' },
    'bug-reports': { label: 'BUG REPORTS', phrase: 'Bug reports to' },
    payments: { label: 'PAYMENTS', phrase: 'Payments by' },
    'security-screening': { label: 'SECURITY SCREENING', phrase: 'Screened by' },
    'screening-engine': { label: 'SECURITY SCREENING', phrase: 'Screens with the method of' },
    'inbound-email': { label: 'INBOUND EMAIL', phrase: 'Inbound mail by' },
    'secrets-handoff': { label: 'SECRETS HANDOFF', phrase: 'Handoffs sealed by' },
    agents: { label: 'AGENTS', phrase: 'Agents run on' },
    deploys: { label: 'DEPLOYS', phrase: 'Deploys by' },
    fonts: { label: 'FONTS', phrase: 'Typefaces from' },
    hosting: { label: 'HOSTING', phrase: 'Hosted on' }
  },
  layers: [
    { name: 'DISCOVER', agents: [['RESEARCH', 'Reads markets and competitors'], ['STRATEGY', 'Scores opportunities against the thesis'], ['ANALYTICS', 'Keeps the usage models current']] },
    { name: 'BUILD', agents: [['PRODUCT', 'Turns decisions into specifications'], ['ENGINEERING', 'Writes the code and ships it'], ['DESIGN', 'Drafts interface variants'], ['QA', 'Writes and runs the tests']] },
    { name: 'OPERATE', agents: [['INFRASTRUCTURE', 'Runs deployments and capacity'], ['SECURITY', 'Audits code and access policies'], ['SUPPORT', 'Answers support from the docs'], ['FINANCE', 'Reconciles payments and the ledger']] },
    { name: 'DISTRIBUTE', agents: [['GROWTH', 'Designs growth experiments'], ['CONTENT', 'Writes release notes and posts'], ['SALES', 'Drafts outreach for review']] },
    { name: 'LEARN', agents: [['LEGAL', 'Drafts terms for human review'], ['KNOWLEDGE', 'Turns what worked into playbooks'], ['OPTIMIZATION', 'Looks for what keeps users']] }
  ],
};

// Editable presentation values. In the Claude Design source these were `data-props`
// on the component; here they are plain overrides you can edit without touching logic.
window.FZ_CONFIG = {
  headline: 'We launch ventures at\u00a0scale.', // also rendered statically in index.html
  factoryStatus: 'ONLINE'    // ONLINE | MAINTENANCE | INITIALIZING
};
