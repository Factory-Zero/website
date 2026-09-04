/* Access request form.
   Posts JSON to the /api/contact Pages Function, which verifies Turnstile and
   sends via Resend. No key or recipient is exposed here: the browser only ever
   sends the form fields and the Turnstile token. */

(function () {
  'use strict';

  var form = document.getElementById('fz-enter-form');
  if (!form) return;

  var FALLBACK = 'contact@factory0.ventures';

  var channels = Array.prototype.slice.call(form.querySelectorAll('.channel'));
  var fields   = document.getElementById('fz-fields');
  var receipt  = document.getElementById('fz-receipt');
  var errorBox = document.getElementById('fz-error');
  var submit   = document.getElementById('fz-submit');
  var elChannel = document.getElementById('fz-channel-name');
  var elReceiptChannel = document.getElementById('fz-receipt-channel');
  var elName  = document.getElementById('fz-name');
  var elEmail = document.getElementById('fz-email');
  var elMsg   = document.getElementById('fz-msg');
  var elCompany = document.getElementById('fz-company');
  var current = channels[0];

  function pick(btn) {
    channels.forEach(function (c) { c.setAttribute('aria-checked', String(c === btn)); });
    current = btn;
    elChannel.textContent = btn.textContent.trim();
  }
  channels.forEach(function (btn) {
    btn.addEventListener('click', function () { pick(btn); });
  });

  function showError(html) {
    errorBox.innerHTML = html;
    errorBox.hidden = false;
  }
  function clearError() {
    errorBox.hidden = true;
    errorBox.textContent = '';
  }
  function mailtoFallback() {
    return 'Something went wrong sending that. Please write to ' +
           '<a href="mailto:' + FALLBACK + '">' + FALLBACK + '</a>.';
  }
  function busy(on) {
    submit.setAttribute('aria-busy', String(on));
    submit.disabled = on;
    submit.firstElementChild.textContent = on
      ? 'TRANSMITTING…'
      : 'TRANSMIT · ' + current.textContent.trim();
  }

  function turnstileToken() {
    var input = form.querySelector('[name="cf-turnstile-response"]');
    return input ? input.value : '';
  }
  function resetTurnstile() {
    if (window.turnstile && typeof window.turnstile.reset === 'function') {
      try { window.turnstile.reset(); } catch (e) { /* widget not rendered */ }
    }
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    clearError();

    var payload = {
      channel: current.textContent.trim(),
      name: elName.value,
      email: elEmail.value,
      message: elMsg.value,
      company: elCompany ? elCompany.value : '',
      turnstileToken: turnstileToken()
    };

    if (!payload.email || !payload.message) {
      showError('An email address and a message are both required.');
      return;
    }

    busy(true);

    fetch('/api/contact', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(function (res) {
        return res.json().then(function (data) { return { ok: res.ok, data: data }; });
      })
      .then(function (r) {
        busy(false);
        if (r.ok && r.data.ok) {
          elReceiptChannel.textContent = payload.channel;
          fields.hidden = true;
          receipt.hidden = false;
          receipt.focus();
          return;
        }
        resetTurnstile();
        var code = r.data && r.data.error;
        if (code === 'not_configured' || code === 'send_failed') showError(mailtoFallback());
        else showError(code || mailtoFallback());
      })
      .catch(function () {
        busy(false);
        resetTurnstile();
        showError(mailtoFallback());
      });
  });

  var again = document.getElementById('fz-again');
  if (again) {
    again.addEventListener('click', function () {
      receipt.hidden = true;
      fields.hidden = false;
      elName.value = elEmail.value = elMsg.value = '';
      clearError();
      resetTurnstile();
      elName.focus();
    });
  }
})();
