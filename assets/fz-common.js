/* Shared across every page. Kept tiny and dependency-free. */
(function () {
  'use strict';
  var y = document.getElementById('fz-year');
  if (y) y.textContent = String(new Date().getFullYear());
  var root = document.documentElement;

  /* Solid header once the page has scrolled past the hero's first band. */
  var scrolled = null;
  function onScroll() {
    var now = window.scrollY > 24;
    if (now !== scrolled) { scrolled = now; root.classList.toggle('scrolled', now); }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* FZ STACK info popover: any button.fzs-i opens it. A real dialog: Esc or a
     click outside closes it and focus goes back to the button. */
  var POP_TEXT = 'Ventures other ventures are built on. They add shared infrastructure and agents (identity, email, deploys, support, payments\u2026) that every new launch inherits. Other ventures are standalone companies with their own product and brand.';
  var pop = null, popBtn = null;
  function stackList() {
    var out = [], D = window.FZ_DATA;
    if (D && D.ventures) {
      D.ventures.forEach(function (v) { if (v.stack && v.status !== 'ARCHIVED') out.push([v.stackRole || '', v.name]); });
    } else {
      Array.prototype.forEach.call(document.querySelectorAll('.record[data-stack="1"]'), function (r) { out.push([r.dataset.stackRole || '', r.dataset.name]); });
    }
    return out;
  }
  function buildPop() {
    pop = document.createElement('div');
    pop.className = 'fzs-pop'; pop.id = 'fzs-pop'; pop.hidden = true;
    pop.setAttribute('role', 'dialog'); pop.setAttribute('aria-label', 'What FZ STACK means');
    var k = document.createElement('p'); k.className = 'fzs-pop-k'; k.textContent = 'FZ STACK \u00b7 THE FOUNDATION TO LAUNCH VENTURES AT SCALE';
    var t = document.createElement('p'); t.className = 'fzs-pop-t'; t.textContent = POP_TEXT;
    pop.appendChild(k); pop.appendChild(t);
    var list = stackList();
    if (list.length) {
      var ul = document.createElement('ul'); ul.className = 'fzs-pop-list';
      list.forEach(function (p) {
        var li = document.createElement('li');
        var r = document.createElement('span'); r.textContent = p[0];
        var n = document.createElement('b'); n.textContent = p[1];
        li.appendChild(r); li.appendChild(n); ul.appendChild(li);
      });
      pop.appendChild(ul);
    }
    var l = document.createElement('p'); l.className = 'fzs-pop-links';
    var a = document.createElement('a'); a.href = '/stack/'; a.textContent = 'SEE THE STACK \u2192';
    var b = document.createElement('a'); b.href = '/ventures/?stack=1'; b.textContent = 'FILTER THE REGISTRY';
    l.appendChild(a); l.appendChild(b); pop.appendChild(l);
    document.body.appendChild(pop);
  }
  function closePop(focusBack) {
    if (!pop || pop.hidden) return;
    pop.hidden = true;
    if (popBtn) { popBtn.setAttribute('aria-expanded', 'false'); if (focusBack) popBtn.focus(); }
    popBtn = null;
  }
  function openPop(btn) {
    if (!pop) buildPop();
    if (popBtn === btn && !pop.hidden) { closePop(true); return; }
    closePop(false);
    popBtn = btn; btn.setAttribute('aria-expanded', 'true'); btn.setAttribute('aria-controls', 'fzs-pop');
    pop.hidden = false;
    var r = btn.getBoundingClientRect(), w = Math.min(340, window.innerWidth - 24);
    pop.style.width = w + 'px';
    var x = Math.max(12, Math.min(window.innerWidth - w - 12, r.left - 8)), y = r.bottom + 10;
    if (y + pop.offsetHeight > window.innerHeight - 12) y = Math.max(12, r.top - pop.offsetHeight - 10);
    pop.style.left = x + 'px'; pop.style.top = y + 'px';
    var first = pop.querySelector('a'); if (first) first.focus({ preventScroll: true });
  }
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('.fzs-i');
    if (b) { e.preventDefault(); e.stopPropagation(); openPop(b); return; }
    if (pop && !pop.hidden && !e.target.closest('.fzs-pop')) closePop(false);
  }, true);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && pop && !pop.hidden) { e.stopPropagation(); closePop(true); }
  });

  /* Gentle reveal on scroll for the stack page; nothing moves with reduced motion. */
  var rv = document.querySelectorAll('.sk-reveal');
  if (rv.length) {
    var calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (calm || !('IntersectionObserver' in window)) {
      Array.prototype.forEach.call(rv, function (n) { n.classList.add('in'); });
    } else {
      document.documentElement.classList.add('sk-anim');
      var io = new IntersectionObserver(function (en) {
        en.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add('in'); io.unobserve(x.target); } });
      }, { rootMargin: '0px 0px -8% 0px' });
      Array.prototype.forEach.call(rv, function (n) { io.observe(n); });
    }
  }

  /* Mobile menu. The <html class="js"> hook is set inline in <head> so the
     panel never flashes; without JS the nav simply wraps under the wordmark. */
  var btn = document.querySelector('.nav-toggle');
  var nav = document.getElementById('site-nav');
  if (!btn || !nav) return;
  var lastFocus = null;
  function setOpen(open) {
    root.classList.toggle('nav-open', open);
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    btn.textContent = open ? 'CLOSE' : 'MENU';
    if (open) {
      lastFocus = document.activeElement;
      var first = nav.querySelector('a');
      if (first) first.focus();
    } else if (lastFocus && lastFocus.focus) {
      lastFocus.focus();
    }
  }
  btn.addEventListener('click', function () { setOpen(!root.classList.contains('nav-open')); });
  nav.addEventListener('click', function (e) { if (e.target.closest('a')) setOpen(false); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && root.classList.contains('nav-open')) setOpen(false);
  });
  var mq = window.matchMedia('(min-width: 901px)');
  var onWide = function (m) { if (m.matches) setOpen(false); };
  if (mq.addEventListener) mq.addEventListener('change', onWide); else mq.addListener(onWide);
})();
