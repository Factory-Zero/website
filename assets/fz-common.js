/* Shared across every page. Kept tiny and dependency-free. */
(function () {
  'use strict';
  var y = document.getElementById('fz-year');
  if (y) y.textContent = String(new Date().getFullYear());
})();
