# Release checklist

## Local readiness

- [x] Schema and seed validated/applied locally.
- [x] Visual QA at mobile, tablet, and desktop sizes; screenshots saved.
- [x] `pnpm typecheck` passes.
- [x] `pnpm build` passes.
- [x] Cloudflare dry-run bundle completes.
- [x] Public pages avoid loading Admin JavaScript.
- [ ] Real project/post/contact content and image assets reviewed by owner.

## Required before staging

- [ ] Owner enables R2 in Cloudflare Dashboard and approves any billing/subscription step.
- [ ] Provision unique staging Worker, D1, R2, and KV/session resources; verify actual IDs/bindings.
- [ ] Set `EMDASH_ENCRYPTION_KEY` as a Worker secret; confirm key backup exists separately.
- [ ] Decide Admin authentication method and protect Admin/API; ensure owner can claim first setup immediately.
- [ ] Set staging `EMDASH_SITE_URL` before registering passkey.
- [ ] Deploy staging only after the above gates; do not reuse unrelated account resources.
- [ ] Complete Admin UI CRUD lifecycle for post and project: draft → edit → preview → publish → public verification → unpublish → 404 verification.
- [ ] Edit Homepage, Services, and Contact Links in Admin UI; verify public updates without rebuild.
- [ ] Upload and inspect a test media file via Admin; verify rendering, validation, and deletion.
- [ ] Re-run smoke tests against the deployed staging URL and inspect logs/errors.
- [ ] Record D1/media/key backup point and complete a restore rehearsal against isolated resources.

## Required before production

- [ ] Verify ownership of `frorlanceedev.id.vn`, DNS zone, Worker route, and TLS.
- [ ] Review all public copy, project claims, contact links, image licenses, SEO/canonical URLs, and privacy policy.
- [ ] Confirm first Admin is claimed on the production hostname and test authentication/role access.
- [ ] Confirm production D1/R2/KV IDs and secret values through Cloudflare control plane without exposing them.
- [ ] Have versioned source and a release artifact available. This workspace currently has no `.git`, so source rollback is not yet auditable.
- [ ] Rehearse recovery and rollback; never restore a database dump over a live production database without a reviewed recovery plan.
- [ ] Deploy, then verify public HTTP/TLS, content, Admin, media upload/read, scheduled handler, and rollback checkpoint.

**Release status:** not ready for staging or production. Current evidence and blockers are in [Cloudflare deployment](CLOUDFLARE_DEPLOYMENT.md) and [Test report](TEST_REPORT.md).
