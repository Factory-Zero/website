// Factory Zero — central data model. Add real ventures here.
window.FZ_DATA = {
  ventures: [
    // First real venture. autonomy is null until a figure is set; the UI renders "—".
    { id: 'FZ-001', name: 'Kontinuum', status: 'BUILDING', stage: 'PROTOTYPE', launched: '—', category: 'MUSIC', autonomy: null, site: '—', logo: 'kontinuum-animated.svg',
      desc: 'An AI composer performing on a deterministic real-time engine. Music written and performed continuously, personalised to the listener, and playable offline. Not a streaming app and not a DAW: a living instrument.' },
    { id: 'FZ-002', name: 'Venture 002', status: 'SCALING', stage: 'SCALE', launched: '2025', category: 'COMMERCE', autonomy: 71, site: 'fz-002.ventures', desc: 'Inventory forecasting and reordering operated by agents for independent retailers.' },
    { id: 'FZ-003', name: 'Venture 003', status: 'RESEARCHING', stage: 'VALIDATION', launched: '—', category: 'HEALTH', autonomy: 22, site: '—', desc: 'Signal under validation. Research swarm active.' },
    { id: 'FZ-004', name: 'Venture 004', status: 'LIVE', stage: 'LAUNCH', launched: '2026', category: 'MUSIC', autonomy: 84, site: 'fz-004.ventures', desc: 'Catalog metadata, rights and distribution operations for independent labels.' },
    { id: 'FZ-005', name: 'Venture 005', status: 'BUILDING', stage: 'PROTOTYPE', launched: '—', category: 'FINANCE', autonomy: 41, site: '—', desc: 'Prototype build in progress. Specification generated, infrastructure provisioned.' },
    { id: 'FZ-006', name: 'Venture 006', status: 'RESEARCHING', stage: 'SIGNAL', launched: '—', category: 'LOGISTICS', autonomy: 8, site: '—', desc: 'Market signal identified. Opportunity scoring in progress.' },
    { id: 'FZ-007', name: 'Venture 007', status: 'ARCHIVED', stage: 'ARCHIVED', launched: '2025', category: 'MEDIA', autonomy: 0, site: '—', desc: 'Archived after validation. Learnings absorbed into the factory knowledge layer.' }
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
  activeVentures: 6,         // omit to derive from the venture list
  agentNetwork: 1284
};
