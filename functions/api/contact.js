/**
 * POST /api/contact: Factory Zero access requests.
 *
 * Security posture:
 *  - The recipient is fixed server-side. It is never read from the request, so
 *    this endpoint cannot be used as an open relay.
 *  - RESEND_API_KEY and TURNSTILE_SECRET are Cloudflare Pages secrets. Neither
 *    is ever sent to the browser.
 *  - Turnstile is verified server-side before anything is sent.
 *  - Every value that could reach a mail header is stripped of CR/LF, so a
 *    submitter cannot inject headers.
 *  - `from` is always our own verified domain. The submitter's address goes in
 *    reply_to only; spoofing their domain would fail DMARC.
 *  - Errors returned to the client are generic. Detail is logged server-side.
 */

const LIMITS = { name: 200, email: 254, message: 5000, body: 20000 };
const CHANNELS = new Set(['BUILD WITH US', 'INVEST', 'PARTNER', 'JOIN', 'OTHER']);
const ALLOWED_ORIGINS = new Set([
  'https://factory0.ventures',
  'https://www.factory0.ventures',
]);

const json = (status, obj) =>
  new Response(JSON.stringify(obj), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      'referrer-policy': 'strict-origin-when-cross-origin',
      'x-content-type-options': 'nosniff',
    },
  });

// Anything that might end up in a header must not contain CR, LF or NUL.
const oneLine = (v, max) =>
  String(v ?? '').replace(/[\r\n\0]+/g, ' ').trim().slice(0, max);

const EMAIL_RE = /^[^@\s]+@[^@\s.]+\.[^@\s]+$/;

export async function onRequest(context) {
  const { request, env } = context;

  if (request.method === 'OPTIONS') return json(204, {});
  if (request.method !== 'POST') return json(405, { error: 'method not allowed' });

  // Same-origin only. A browser always sends Origin on a cross-origin POST.
  const origin = request.headers.get('origin');
  if (origin && !ALLOWED_ORIGINS.has(origin)) return json(403, { error: 'forbidden' });

  if (!(request.headers.get('content-type') || '').includes('application/json')) {
    return json(415, { error: 'expected application/json' });
  }

  let body;
  try {
    const raw = await request.text();
    if (raw.length > LIMITS.body) return json(413, { error: 'too large' });
    body = JSON.parse(raw);
  } catch {
    return json(400, { error: 'invalid request' });
  }

  // Honeypot: real people leave this empty. Accept silently so bots learn nothing.
  if (oneLine(body.company, 10)) return json(200, { ok: true });

  const name = oneLine(body.name, LIMITS.name);
  const email = oneLine(body.email, LIMITS.email);
  const rawChannel = oneLine(body.channel, 40);
  const channel = CHANNELS.has(rawChannel) ? rawChannel : 'OTHER';
  const message = String(body.message ?? '').replace(/\0/g, '').trim().slice(0, LIMITS.message);

  if (!EMAIL_RE.test(email)) return json(400, { error: 'A valid email address is required.' });
  if (!message) return json(400, { error: 'A message is required.' });

  // Turnstile. Only skipped when no secret is configured, so a misconfigured
  // deploy fails open to "no bot check" rather than to "endpoint down".
  if (env.TURNSTILE_SECRET) {
    const token = oneLine(body.turnstileToken, 2048);
    if (!token) return json(400, { error: 'Verification is required.' });

    const form = new FormData();
    form.append('secret', env.TURNSTILE_SECRET);
    form.append('response', token);
    const ip = request.headers.get('cf-connecting-ip');
    if (ip) form.append('remoteip', ip);

    try {
      const verify = await fetch(
        'https://challenges.cloudflare.com/turnstile/v0/siteverify',
        { method: 'POST', body: form }
      );
      const result = await verify.json();
      if (!result.success) {
        console.log('turnstile rejected', JSON.stringify(result['error-codes'] || []));
        return json(403, { error: 'Verification failed. Please try again.' });
      }
    } catch (e) {
      console.log('turnstile unreachable', e.message);
      return json(502, { error: 'Could not verify right now. Please try again.' });
    }
  }

  if (!env.RESEND_API_KEY) return json(503, { error: 'not_configured' });

  const to = env.CONTACT_TO || 'contact@factory0.ventures';
  const from = env.CONTACT_FROM || 'Factory Zero <noreply@send.factory0.ventures>';

  const lines = [
    `Channel: ${channel}`,
    `Name:    ${name || '(not given)'}`,
    `Email:   ${email}`,
    '',
    message,
    '',
    '--',
    `Country: ${request.cf?.country || 'unknown'}`,
    `Sent by the factory0.ventures contact form.`,
  ];

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${env.RESEND_API_KEY}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [to],            // fixed server-side, never from the request
        reply_to: email,
        subject: `[${channel}] ${name || email}`,
        text: lines.join('\n'),
      }),
    });

    if (!res.ok) {
      console.log('resend failed', res.status, await res.text());
      return json(502, { error: 'send_failed' });
    }
  } catch (e) {
    console.log('resend unreachable', e.message);
    return json(502, { error: 'send_failed' });
  }

  return json(200, { ok: true });
}
