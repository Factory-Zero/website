# Stack sources

The evidence behind every `uses` entry in `assets/fz-data.js` (published as
`/stack.json` and the "Built with" row on each venture page). Checked
2026-10-03. This file is not published (it is not in the `build-dist.sh`
allowlist). Private repositories are described, not named.

**The rule.** `live` means in use today and checked: a Worker answering on its
route, a mailer that actually sends, a module merged and running. A mailer
that falls back to a no-op is not live email. Anything decided and tracked in
an issue, but not running, is `planned`. With no evidence either way, the
entry is left out. Re-check an entry before flipping it to `live`.

## Checks that apply to many ventures

| Claim | Evidence |
| :--- | :--- |
| Cloudflare hosts every venture site (`hosting`, live) | `curl -sI https://<site>/` answers `server: cloudflare` for all eighteen sites (2026-10-03), and for tokker.dev (2026-10-05); each site repo deploys to Cloudflare Pages or a static-assets Worker. |
| Cratefield waitlist Workers are live (`framework`, live) | `GET https://api.<domain>/v1/waitlist` answers `405` (the route exists and takes POST) for sealb.in, release.show, colonizer.dev, findsyou.work, posplug.in and cratefield.com (2026-10-03). Each private waitlist backend's `Cargo.toml` depends on `cratefield-module-waitlist` (or its earlier `factory0-module-waitlist` name, from `Cratefield/harness`) and its `wrangler.toml` routes `api.<domain>`. |
| Waitlist confirmation mail is not live (`email`, planned) | Each waitlist backend's `src/lib.rs` uses a `NoopMailer` until a `RESEND_API_KEY` secret is set, and its README says double opt-in is off; the sites set `data-double-opt-in="false"` or promise only "one email when early access opens". Cratefield is the exception (below). |
| SupportGenius error and bug intake (`bug-reports`, planned) | [SupportGenius/core#65](https://github.com/SupportGenius/core/issues/65) (intake API) and [Cratefield/harness#692](https://github.com/Cratefield/harness/issues/692) (`module-error-reporting`, "every venture built on Cratefield"). Listed for every venture that runs on, or is being built on, Cratefield. |
| Polar payments (`payments`, planned) | Billing issues filed 2026-10-02/03 for the nine approved ventures, e.g. [Sealbin/sealbin#16](https://github.com/Sealbin/sealbin/issues/16), [Colonizer-dev/harness#941](https://github.com/Colonizer-dev/harness/issues/941), [Livingbrain-wiki/livingbrain#32](https://github.com/Livingbrain-wiki/livingbrain/issues/32), [Cratefield/harness#690](https://github.com/Cratefield/harness/issues/690) (`adapter-polar`); the rest are in private repos (Owlpost, Keep Shipping, promptdecode, release.show) or decided without an issue yet (SupportGenius). |
| Keep Shipping deploys (`deploys`, planned) | Keep Shipping's harness issue #172 (private), "Deploy every site and Worker from the console": "Each venture repo gets a `ship.ks` for its site". |

## Per venture

| Venture | Entry | Status | Evidence |
| :--- | :--- | :--- | :--- |
| FZ-003 Yoginini | Cratefield framework | planned | Private backend README: "It will run on the harness … That wiring is not here yet"; its accounts crate already depends on `cratefield-core`. |
| FZ-004 Cratefield | Resend email | live | Website `COPY.md` changelog 2026-09-07 (c): the waitlist at `api.cratefield.com` sends double opt-in mail from `no-reply@send.cratefield.com`, verified end to end against the live Resend API. The site's `assets/cf.js` posts to that Worker. |
| FZ-004 Cratefield | Owlpost email | planned | [Cratefield/harness#668](https://github.com/Cratefield/harness/issues/668), [#681](https://github.com/Cratefield/harness/issues/681) (`adapter-owlpost`). |
| FZ-006 Colonizer | Cratefield framework | live | Waitlist Worker (above); [`crates/colonizer/Cargo.toml`](https://github.com/Colonizer-dev/harness/blob/main/crates/colonizer/Cargo.toml) depends on `cratefield-module-telemetry`. |
| FZ-006 Colonizer | promptdecode screening | live | [`docs/prompt-screening.md`](https://github.com/Colonizer-dev/harness/blob/main/docs/prompt-screening.md): the `screen` module, provider `promptdecode`, a built-in decoder for the tag block, bidi controls and variation selectors, run before every push and pull request ([#320](https://github.com/Colonizer-dev/harness/issues/320), completed). It is a built-in decoder for promptdecode's classes, not a call to the promptdecode service; the note says so. |
| FZ-006 Colonizer | Sealbin handoffs | planned | [Colonizer-dev/harness#835](https://github.com/Colonizer-dev/harness/issues/835). |
| FZ-007 FindsYou.work | Stripe payments | planned | Private app `Cargo.toml`: `cratefield-adapter-stripe`, "the `Payments` port the paywall (#16) requires". |
| FZ-008 SupportGenius | Cratefield framework | planned | [SupportGenius/core `Cargo.toml`](https://github.com/SupportGenius/core/blob/main/Cargo.toml) on `cratefield-core` 0.6; `api.supportgeni.us` does not answer and the site's form is `data-open="false"`. |
| FZ-008 SupportGenius | promptdecode screening | planned | [SupportGenius/core#65](https://github.com/SupportGenius/core/issues/65): "PromptDecode screening on free text". |
| FZ-012 Keep Shipping | Cratefield framework | planned | Private harness: `ventures/keepshipping/Cargo.toml` on `cratefield-module-waitlist`; epic #144 "hosted parts as a Cratefield venture"; `api.keepshipping.run` does not answer. |
| FZ-013 Owlpost | Cratefield framework | live (staging) | Private backend README: "Rust, consumed as a Cratefield venture"; `Cargo.toml` on `cratefield-core` 0.6; "Staging is deployed on workers.dev … Production (`api.owlpost.to`) is not deployed yet." |
| FZ-013 Owlpost | Amazon SES | live (receiving, staging) | Private backend README: "SES receiving live for `agents.owlpost.to` (AWS account …0903, eu-west-1)"; `tools/ses-receiving.sh`. Sending through SES is built but not public. |
| FZ-015 ratecla.im | Cratefield framework | planned | Private backend `Cargo.toml` on `cratefield-core` 0.6; `api.ratecla.im` does not answer. |
| FZ-016 Sealbin | Owlpost email | planned | [Sealbin/sealbin#45](https://github.com/Sealbin/sealbin/issues/45) (agent inboxes via Owlpost). |
| FZ-016 Sealbin | promptdecode screening | planned | [Sealbin/sealbin#46](https://github.com/Sealbin/sealbin/issues/46). |
| FZ-017 release.show | Owlpost email | planned | Product issues #41 (digests) and #42 (transactional notices), private repo. |
| FZ-017 release.show | promptdecode screening | planned | Product issue #10, private repo. |
| FZ-018 Living Brain | Cratefield framework | planned | [Cargo.toml](https://github.com/Livingbrain-wiki/livingbrain/blob/main/Cargo.toml) on the harness; website README: the waitlist Worker is "Not deployed". |
| FZ-018 Living Brain | Colonizer agents | planned | [#22](https://github.com/Livingbrain-wiki/livingbrain/issues/22), "Epic 3: Agents, Colonizer, Owlpost and the 3D brain": "Colonizer colonies do the bigger jobs"; the "open a pull request" clause comes from the venture's own `desc` in `assets/fz-data.js`: "Bigger jobs would go to a Colonizer colony that returns a pull request" (2026-10-05). |
| FZ-018 Living Brain | Owlpost email | planned | [#23](https://github.com/Livingbrain-wiki/livingbrain/issues/23), [#28](https://github.com/Livingbrain-wiki/livingbrain/issues/28), [#29](https://github.com/Livingbrain-wiki/livingbrain/issues/29). |
| FZ-018 Living Brain | SupportGenius support | planned | [#51](https://github.com/Livingbrain-wiki/livingbrain/issues/51). |
| FZ-018 Living Brain | promptdecode screening | planned | [#50](https://github.com/Livingbrain-wiki/livingbrain/issues/50). |
| FZ-020 Tokker | Cratefield framework | planned | [Tokker-dev/tokker#15](https://github.com/Tokker-dev/tokker/issues/15) (`tokker-worker` on the harness), [#16](https://github.com/Tokker-dev/tokker/issues/16); README: "Nothing is deployed." |
| FZ-020 Tokker | Colonizer agents | planned | README "How it stays true": scheduled Colonizer loops; [#39](https://github.com/Tokker-dev/tokker/issues/39)–[#42](https://github.com/Tokker-dev/tokker/issues/42) (the loops), [#44](https://github.com/Tokker-dev/tokker/issues/44) ("Turn the loops on", open). |
| FZ-020 Tokker | Owlpost email | planned | [#17](https://github.com/Tokker-dev/tokker/issues/17) (waitlist confirmation), [#48](https://github.com/Tokker-dev/tokker/issues/48) (alerts), [#49](https://github.com/Tokker-dev/tokker/issues/49) (weekly email). |
| FZ-020 Tokker | Polar payments | planned | [#57](https://github.com/Tokker-dev/tokker/issues/57), [#58](https://github.com/Tokker-dev/tokker/issues/58) (paid API tier, label `later`). |

## Left out on purpose

- **Resend for Undercover Rockstars, VibeCaddie and Yoginini.** Their Pages
  Functions call Resend when `RESEND_API_KEY` is set, but nothing in their
  repos shows the key is set, so no live claim is made.
- **Resend for the other waitlists.** The adapter is compiled in, but the
  mailer is a no-op until a key is set (above).
- **Stripe for Undercover Rockstars.** The waitlist function can read a payment
  link, but nothing can be bought, so there is no payments entry.
- **Owlpost's own inbound screening** is Owlpost's own code, not promptdecode.
