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
    problem: document.getElementById('d-problem'),
    solution: document.getElementById('d-solution'),
    how:   document.getElementById('d-how'),
    offer: document.getElementById('d-offer'),
    saves: document.getElementById('d-saves'),
    now:   document.getElementById('d-now'),
    link:  document.getElementById('d-link'),
    status: document.getElementById('d-status'),
    target: document.getElementById('d-target'),
    meter: document.getElementById('d-meter'),
    aimOperate: document.getElementById('d-aim-operate'),
    aimIntelligence: document.getElementById('d-aim-intelligence'),
    aimGrowth: document.getElementById('d-aim-growth'),
    github: document.getElementById('d-github'),
    activity: document.getElementById('d-activity'),
    issues: document.getElementById('d-issues'),
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
    // the plain-language pitch: problem, what it does, how, the offer, the time it saves
    if (el.problem) {
      el.problem.textContent = d.problem || '';
      el.solution.textContent = d.solution || '';
      el.offer.textContent = d.offer || '';
      el.saves.textContent = d.saves || '';
      el.now.textContent = d.now || '';
      var how = [];
      try { how = JSON.parse(d.how || '[]'); } catch (e) { how = []; }
      el.how.textContent = '';
      how.forEach(function (h) {
        var li = document.createElement('li');
        li.textContent = h;
        el.how.appendChild(li);
      });
    }
    el.status.textContent = d.status;
    el.status.style.color = d.statusColor;
    el.cat.textContent = d.category;
    el.launched.textContent = d.launched;
    el.stage.textContent = d.stage;

    // the autonomy target is a design aim, 0-5, never a measured share.
    // A venture without one says so in words, rather than showing a zero it has not earned.
    if (d.target !== '') {
      var lvl = Number(d.target);
      el.target.textContent = 'LEVEL ' + lvl + ' · ' + LEVELS[lvl];
      el.meter.hidden = false;
      el.meter.firstElementChild.style.width = (lvl * 20) + '%';
    } else {
      el.target.textContent = 'NOT SET';
      el.meter.hidden = true;
    }
    el.aimOperate.textContent = d.aimOperate || 'NOT SET';
    el.aimIntelligence.textContent = d.aimIntelligence || 'NOT SET';
    el.aimGrowth.textContent = d.aimGrowth || 'NOT SET';

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

    if (el.activity) activity(d.id, repos.length > 0);

    if (d.site) {
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

  /* ---------- GitHub activity ----------
     Weekly commits across the venture's public repositories, from
     /api/activity (functions/api/activity.js), which Cloudflare caches for a
     day. One series, so no legend: the row's title names it. */

  var SVG = 'http://www.w3.org/2000/svg';
  var MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  var fetched = {};   // venture id -> promise of the response body, once per page view
  var shownId = null;

  function weekLabel(iso) {
    var p = iso.split('-');
    return 'WEEK OF ' + Number(p[2]) + ' ' + MONTHS[Number(p[1]) - 1] + ' ' + p[0];
  }

  function note(host, text) {
    host.textContent = '';
    var s = document.createElement('span');
    s.textContent = text;
    host.appendChild(s);
  }

  function svg(tag, attrs) {
    var n = document.createElementNS(SVG, tag);
    for (var k in attrs) n.setAttribute(k, attrs[k]);
    return n;
  }

  function span(cls, text) {
    var s = document.createElement('span');
    if (cls) s.className = cls;
    s.textContent = text;
    return s;
  }

  function both(text) {
    note(el.activity, text);
    if (el.issues) note(el.issues, text);
  }

  function activity(id, hasRepos) {
    shownId = id;
    if (!hasRepos) { both('NO PUBLIC REPOSITORY'); return; }
    both('LOADING');
    if (!fetched[id]) {
      fetched[id] = fetch('/api/activity?id=' + encodeURIComponent(id))
        .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); });
    }
    fetched[id].then(function (data) {
      if (shownId !== id) return;   // the reader may have moved on to another record
      // Most ventures are months old, not a year: drop the empty weeks before the
      // first commit or issue so the bars have room, but keep at least 12 weeks.
      var weeks = data.weeks || [];
      var first = weeks.findIndex(function (w) { return w.commits || w.opened || w.closed; });
      if (first > 0) weeks = weeks.slice(Math.min(first, Math.max(0, weeks.length - 12)));
      commitChart(data, weeks);
      if (el.issues) {
        if (data.issues) issueChart(data.issues, weeks);
        else note(el.issues, 'ISSUES UNAVAILABLE');
      }
    }, function () {
      delete fetched[id];
      if (shownId === id) both('ACTIVITY UNAVAILABLE');
    });
  }

  // Bars on one shared weekly scale. `series` is one or two {key, cls}; the
  // second, if present, hangs below the baseline so the two never stack or
  // share a mark, and both are read against the same peak.
  function bars(weeks, series, hover, rest, readout) {
    var W = 520, n = weeks.length, step = W / n, bar = Math.min(step - 2, 16);  // thin bars, at least a 2px gap
    var half = series.length > 1 ? 36 : 72, H = half * series.length;
    var peak = 0;
    weeks.forEach(function (w) { series.forEach(function (s) { peak = Math.max(peak, w[s.key] || 0); }); });

    var plot = svg('svg', { viewBox: '0 0 ' + W + ' ' + H, preserveAspectRatio: 'none', role: 'img', 'aria-label': rest });
    plot.setAttribute('class', 'activity-plot');
    plot.style.height = H + 'px';
    plot.appendChild(svg('line', { x1: 0, x2: W, y1: half - 0.5, y2: half - 0.5, class: 'activity-base' }));

    weeks.forEach(function (w, i) {
      var x = i * step + (step - bar) / 2;
      var g = svg('g', {});
      series.forEach(function (s, k) {
        var v = w[s.key] || 0;
        var h = peak ? Math.max(v ? 2 : 0, Math.round((half - 4) * v / peak)) : 0;
        if (!h) return;
        // rounded at the data end only, square on the baseline
        var r = Math.min(2, h / 2), y0 = half, sgn = k === 0 ? -1 : 1;
        g.appendChild(svg('path', { class: 'activity-bar ' + s.cls, d:
          'M' + x + ' ' + y0 + 'V' + (y0 + sgn * (h - r)) +
          'q0 ' + (sgn * r) + ' ' + r + ' ' + (sgn * r) +
          'H' + (x + bar - r) + 'q' + r + ' 0 ' + r + ' ' + (-sgn * r) + 'V' + y0 + 'Z' }));
      });
      // a full-height hit target, wider than the bar, drives the readout
      var hit = svg('rect', { x: i * step, y: 0, width: step, height: H, class: 'activity-hit' });
      hit.addEventListener('pointerenter', function () { readout.textContent = hover(w); g.setAttribute('class', 'is-hot'); });
      hit.addEventListener('pointerleave', function () { readout.textContent = rest; g.removeAttribute('class'); });
      g.appendChild(hit);
      plot.appendChild(g);
    });

    var axis = span('activity-axis', '');
    axis.appendChild(span('', n ? weekLabel(weeks[0].week).replace('WEEK OF ', '') : ''));
    axis.appendChild(span('', 'THIS WEEK'));
    return [plot, axis];
  }

  function plural(n, one, many) { return n + ' ' + (n === 1 ? one : many); }

  function commitChart(data, weeks) {
    var total = weeks.reduce(function (a, w) { return a + w.commits; }, 0);
    var rest = plural(total, 'COMMIT', 'COMMITS') + ' · LAST ' + weeks.length + ' WEEKS · ' +
      plural(data.repos, 'REPOSITORY', 'REPOSITORIES');
    var readout = span('activity-readout', rest);
    el.activity.textContent = '';
    el.activity.appendChild(readout);
    bars(weeks, [{ key: 'commits', cls: '' }], function (w) {
      return weekLabel(w.week) + ' · ' + plural(w.commits, 'COMMIT', 'COMMITS');
    }, rest, readout).forEach(function (n) { el.activity.appendChild(n); });
    if (data.pending) {
      el.activity.appendChild(span('activity-note',
        'GITHUB IS STILL COUNTING SOME REPOSITORIES; THIS FILLS IN WITHIN MINUTES.'));
    }
    // normally under a day old; older means refreshes are failing and the last good copy is shown
    var age = Math.floor((Date.now() - Date.parse(data.updated)) / 86400000);
    if (age >= 2) el.activity.appendChild(span('activity-note', 'AS OF ' + age + ' DAYS AGO.'));
  }

  function issueChart(issues, weeks) {
    var opened = 0, closed = 0;
    weeks.forEach(function (w) { opened += w.opened || 0; closed += w.closed || 0; });
    var rest = issues.open + ' OPEN · ' + opened + ' OPENED · ' + closed + ' CLOSED · LAST ' + weeks.length + ' WEEKS';
    var readout = span('activity-readout', rest);
    el.issues.textContent = '';
    el.issues.appendChild(readout);

    // two series, so a legend; the counts in the readout carry the numbers
    var legend = span('activity-legend', '');
    legend.appendChild(span('key key--opened', 'OPENED'));
    legend.appendChild(span('key key--closed', 'CLOSED'));
    el.issues.appendChild(legend);

    if (opened || closed) {
      bars(weeks, [{ key: 'opened', cls: 'is-opened' }, { key: 'closed', cls: 'is-closed' }], function (w) {
        return weekLabel(w.week) + ' · ' + (w.opened || 0) + ' OPENED · ' + (w.closed || 0) + ' CLOSED';
      }, rest, readout).forEach(function (n) { el.issues.appendChild(n); });
    }

    // the newest open issues; titles are other people's text, so textContent only
    if (issues.latest && issues.latest.length) {
      var list = document.createElement('ul');
      list.className = 'activity-issues';
      issues.latest.forEach(function (it) {
        if (!/^https:\/\/github\.com\//.test(it.url)) return;
        var li = document.createElement('li');
        var a = document.createElement('a');
        a.href = it.url;
        a.rel = 'noopener';
        a.appendChild(span('issue-ref', it.repo.toUpperCase() + ' #' + it.number));
        a.appendChild(span('issue-title', it.title));
        li.appendChild(a);
        list.appendChild(li);
      });
      el.issues.appendChild(list);
    } else if (!issues.open) {
      el.issues.appendChild(span('activity-note', 'NO OPEN ISSUES.'));
    }
  }

  /* ---------- deep links ----------
     Every record has its own page, /ventures/<slug>/, written by
     tools/sync-ventures.js with that record already selected. Selecting a row
     moves the address bar there without a reload, and back/forward follow. */

  var BASE_TITLE = 'Ventures · Factory Zero';

  function rowForPath() {
    var m = /^\/ventures\/([a-z0-9-]+)\/?$/.exec(location.pathname);
    if (!m) return null;
    for (var i = 0; i < rows.length; i++) if (rows[i].dataset.slug === m[1]) return rows[i];
    return null;
  }

  function open(row, push) {
    select(row);
    document.title = row.dataset.name + ' · ' + BASE_TITLE;
    var url = '/ventures/' + row.dataset.slug + '/';
    if (push && location.pathname !== url) history.pushState({ id: row.dataset.id }, '', url);
  }

  rows.forEach(function (row) {
    row.addEventListener('click', function () { open(row, true); });
    row.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(row, true); }
    });
  });

  window.addEventListener('popstate', function () {
    var row = rowForPath();
    if (row) open(row, false);
    else { select(rows[0]); document.title = BASE_TITLE; }
  });

  // The HTML already shows the right record; this only fills its chart and,
  // on a deep link, brings the record into view.
  var initial = rowForPath();
  select(initial || rows.filter(function (r) { return r.getAttribute('aria-pressed') === 'true'; })[0] || rows[0]);
  if (initial) {
    var detail = document.querySelector('.record-detail');
    if (detail) detail.scrollIntoView({ block: 'start' });
  }
})();
