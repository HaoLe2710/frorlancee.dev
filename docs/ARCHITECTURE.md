# Kiến trúc Frorlancee Dev

## Tổng quan

Website chạy Astro ở chế độ server (`output: "server"`) trên Cloudflare Workers. EmDash cung cấp CMS và Admin UI; các trang Astro đọc nội dung từ EmDash tại thời điểm render.

```text
Browser
  └─ Cloudflare Worker (src/worker.ts)
      ├─ Astro SSR pages (src/pages/)
      ├─ EmDash Admin / API (/_emdash/*)
      ├─ D1 binding DB       → schema, entries, users, settings
      ├─ R2 binding MEDIA    → media files
      ├─ KV binding SESSION  → session state (added to generated Worker config)
      ├─ Images binding      → Cloudflare image transformations
      └─ ASSETS binding      → built client assets
```

`astro.config.mjs` registers the Cloudflare adapter, React for the EmDash admin, EmDash, the D1 adapter (`DB`, automatic session handling), and R2 storage (`MEDIA`). `src/live.config.ts` is EmDash/Astro wiring and is intentionally left as template boilerplate.

## Request and content flow

- `src/pages/` contains the server-rendered home, services, projects, blog, about, contact, privacy, RSS, and 404 routes.
- Route loaders call `getEmDashCollection()` or `getEmDashEntry()`; publication state is handled by EmDash. Public pages do not hydrate React or download the Admin bundle.
- `src/layouts/Base.astro` renders shared metadata, menu, header, footer, and CMS contributions.
- `seed/seed.json` defines six collections and the initial site model/content. The local D1 seed currently has one homepage record, four services, and the About and Privacy pages. Projects, posts, and contact links have no published sample records.
- Project and post URLs are `/projects/{slug}` and `/blog/{slug}`. About and Privacy are records in `pages` at `/about` and `/privacy`.
- `src/worker.ts` exports the scheduled handler. The Wrangler cron invokes it to publish scheduled content.

## Cloudflare bindings

`wrangler.jsonc` names the app `frorlancee-website`, the D1 database `frorlancee-db`, and the R2 bucket `frorlancee-media`. Resource IDs are not yet present. Astro's generated `dist/server/wrangler.json` adds `ASSETS`, `IMAGES`, and `SESSION`; the generated `SESSION` namespace also has no provisioned ID in the current account.

The configuration is a binding contract, not proof that remote resources exist. As of 2026-11-13, no Worker named `frorlancee-website` or D1 database named `frorlancee-db` was found, R2 bucket listing is unavailable because R2 is not enabled, and the requested hostname is not configured in this project. See [Cloudflare deployment](CLOUDFLARE_DEPLOYMENT.md).

## Local versus deployed data

Astro development and preview use local Cloudflare emulation. The local D1/R2 state under `.wrangler/` is ignored by Git. It is separate from any Cloudflare remote account resource. A local preview does not prove a remote binding, media upload, or deployment is healthy.

## Useful source locations

| Area | Files |
|---|---|
| Astro/EmDash/Cloudflare configuration | `astro.config.mjs`, `wrangler.jsonc`, `src/worker.ts` |
| Schema and initial content | `seed/seed.json` |
| Shared site frame and styles | `src/layouts/Base.astro`, `src/styles/` |
| Public routes | `src/pages/` |
| Content helpers | `src/lib/content.ts` |
| Browser visual QA | `scripts/qa-visual.mjs`, `docs/qa/` |

## References

- [EmDash on Cloudflare Workers](https://developers.cloudflare.com/workers/framework-guides/web-apps/emdash/)
- [EmDash deployment to Cloudflare](https://docs.emdashcms.com/deployment/cloudflare/)
