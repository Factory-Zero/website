#!/usr/bin/env node
/* Sets up the read-only GitHub App that lets /api/activity count private
 * repositories (numbers only; see functions/api/activity.js).
 *
 *   node tools/setup-github-app.mjs            create the app, store its secrets
 *   node tools/setup-github-app.mjs --install  open the install page for every
 *                                              venture org not yet installed, each
 *                                              with its org preselected (needs gh)
 *   node tools/setup-github-app.mjs --refresh  after a deploy: drop the stored
 *                                              activity so every venture refetches
 *
 * Options: --org <login> (default Factory-Zero) owns the app;
 *          --name <name> (default "Factory Zero Activity") if the name is taken;
 *          --slug <slug> (default factory-zero-activity) for --install.
 *
 * Creating the app uses GitHub's manifest flow: a local page posts the app
 * definition to GitHub, you click "Create GitHub App", and GitHub redirects
 * back here with a one-time code that is exchanged for the App ID and private
 * key. The key is converted to PKCS#8 in memory and piped straight into
 * `wrangler pages secret put`; it is never written to disk or printed.
 */
import http from 'node:http';
import crypto from 'node:crypto';
import { spawn, spawnSync } from 'node:child_process';
import path from 'node:path';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const PROJECT = 'factory-zero';
const args = process.argv.slice(2);
const opt = (flag, fallback) => {
  const i = args.indexOf(flag);
  return i >= 0 && args[i + 1] ? args[i + 1] : fallback;
};
const ORG = opt('--org', 'Factory-Zero');
const NAME = opt('--name', 'Factory Zero Activity');
const SLUG = opt('--slug', 'factory-zero-activity');

