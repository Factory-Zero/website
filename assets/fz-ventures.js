/* Merged pull requests by author: the home page panel and the venture row.
   fz-app.js loads this file too (for window.FZStack) and the home page has no
   venture records, so the chart lives in its own closure above the registry
   below and is exported rather than run on load. */

(function () {
  'use strict';

  var SVG = 'http://www.w3.org/2000/svg';
  var MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

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

  function plural(n, one, many) { return n + ' ' + (n === 1 ? one : many); }

  function weekLabel(iso) {
    var p = iso.split('-');
    return 'WEEK OF ' + Number(p[2]) + ' ' + MONTHS[Number(p[1]) - 1] + ' ' + p[0];
  }

  // stacked bottom-up: the colonizer sits on the baseline, people above it,
  // bots on top, so the primary colour reads as the base of every bar
  var SERIES = [
    { key: 'colonizer', cls: '', one: 'COLONIZER', many: 'COLONIZER' },
    { key: 'people', cls: 'is-people', one: 'PERSON', many: 'PEOPLE' },
    { key: 'bots', cls: 'is-bots', one: 'BOT', many: 'BOTS' }
  ];

  /* One stacked bar per week on one shared scale. A sibling of bars() below,
     which draws series that diverge around a baseline; this one stacks them.
     Segments are square where they meet and the topmost one is rounded. */
  function stackBars(weeks, hover, rest, readout) {
    var W = 520, H = 72, n = weeks.length, step = W / n, bar = Math.min(step - 2, 16);
    var peak = 0;
    weeks.forEach(function (w) {
      var t = 0;
      SERIES.forEach(function (s) { t += w[s.key] || 0; });
      peak = Math.max(peak, t);
    });

    var plot = svg('svg', { viewBox: '0 0 ' + W + ' ' + H, preserveAspectRatio: 'none', role: 'img', 'aria-label': rest });
    plot.setAttribute('class', 'activity-plot');
    plot.style.height = H + 'px';
    plot.appendChild(svg('line', { x1: 0, x2: W, y1: H - 0.5, y2: H - 0.5, class: 'activity-base' }));

    weeks.forEach(function (w, i) {
      var x = i * step + (step - bar) / 2;
      var g = svg('g', {});
      // the highest segment drawn is the one whose top end gets the radius
      var top = -1;
      SERIES.forEach(function (s, k) { if (w[s.key] > 0) top = k; });
      var base = H;
      SERIES.forEach(function (s, k) {
        var v = w[s.key] || 0;
        if (!v) return;
        // heights come off one shared scale, so the whole stack lands on the peak;
        // any nonzero value still gets a 2px mark so it is never invisible
        var h = Math.max(2, Math.round((H - 4) * v / peak));
        if (h > base - 1) h = base - 1;
        var y = base - h;
        base = y;
        // rounded at the data end only, square where the stack meets itself
        var r = (k === top) ? Math.min(2, h / 2) : 0;
        g.appendChild(svg('path', { class: 'activity-bar ' + s.cls, d:
          'M' + x + ' ' + (y + h) + 'V' + (y + r) + 'q0 ' + (-r) + ' ' + r + ' ' + (-r) +
          'H' + (x + bar - r) + 'q' + r + ' 0 ' + r + ' ' + r + 'V' + (y + h) + 'Z' }));
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

  // "5 OCT 2026", for the sentence above the chart
  function day(iso) { return weekLabel(iso).replace('WEEK OF ', ''); }

  /* The same numbers again, for anyone not reading the bars: a screen-reader
     table next to the chart rather than an aria-label that cannot hold them. */
  function cell(tag, text, scope) {
    var n = document.createElement(tag);
    if (scope) n.setAttribute('scope', scope);
    n.textContent = text;
    return n;
  }

  function dataTable(weeks, where) {
    // the table sits in a 1px clipped box: a table given width:1px on its own
    // still grows to min-content and widens the page on a phone
    var box = document.createElement('div');
    box.className = 'sr-only-box';
    var t = document.createElement('table');
    t.className = 'sr-only';
    box.appendChild(t);
    t.appendChild(cell('caption', 'Merged pull requests per week' + (where ? ', ' + where : '') +
      ', last ' + weeks.length + ' weeks. The same numbers as the chart.'));
    var hr = document.createElement('tr');
    ['WEEK', 'COLONIZER', 'PEOPLE', 'BOTS', 'TOTAL'].forEach(function (h) { hr.appendChild(cell('th', h, 'col')); });
    var head = document.createElement('thead');
    head.appendChild(hr);
    t.appendChild(head);
    var body = document.createElement('tbody');
    weeks.forEach(function (w) {
      var r = document.createElement('tr');
      r.appendChild(cell('th', day(w.week), 'row'));
      var tot = 0;
      SERIES.forEach(function (s) {
        var v = w[s.key] || 0;
        tot += v;
        r.appendChild(cell('td', String(v)));
      });
      r.appendChild(cell('td', String(tot)));
      body.appendChild(r);
    });
    t.appendChild(body);
    return box;
  }

  /* Rejects on anything the reader must not be shown a number for: an error, a
     non-200, or a payload with no weeks or no totals. No placeholder data. */
  function loadAuthors(id) {
    return fetch('/api/authors' + (id ? '?id=' + encodeURIComponent(id) : ''))
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function (data) {
        if (!data || !data.totals || !data.weeks || !data.weeks.length) throw new Error('no data');
        return data;
      });
  }

  /* Fills `host` with the headline, the readout, the legend, the chart, the axis
     and the table, and returns the number of PRs drawn (0 if there is nothing
     to draw). Every number shown is summed from `weeks`, not read from
     `totals`: the series is public-only while the totals also count private
     repositories, so a total printed under a public-only chart would not add
     up to it. That also keeps the share below the chart describing the chart
     above it, on the API's own definition — colonizer against people, bots
     aside. `scope` is a venture id, used only to name the table. */
  function chartPanel(host, data, scope) {
    var weeks = data.weeks;
    var until = day(weeks[weeks.length - 1].week);
    var col = 0, ppl = 0, bots = 0;
    weeks.forEach(function (w) {
      col += w.colonizer || 0;
      ppl += w.people || 0;
      bots += w.bots || 0;
    });
    var prs = col + ppl + bots;
    var human = col + ppl;   // the share the API means: bots are not a person

    host.textContent = '';
    // The share names its own denominator: bots are counted in the bars but not
    // in it, so the sentence has to say "merged by people" or a reader dividing
    // the two numbers beside it gets a different answer. It is a count of merged
    // pull requests, never of lines of code.
    // A share that rounds to zero says nothing, and a total of zero is not a
    // zero share: both fall back to the counts rather than a misleading "0%".
    var pct = human ? Math.round(col / human * 100) : 0;
    host.appendChild(span('activity-head', !prs
      ? 'No merged pull requests counted in the ' + weeks.length + ' weeks to ' + until + '.'
      : pct >= 1
        ? 'Colonizer merged ' + pct + '% of the pull requests merged by people in the ' + weeks.length + ' weeks to ' + until + '.'
        : 'Colonizer merged ' + col + ' of the ' + human + ' pull requests merged by people in the ' + weeks.length + ' weeks to ' + until + '.'));

    var rest = plural(prs, 'MERGED PR', 'MERGED PRS') + ' · LAST ' + weeks.length + ' WEEKS · COLONIZER ' +
      col + ' · PEOPLE ' + ppl + ' · BOTS ' + bots;
    var readout = span('activity-readout', rest);
    host.appendChild(readout);

    var legend = span('activity-legend', '');
    SERIES.forEach(function (s) { legend.appendChild(span('key key--' + s.key, s.many)); });
    host.appendChild(legend);
    stackBars(weeks, function (w) {
      return weekLabel(w.week) + ' · ' + SERIES.map(function (s) {
        return plural(w[s.key] || 0, s.one, s.many);
      }).join(' · ');
    }, rest, readout).forEach(function (n) { host.appendChild(n); });
    host.appendChild(dataTable(weeks, scope));
    return prs;
  }

  window.FZStack = { svg: svg, span: span, plural: plural, weekLabel: weekLabel, stackBars: stackBars, chartPanel: chartPanel, loadAuthors: loadAuthors };
})();

/* Ventures registry.
   The rows and the default detail panel are already in the HTML, so the page is
   fully indexable with JavaScript off. This only adds selection behaviour, and
   it reads each record straight off its row's data-* attributes so there is no
   second copy of the venture data at runtime. */

(function () {
  'use strict';

  // the chart closure above owns the SVG helpers; without them this registry
  // could not draw, and bailing here leaves the page readable rather than
  // taking the whole script down at load
  if (!window.FZStack) return;

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
    uses: document.getElementById('d-uses'),
    activity: document.getElementById('d-activity'),
    issues: document.getElementById('d-issues'),
    authors: document.getElementById('d-authors'),
    cat:   document.getElementById('d-cat'),
    launched: document.getElementById('d-launched'),
    stage: document.getElementById('d-stage'),
    record: document.getElementById('d-record'),
    stack: document.getElementById('d-stack')
  };

  function select(row) {
    rows.forEach(function (r) { r.setAttribute('aria-pressed', String(r === row)); });

    var d = row.dataset;
    el.id.textContent = d.id;
    el.record.textContent = 'RECORD / ' + d.id;
    el.name.textContent = d.name;
    if (el.stack) {
      el.stack.hidden = d.stack !== '1';
      var sr = document.getElementById('d-stack-role');
      if (sr) sr.textContent = d.stackRole || '';
      var so = document.getElementById('d-stack-os');
      if (so) { so.hidden = !d.license; so.title = d.license + ' licence'; }
    }
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

    // what it is built with: [label, name, href, 'live' | 'planned', note], written by sync-ventures.js
    if (el.uses) {
      var used = [];
      try { used = JSON.parse(d.uses || '[]'); } catch (e) { used = []; }
      el.uses.textContent = '';
      if (used.length) {
        var ul = document.createElement('ul');
        ul.className = 'uses';
        used.forEach(function (u) {
          var li = document.createElement('li');
          li.className = 'use';
          var role = document.createElement('span');
          role.className = 'use-role';
          role.textContent = u[0];
          var a = document.createElement('a');
          a.className = 'use-name';
          a.href = u[2];
          if (u[2].charAt(0) !== '/') a.rel = 'noopener';
          a.textContent = u[1];
          var tag = document.createElement('span');
          tag.className = 'use-tag use-tag--' + u[3];
          tag.textContent = String(u[3]).toUpperCase();
          li.appendChild(role); li.appendChild(a); li.appendChild(tag);
          if (u[4]) {
            var note = document.createElement('span');
            note.className = 'use-note';
            note.textContent = u[4];
            li.appendChild(note);
          }
          ul.appendChild(li);
        });
        el.uses.appendChild(ul);
      } else {
        var none = document.createElement('span');
        none.textContent = 'NOT RECORDED';
        el.uses.appendChild(none);
      }
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

  var fetched = {};   // venture id -> promise of the response body, once per page view
  var shownId = null;

  // the SVG helpers are the shared ones above, so both surfaces draw alike
  var svg = window.FZStack.svg, span = window.FZStack.span, weekLabel = window.FZStack.weekLabel;

  function note(host, text) {
    host.textContent = '';
    var s = document.createElement('span');
    s.textContent = text;
    host.appendChild(s);
  }

  function both(text) {
    note(el.activity, text);
    if (el.issues) note(el.issues, text);
  }

  function activity(id, hasRepos) {
    shownId = id;
    if (!hasRepos) { both('NO PUBLIC REPOSITORY'); authors(null); return; }
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
    authors(id);
  }

  /* ---------- merged pull requests by author ----------
     Who merged what, from /api/authors (functions/api/authors.js), for this
     venture only. The row is built here rather than in the template, so all 22
     generated venture pages pick it up without being rewritten. When the feed
     is unavailable the row is hidden: a status line next to two live charts
     would read as "this venture has no merged PRs", which is a different claim. */
  var authorsFetched = {};

  function authorsRow() {
    if (el.authors) return el.authors.parentNode;
    if (!el.issues || !el.issues.parentNode) return null;
    var div = document.createElement('div');
    div.className = 'wide activity';
    var dt = document.createElement('dt');
    dt.textContent = 'MERGED PRS · COLONIZER VS PEOPLE';
    el.authors = document.createElement('dd');
    el.authors.id = 'd-authors';
    div.appendChild(dt);
    div.appendChild(el.authors);
    el.issues.parentNode.parentNode.insertBefore(div, el.issues.parentNode.nextSibling);
    return div;
  }

  function authors(id) {
    var row = authorsRow();
    if (!row) return;
    if (!id) { row.hidden = true; return; }   // nothing public to count
    row.hidden = true;
    if (!authorsFetched[id]) {
      authorsFetched[id] = window.FZStack.loadAuthors(id);
    }
    authorsFetched[id].then(function (data) {
      if (shownId !== id) return;   // the reader may have moved on to another record
      // chartPanel sums the public-only weeks itself and returns what it drew;
      // nothing in this venture's public series means there is nothing to show
      if (!window.FZStack.chartPanel(el.authors, data, id)) { row.hidden = true; return; }
      row.hidden = false;
    }, function () {
      delete authorsFetched[id];
      row.hidden = true;            // hide cleanly: no placeholder, no zero
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

  var plural = window.FZStack.plural;

  function commitChart(data, weeks) {
    var total = weeks.reduce(function (a, w) { return a + w.commits; }, 0);
    var rest = plural(total, 'COMMIT', 'COMMITS') + ' · LAST ' + weeks.length + ' WEEKS · ' +
      plural(data.repos, 'REPOSITORY', 'REPOSITORIES') + (data.private ? ', ' + data.private + ' PRIVATE' : '');
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

  var detailEl = document.querySelector('.record-detail');
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function toDetail(smooth) {
    if (detailEl) detailEl.scrollIntoView({ block: 'start', behavior: smooth && !reduceMotion ? 'smooth' : 'auto' });
  }

  function open(row, push) {
    select(row);
    document.title = row.dataset.name + ' · ' + BASE_TITLE;
    var url = '/ventures/' + row.dataset.slug + '/';
    if (push && location.pathname !== url) history.pushState({ id: row.dataset.id }, '', url);
  }

  rows.forEach(function (row) {
    // choosing a record takes the reader to it, since the detail sits below the list
    row.addEventListener('click', function () { open(row, true); toDetail(true); });
    row.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(row, true); toDetail(true); }
    });
  });

  window.addEventListener('popstate', function () {
    var row = rowForPath();
    if (row) open(row, false);
    else { select(rows[0]); document.title = BASE_TITLE; }
  });

  // FZ STACK filter: show only the ventures other ventures are built on
  var stackBtn = document.getElementById('fz-stack-filter');
  function setStackFilter(on) {
    stackBtn.setAttribute('aria-pressed', String(on));
    rows.forEach(function (r) { r.hidden = on && r.dataset.stack !== '1'; });
  }
  if (stackBtn) {
    stackBtn.addEventListener('click', function () { setStackFilter(stackBtn.getAttribute('aria-pressed') !== 'true'); });
    // /ventures/?stack=1 arrives with the filter on (the stack page and the popover link here)
    if (/[?&]stack=1\b/.test(location.search)) setStackFilter(true);
  }

  // The HTML already shows the right record; this only fills its chart and,
  // on a deep link, brings the record into view.
  var initial = rowForPath();
  select(initial || rows.filter(function (r) { return r.getAttribute('aria-pressed') === 'true'; })[0] || rows[0]);
  if (initial) toDetail(false);
})();
