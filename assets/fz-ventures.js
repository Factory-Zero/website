/* Ventures registry.
   The rows and the default detail panel are already in the HTML, so the page is
   fully indexable with JavaScript off. This only adds selection behaviour, and
   it reads each record straight off its row's data-* attributes so there is no
   second copy of the venture data at runtime. */

(function () {
  'use strict';

  var rows = Array.prototype.slice.call(document.querySelectorAll('.record'));
  if (!rows.length) return;

  // same order as LEVELS in fz-app.js and tools/sync-ventures.js
  var LEVELS = ['HUMAN-OPERATED', 'AI-ASSISTED', 'AGENT WORKFLOWS', 'AGENT-OPERATED', 'SELF-OPTIMIZING', 'AUTONOMOUS COMPANY'];

  var el = {
    id:    document.getElementById('d-id'),
    logo:  document.getElementById('d-logo'),
    name:  document.getElementById('d-name'),
    desc:  document.getElementById('d-desc'),
    link:  document.getElementById('d-link'),
    status: document.getElementById('d-status'),
    target: document.getElementById('d-target'),
    meter: document.getElementById('d-meter'),
    aimOperate: document.getElementById('d-aim-operate'),
    aimIntelligence: document.getElementById('d-aim-intelligence'),
    aimGrowth: document.getElementById('d-aim-growth'),
    github: document.getElementById('d-github'),
    cat:   document.getElementById('d-cat'),
    launched: document.getElementById('d-launched'),
    stage: document.getElementById('d-stage'),
    record: document.getElementById('d-record')
  };

  function select(row) {
    rows.forEach(function (r) { r.setAttribute('aria-pressed', String(r === row)); });

    var d = row.dataset;
    el.id.textContent = d.id;
    el.record.textContent = 'RECORD / ' + d.id;
    el.name.textContent = d.name;
    el.desc.textContent = d.desc;
    el.status.textContent = d.status;
    el.status.style.color = d.statusColor;
    el.cat.textContent = d.category;
    el.launched.textContent = d.launched;
    el.stage.textContent = d.stage;

    // the autonomy target is a design aim, 0-5, never a measured share.
    // A venture without one shows an em dash, not a zero.
    if (d.target !== '') {
      var lvl = Number(d.target);
      el.target.textContent = 'LEVEL ' + lvl + ' · ' + LEVELS[lvl];
      el.meter.hidden = false;
      el.meter.firstElementChild.style.width = (lvl * 20) + '%';
    } else {
      el.target.textContent = '—';
      el.meter.hidden = true;
    }
    el.aimOperate.textContent = d.aimOperate || '—';
    el.aimIntelligence.textContent = d.aimIntelligence || '—';
    el.aimGrowth.textContent = d.aimGrowth || '—';

    // public repositories only; the JSON in the attribute is written by sync-ventures.js
    var repos = [];
    try { repos = JSON.parse(d.github || '[]'); } catch (e) { repos = []; }
    el.github.textContent = '';
    if (repos.length) {
      repos.forEach(function (r) {
        var a = document.createElement('a');
        a.href = r[1];
        a.rel = 'noopener';
        a.textContent = r[0] + ' →';
        el.github.appendChild(a);
      });
    } else {
      var s = document.createElement('span');
      s.textContent = 'NO PUBLIC REPOSITORY';
      el.github.appendChild(s);
    }

    if (d.site && d.site !== '—') {
      el.link.textContent = d.site.toUpperCase() + ' →';
      el.link.href = 'https://' + d.site;
      el.link.removeAttribute('aria-disabled');
    } else {
      el.link.textContent = 'NO PUBLIC SURFACE YET';
      el.link.removeAttribute('href');
      el.link.setAttribute('aria-disabled', 'true');
    }

    // swap the brand mark in only for ventures that have one
    if (el.logo) {
      if (d.logo) {
        el.logo.src = '/assets/' + d.logo;
        el.logo.alt = d.name + ' logo';
        // keep the box the right shape per logo, so swapping records does not jump
        if (d.logoW && d.logoH) {
          el.logo.width = 120;
          el.logo.height = Math.round(120 * Number(d.logoH) / Number(d.logoW));
        }
        el.logo.hidden = false;
      } else {
        el.logo.hidden = true;
        el.logo.removeAttribute('src');
      }
    }
  }

  rows.forEach(function (row) {
    row.addEventListener('click', function () { select(row); });
    row.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); select(row); }
    });
  });
})();
