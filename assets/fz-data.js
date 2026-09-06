// Factory Zero — central data model. Add real ventures here.
window.FZ_DATA = {
  ventures: [
    // Only real records belong here. `autonomy: null` renders as an em dash
    // rather than an invented percentage; `stage: '—'` keeps a venture out of
    // the home-page pipeline until it genuinely has one.
    { id: 'FZ-001', name: 'Kontinuum', status: 'BUILDING', stage: 'PROTOTYPE', launched: '—', category: 'MUSIC', autonomy: null, site: 'kontinuum.audio', logo: 'kontinuum-animated.svg', logoW: 360, logoH: 264,
      desc: 'An AI composer performing on a deterministic real-time engine. Music written and performed continuously, personalised to the listener, and playable offline. Not a streaming app and not a DAW: a living instrument.' },
    { id: 'FZ-002', name: 'Undercover Rockstars', status: 'BUILDING', stage: 'LAUNCH', launched: '—', category: 'APPAREL', autonomy: null, site: 'undercoverrockstars.com', logo: 'undercover-rockstars-animated.svg', logoW: 100, logoH: 100,
      desc: 'A clothing house built on one idea: every piece comes as a matched pair. One pattern is cut twice, once for the day and once for the night, so the fit never changes when the room does. Drop 01 is eight pairs, sixteen garments, cut in Bali.' },
    { id: 'FZ-003', name: 'Yoginini', status: 'BUILDING', stage: 'VALIDATION', launched: '—', category: 'WELLNESS', autonomy: null, site: 'yoginini.us', logo: 'yoginini-animated.svg', logoW: 120, logoH: 120,
      desc: 'A yoga teacher that can see you. A pose model running on the phone tracks 33 body landmarks and speaks one calm correction at a time, and no video ever leaves the device. Real teachers are bookable by the hour alongside it. The site and the waitlist are open; the app is not built.' },
    { id: 'FZ-004', name: 'Cratefield', status: 'BUILDING', stage: 'VALIDATION', launched: '\u2014', category: 'INFRASTRUCTURE', autonomy: null, site: 'cratefield.com', logo: 'cratefield-animated.svg', logoW: 120, logoH: 120,
      desc: 'A backend you compile rather than a platform you configure. The Rust harness underneath is open source, MIT and running today; the managed control plane, which would provision the worker, the database and the secrets inside your own Cloudflare account and then operate them, is designed and not yet written. The site and the early-access list are open.' }
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