const esc = s => String(s).replace(/[&<>"']/g, c => `&#${c.charCodeAt(0)};`);
const openUrl = url => spawn(process.platform === 'darwin' ? 'open' : 'xdg-open', [url], { stdio: 'ignore', detached: true }).unref();

// wrangler, run in the repo so wrangler.toml (the KV binding) applies.
function wrangler(argv, input) {
  const r = spawnSync('npx', ['wrangler', ...argv], {
    cwd: ROOT,
    input,
    encoding: 'utf8',
    stdio: [input === undefined ? 'inherit' : 'pipe', 'pipe', 'pipe'],
  });
  if (r.status !== 0) throw new Error(`wrangler ${argv.slice(0, 3).join(' ')} failed:\n${r.stderr || r.stdout}`);
  return r.stdout;
}

if (args.includes('--refresh')) refresh();
else if (args.includes('--install')) install();
else await create();

/* ---------- --install ----------
   GitHub has no API to install an app on an org; each org consents in the
   browser. This opens one install page per venture org that lacks the app,
   with the org already chosen, so each is a single "Install" click. */

function install() {
  const gh = a => {
    const r = spawnSync('gh', ['api', ...a], { encoding: 'utf8' });
    return r.status === 0 ? r.stdout.trim() : null;
  };
  const sources = JSON.parse(readFileSync(path.join(ROOT, 'functions/api/activity-sources.json'), 'utf8'));
  const owners = [...new Set(Object.values(sources).flatMap(s => s.owners))].sort();
  let opened = 0;
  for (const owner of owners) {
    const installed = gh([`orgs/${owner}/installations`, '-q', `[.installations[] | select(.app_slug == "${SLUG}")] | length`]);
    if (installed && Number(installed) > 0) { console.log(`${owner}: already installed`); continue; }
    const id = gh([`orgs/${owner}`, '-q', '.id']);
    if (!id) { console.log(`${owner}: could not look up the org (not an org, or no access)`); continue; }
    openUrl(`https://github.com/apps/${SLUG}/installations/new/permissions?target_id=${id}`);
    console.log(`${owner}: install page opened`);
    opened++;
  }
  console.log(opened
    ? `\nIn each tab: keep "All repositories", click Install. Then run this again to confirm.`
    : '\nThe app is installed on every venture org.');
}

/* ---------- --refresh ---------- */

function refresh() {
  const keys = JSON.parse(wrangler(['kv', 'key', 'list', '--binding', 'ACTIVITY', '--remote']))
    .map(k => k.name)
    .filter(n => n.startsWith('activity:'));
  for (const k of keys) wrangler(['kv', 'key', 'delete', k, '--binding', 'ACTIVITY', '--remote']);
  console.log(`Cleared ${keys.length} stored venture(s). Each refetches from GitHub on its next view.`);
  console.log('Open them one at a time rather than all at once: a burst of searches trips GitHub’s short rate limit for about a minute.');
}

/* ---------- create ---------- */

async function create() {
  const state = crypto.randomBytes(16).toString('hex');
  const server = http.createServer();
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  const base = `http://127.0.0.1:${server.address().port}`;

  const manifest = {
    name: NAME,
    url: 'https://factory0.ventures',
    description: 'Read-only: counts commits and issues for the factory0.ventures venture pages. Publishes numbers only.',
    // No webhook: the site pulls, GitHub never needs to call it.
    hook_attributes: { url: 'https://factory0.ventures', active: false },
    redirect_url: `${base}/callback`,
    // Public so each venture org can install it; it can read only what an org grants.
    public: true,
    default_permissions: { metadata: 'read', issues: 'read' },
    default_events: [],
  };

  const done = new Promise((resolve, reject) => {
    server.on('request', async (req, res) => {
      const url = new URL(req.url, base);
      if (url.pathname === '/') {
        // Auto-submitting form: the manifest flow requires a POST from the browser.
        res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
        res.end(`<!doctype html><meta charset="utf-8"><title>Create GitHub App</title>
<body style="font:14px system-ui;background:#0A0A0B;color:#EDEBE6;padding:40px">
<p>Sending the app definition to GitHub&hellip;</p>
<form id="f" method="post" action="https://github.com/organizations/${encodeURIComponent(ORG)}/settings/apps/new?state=${state}">
<input type="hidden" name="manifest" value="${esc(JSON.stringify(manifest))}">
<button>Continue to GitHub</button></form>
<script>document.getElementById('f').submit()</script>`);
        return;
      }
      if (url.pathname !== '/callback') { res.writeHead(404); res.end(); return; }

      const page = (msg, code = 200) => {
        res.writeHead(code, { 'content-type': 'text/html; charset=utf-8' });
        res.end(`<!doctype html><meta charset="utf-8"><body style="font:14px system-ui;background:#0A0A0B;color:#EDEBE6;padding:40px">${msg}`);
      };
      try {
        if (url.searchParams.get('state') !== state) throw new Error('state mismatch; start the script again');
        const code = url.searchParams.get('code');
        if (!code) throw new Error('GitHub did not return a code');

        // Exchange the one-time code. No auth needed; the code is the credential.
        const r = await fetch(`https://api.github.com/app-manifests/${encodeURIComponent(code)}/conversions`, {
          method: 'POST',
          headers: { accept: 'application/vnd.github+json', 'user-agent': 'factory0.ventures setup' },
        });
        if (!r.ok) throw new Error(`GitHub conversion failed: ${r.status}`);
        const app = await r.json();

        // GitHub issues PKCS#1; WebCrypto in the Worker imports PKCS#8.
        const pkcs8 = crypto.createPrivateKey(app.pem).export({ type: 'pkcs8', format: 'pem' });
        console.log(`Created app "${app.name}" (ID ${app.id}). Storing secrets in Pages project ${PROJECT}…`);
        wrangler(['pages', 'secret', 'put', 'GH_APP_ID', '--project-name', PROJECT], String(app.id));
        wrangler(['pages', 'secret', 'put', 'GH_APP_PRIVATE_KEY', '--project-name', PROJECT], pkcs8);
        console.log('Stored GH_APP_ID and GH_APP_PRIVATE_KEY.');

        const install = `https://github.com/apps/${app.slug}/installations/new`;
        page(`<p>Done: <b>${esc(app.name)}</b> created and its secrets stored.</p>
<p>Next, install it on each venture org whose private repositories should count:</p>
<p><a style="color:#FF5A36" href="${esc(install)}">${esc(install)}</a></p>
<p>You can close this tab.</p>`);
        resolve(install);
      } catch (e) {
        page(`<p>Setup failed: ${esc(e.message)}</p>`, 500);
        reject(e);
      }
    });
  });

  console.log(`Opening your browser to create the app in ${ORG}.`);
  console.log(`Click "Create GitHub App" on GitHub. (If the browser did not open: ${base}/)`);
  openUrl(`${base}/`);

  let install;
  try {
    install = await done;
  } finally {
    server.close();
  }

  openUrl(install);
  console.log(`
Next:
  1. Install the app (just opened): ${install}
     Pick each venture org whose private repositories should count, "All repositories".
  2. Merge and deploy PR #16:
     gh pr merge 16 --squash --delete-branch && git checkout main && git pull --ff-only \\
       && ./tools/build-dist.sh && npx wrangler pages deploy dist --project-name=${PROJECT} --branch=main
  3. Refetch everything with the new access:
     node tools/setup-github-app.mjs --refresh`);
}
