# Security checklist

## Bootstrap gate

- [x] `.env`, `.env.local`, `.dev.vars`, `.wrangler/`, and build output are ignored by Git.
- [x] Production zone `frorlanceedev.id.vn` is Active in the same Cloudflare account used by Wrangler.
- [x] Cloudflare Access app `Frorlancee Dev - Initial Setup` is configured on the root hostname with no path restriction.
- [x] The app has one attached policy: `Frorlancee Owner Only`, action `Allow`, one Include Email rule for the owner. No Bypass policy is attached.
- [x] R2 bucket is private; no public bucket domain is configured.
- [x] Wrangler configuration disables `workers.dev` and Preview/Version URLs.
- [ ] Confirm after deployment that anonymous `/` and `/_emdash/admin/setup` requests are stopped by Access before they reach EmDash.
- [ ] Set a production-only `EMDASH_ENCRYPTION_KEY` with `wrangler secret put`; record a separate recovery copy in the owner's password/secret manager.
- [ ] Owner creates the first EmDash Admin and registers a real passkey on `https://frorlanceedev.id.vn`.
- [ ] Verify sign-in, role permissions, content updates, Site Settings, and media upload before changing public access.

The owner's email address is intentionally omitted from repository documentation. Do not add secrets, Access cookies, API tokens, passkey material, or R2 credentials to source control, screenshots, CI logs, or chat.

## Owner: first Admin setup

After the production deployment, HTTPS check, secret installation, and anonymous Access check pass:

1. Open `https://frorlanceedev.id.vn/_emdash/admin/setup`.
2. Complete the Cloudflare Access login using the owner email allowed by `Frorlancee Owner Only`.
3. Create the first EmDash Admin and register a real passkey for `frorlanceedev.id.vn` using the browser/OS passkey prompt. Do not use a development bypass, import a passkey, or create the key on localhost.
4. Sign out and sign in again through `https://frorlanceedev.id.vn/_emdash/admin` to confirm the passkey works on the production hostname.
5. Tell the deployment operator when the Admin is ready for the requested CRUD, settings, and media checks. Keep the site behind Access until those checks pass.

Cloudflare Access login and the EmDash passkey are separate authentication steps. The app has not enabled EmDash's Cloudflare Access auth adapter; its built-in passkey authentication remains in place.

## Public release gate

Do not make the website public until the first Admin can sign in safely and the owner-approved release checks are complete. Before opening the public site, remove the root-hostname Access restriction only after confirming EmDash passkey protection for Admin/API remains active. Keep `workers.dev` and preview URLs disabled. Do not expose a public R2 bucket; public media must continue through the configured EmDash media flow.

For backups, preserve the D1 database, R2 objects, and every active encryption key together. Restoring the database without its corresponding encryption key can make stored plugin credentials unreadable.

## References

- [EmDash authentication](https://docs.emdashcms.com/guides/authentication/)
- [EmDash Cloudflare deployment](https://docs.emdashcms.com/deployment/cloudflare/)
- [EmDash secret management](https://docs.emdashcms.com/deployment/secrets/)
