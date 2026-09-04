// Factory Zero — central data model. Add real ventures here.
window.FZ_DATA = {
  ventures: [
    // Only real records belong here. `autonomy: null` renders as an em dash
    // rather than an invented percentage; `stage: '—'` keeps a venture out of
    // the home-page pipeline until it genuinely has one.
    { id: 'FZ-001', name: 'Kontinuum', status: 'BUILDING', stage: 'PROTOTYPE', launched: '—', category: 'MUSIC', autonomy: null, site: '—', logo: 'kontinuum-animated.svg',
      desc: 'An AI composer performing on a deterministic real-time engine. Music written and performed continuously, personalised to the listener, and playable offline. Not a streaming app and not a DAW: a living instrument.' },
    { id: 'FZ-002', name: 'Unannounced', status: 'UNANNOUNCED', stage: '—', launched: '—', category: 'APPAREL', autonomy: null, site: '—',
      desc: 'A clothing venture. Not yet announced.' },
    { id: 'FZ-003', name: 'Unannounced', status: 'UNANNOUNCED', stage: '—', launched: '—', category: '—', autonomy: null, site: '—',
      desc: 'Not yet announced.' }
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
