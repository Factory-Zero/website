/* Ventures registry.
   The rows and the default detail panel are already in the HTML, so the page is
   fully indexable with JavaScript off. This only adds selection behaviour, and
   it reads each record straight off its row's data-* attributes so there is no
   second copy of the venture data at runtime. */

(function () {
  'use strict';

  var rows = Array.prototype.slice.call(document.querySelectorAll('.record'));
  if (!rows.length) return;

  var el = {
    id:    document.getElementById('d-id'),
    logo:  document.getElementById('d-logo'),
    name:  document.getElementById('d-name'),
    desc:  document.getElementById('d-desc'),
    link:  document.getElementById('d-link'),
    status: document.getElementById('d-status'),
    aut:   document.getElementById('d-aut'),
    meter: document.getElementById('d-meter'),
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

    // autonomy is optional: a venture without a figure shows an em dash, not a zero
    if (d.autonomy) {
      el.aut.textContent = d.autonomy + '%';
      el.meter.hidden = false;
      el.meter.firstElementChild.style.width = d.autonomy + '%';
    } else {
      el.aut.textContent = '—';
      el.meter.hidden = true;
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
