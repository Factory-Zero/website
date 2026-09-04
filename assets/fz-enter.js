/* Access request form.
   There is no backend, so this composes a real mailto: rather than faking a
   submission. The design's confirmation state is kept but reworded to describe
   what actually happened. */

(function () {
  'use strict';

  var form = document.getElementById('fz-enter-form');
  if (!form) return;

  var TO = 'contact@factory0.ventures';
  var channels = Array.prototype.slice.call(form.querySelectorAll('.channel'));
  var fields   = document.getElementById('fz-fields');
  var receipt  = document.getElementById('fz-receipt');
  var elChannel = document.getElementById('fz-channel-name');
  var elReceiptChannel = document.getElementById('fz-receipt-channel');
  var elName  = document.getElementById('fz-name');
  var elEmail = document.getElementById('fz-email');
  var elMsg   = document.getElementById('fz-msg');
  var current = channels[0];

  function pick(btn) {
    channels.forEach(function (c) { c.setAttribute('aria-checked', String(c === btn)); });
    current = btn;
    elChannel.textContent = btn.textContent.trim();
  }

  channels.forEach(function (btn) {
    btn.addEventListener('click', function () { pick(btn); });
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var channel = current.textContent.trim();
    var subject = '[' + channel + '] Access request';
    var body =
      'Channel: ' + channel + '\n' +
      'Name: ' + (elName.value || '') + '\n' +
      'Email: ' + (elEmail.value || '') + '\n\n' +
      (elMsg.value || '');

    window.location.href =
      'mailto:' + TO +
      '?subject=' + encodeURIComponent(subject) +
      '&body=' + encodeURIComponent(body);

    elReceiptChannel.textContent = channel;
    fields.hidden = true;
    receipt.hidden = false;
    receipt.focus();
  });

  var again = document.getElementById('fz-again');
  if (again) {
    again.addEventListener('click', function () {
      receipt.hidden = true;
      fields.hidden = false;
      elName.value = elEmail.value = elMsg.value = '';
      elName.focus();
    });
  }
})();
