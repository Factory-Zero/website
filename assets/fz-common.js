/* Shared across every page. Kept tiny and dependency-free. */
(function () {
  'use strict';
  var y = document.getElementById('fz-year');
  if (y) y.textContent = String(new Date().getFullYear());

  /* Mobile menu. The <html class="js"> hook is set inline in <head> so the
     panel never flashes; without JS the nav simply wraps under the wordmark. */
  var root = document.documentElement;
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
