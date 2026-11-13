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
      ├─ KV binding SESSION  → Astro server session state
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

`wrangler.jsonc` declares Worker `frorlancee-website`, the custom domain `frorlanceedev.id.vn`, `EMDASH_SITE_URL`, and `workers_dev: false` / `preview_urls: false`. Production bindings are D1 `DB` → `frorlancee-db` (`ef7bb509-01a5-43ed-a39d-23afb2348f94`), R2 `MEDIA` → private bucket `frorlancee-media`, and Astro session KV `SESSION` (`09eb75a300c849e79788e9718b4fc9f6`). Astro's generated `dist/server/wrangler.json` adds `IMAGES` and `ASSETS`.

The Wrangler option `session: "auto"` in the EmDash D1 adapter configures D1 bookmark consistency; it is distinct from Astro's KV `SESSION` binding. D1 `read_replication.mode` remains `disabled`; current EmDash documentation states requests use the nearby primary when replicas are disabled, so this release does not enable replicas. Cloudflare Access currently protects the root hostname for first Admin setup. See [Cloudflare deployment](CLOUDFLARE_DEPLOYMENT.md) for live provisioning and deployment status.

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
