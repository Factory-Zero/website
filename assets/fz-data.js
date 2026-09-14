// Factory Zero — central data model. Add real ventures here.
window.FZ_DATA = {
  ventures: [
    // Only real records belong here. `autonomy: null` renders as an em dash
    // rather than an invented percentage; `stage: '—'` keeps a venture out of
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
    { id: 'FZ-001', name: 'Kontinuum', status: 'BUILDING', stage: 'PROTOTYPE', launched: '—', category: 'MUSIC', autonomy: null, site: 'kontinuum.audio', logo: 'kontinuum-animated.svg', logoW: 360, logoH: 264,
      target: 4,
      aims: {
        operate: 'Composition, performance and release are the engine\u2019s job, not a studio\u2019s. The aim is a catalogue that writes and renews itself while people set the taste boundaries and sign off on what ships.',
        intelligence: 'A deterministic real-time engine that plays and a critic that listens: instruments and scenes as code, a scoring model that judges each take against a reference, and distillation from what listeners keep. No cloud model in the playback loop.',
        growth: 'Listener-led. One listener, one continuous stream; growth is listeners who come back the next day, counted from the first installed build and not before.'
      },
      github: [['KONTINUUM-AI/KONTINUUM-ENGINE', 'https://github.com/Kontinuum-ai/kontinuum-engine'], ['KONTINUUM-AI', 'https://github.com/Kontinuum-ai']],
      desc: 'An AI composer performing on a deterministic real-time engine. Music written and performed continuously, personalised to the listener, and playable offline. Not a streaming app and not a DAW: a living instrument.' },
    { id: 'FZ-002', name: 'Undercover Rockstars', status: 'BUILDING', stage: 'LAUNCH', launched: '—', category: 'APPAREL', autonomy: null, site: 'undercoverrockstars.com', logo: 'undercover-rockstars-animated.svg', logoW: 100, logoH: 100,
      target: 3,
      aims: {
        operate: 'The garments are cut by people in Bali and that stays. Everything around them is the target for agents: stock, orders, fulfilment, support, content and the brief for the next drop.',
        intelligence: 'Operational rather than creative: demand and stock forecasting per pair and size, fit guidance from a body measurement taken in the browser, and language models for support and copy. Design direction stays human.',
        growth: 'Drop by drop. Growth is pairs sold per drop and buyers who return for the next one, counted from the first drop that is open for sale.'
      },
      github: [['UNDERCOVER-ROCKSTARS/WEBSITE', 'https://github.com/Undercover-Rockstars/website'], ['UNDERCOVER-ROCKSTARS', 'https://github.com/Undercover-Rockstars']],
      desc: 'A clothing house built on one idea: every piece comes as a matched pair. One pattern is cut twice, once for the day and once for the night, so the fit never changes when the room does. Drop 01 is eight pairs, sixteen garments, cut in Bali.' },
    { id: 'FZ-003', name: 'Yoginini', status: 'BUILDING', stage: 'VALIDATION', launched: '—', category: 'WELLNESS', autonomy: null, site: 'yoginini.us', logo: 'yoginini-animated.svg', logoW: 120, logoH: 120,
      target: 3,
      aims: {
        operate: 'The teacher on the phone runs itself; the real teachers are people and stay that way. Agents run bookings, payouts, support, the coach cohort and the teaching content around them.',
        intelligence: 'Perception on the device: a pose model tracking 33 landmarks, angle and score models that never see video, and a voice that chooses one correction at a time. The backend\u2019s intelligence is scheduling and matching, not vision.',
        growth: 'Practice-led. Growth is people who practise every week and the hours booked with real teachers, counted from the first app in hands.'
      },
      github: [['YOGININI/WEBSITE', 'https://github.com/Yoginini/website'], ['YOGININI', 'https://github.com/Yoginini']],
      desc: 'A yoga teacher that can see you. A pose model running on the phone tracks 33 body landmarks and speaks one calm correction at a time, and no video ever leaves the device. Real teachers are bookable by the hour alongside it. The site and the waitlist are open; the app is not built.' },
    { id: 'FZ-004', name: 'Cratefield', status: 'BUILDING', stage: 'VALIDATION', launched: '\u2014', category: 'INFRASTRUCTURE', autonomy: null, site: 'cratefield.com', logo: 'cratefield-animated.svg', logoW: 120, logoH: 120,
      target: 4,
      aims: {
        operate: 'Provisioning, upgrades, backups, incident response and support are the product, so they are the automation target. The aim is a control plane that runs each customer\u2019s backend without a person on call.',
        intelligence: 'Systems intelligence: compile-time composition, migration and drift checks, anomaly detection on worker and database telemetry, and an agent that reads a failing deploy and proposes the fix. Not a chat model on top of a dashboard.',
        growth: 'Developer-led. Growth is backends running in customers\u2019 own Cloudflare accounts and harness crates in use, counted once the control plane exists.'
      },
      github: [['CRATEFIELD/HARNESS', 'https://github.com/Cratefield/harness'], ['CRATEFIELD', 'https://github.com/Cratefield']],
      desc: 'A backend you compile rather than a platform you configure. The Rust harness underneath is open source, MIT and running today; the managed control plane, which would provision the worker, the database and the secrets inside your own Cloudflare account and then operate them, is designed and not yet written. The site and the early-access list are open.' },
    { id: 'FZ-005', name: 'VibeCaddie', status: 'BUILDING', stage: 'VALIDATION', launched: '—', category: 'DEVTOOLS', autonomy: null, site: 'vibecaddie.com', logo: 'vibecaddie-animated.svg', logoW: 120, logoH: 120,
      target: 5,
      aims: {
        operate: 'The product is an agent and the company should be too: install, audit, findings, credits, support and skill updates all run without a person in the loop. People review the review skills and set the prices.',
        intelligence: 'Reasoning over code: repository classification, skill selection, severity ranking and fix suggestions, with a verification pass so a finding is confirmed before it is shown. Judged on precision, not volume.',
        growth: 'Usage-led. Growth is repositories audited and credits bought again, counted from the first run of the GitHub app.'
      },
      github: [['VIBECADDIE/WEBSITE', 'https://github.com/VibeCaddie/website'], ['VIBECADDIE', 'https://github.com/VibeCaddie']],
      desc: 'A code review agent for the code you did not fully write. It reads a repository, works out what kind of codebase it is, loads only the review skills that apply to it, and returns findings ranked by severity with the file, the line, why it matters and a suggested fix. Prepaid credits rather than a subscription, so the price of a run is known before it starts. The site and the early-access list are open; the GitHub app is not built.' },
    { id: 'FZ-006', name: 'Colonizer', status: 'BUILDING', stage: 'PROTOTYPE', launched: '—', category: 'DEVTOOLS', autonomy: null, site: 'colonizer.dev', logo: 'colonizer-animated.svg', logoW: 120, logoH: 120,
      target: null,
      github: [['COLONIZER-DEV/COLONIZER', 'https://github.com/Colonizer-dev/colonizer'], ['COLONIZER-DEV', 'https://github.com/Colonizer-dev']],
      desc: 'A local-first app that turns GitHub issues into pull requests. Each task gets a coding agent, Claude Code today, inside its own disposable KVM microVM with a fresh git worktree, linked to the host over a private mesh that never touches your own tailnet. The web UI shows the chat, a terminal in the VM and the agent\u2019s questions as multiple-choice cards. The host, not the VM, commits, pushes and opens the pull request, so the GitHub and Claude tokens never enter it. The Rust host, the in-VM daemon and the React UI are open source under MIT and run locally on Linux x86_64 with KVM. There is no hosted service; more coding agents, a model router, remote outposts and GitLab, Linear and Jira sources are planned, not built.' }
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
