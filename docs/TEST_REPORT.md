# Báo cáo kiểm thử

Ngày kiểm tra: **2026-11-13**. Local verification dùng Node.js 22.23.4, Playwright 1.64.1 và managed Chromium 156.0.8078.4. Không có deployment production/staging.

## Kết quả

| Hạng mục | Kết quả | Evidence / giới hạn |
|---|---|---|
| Visual QA | **PASS** | 18/18 tổ hợp route/viewport qua `docs/qa/visual-report-preview.json`. |
| Responsive | **PASS** | 390×844, 768×1024, 1440×900; không horizontal overflow; nav/mobile breakpoint và CTA hiện đúng. |
| Mobile navigation | **PASS** | Mở bằng click, đóng bằng Escape, đóng sau khi chọn link. |
| Images | **PASS — vacuous** | Không có image trong CMS seed; không tìm thấy ảnh hỏng, nhưng chưa kiểm thử ảnh media thật. |
| Browser errors/network | **PASS** | Không có console/page errors, failed requests, hoặc HTTP >=400 trên 18 public route runs. |
| Public JavaScript | **PASS** | Production preview không yêu cầu script trên 6 public routes. Admin/setup route tải EmDash assets lớn; chúng không được public pages yêu cầu. |
| Admin Setup | **BLOCKED** | `/_emdash/admin` trả 200 và đến `/_emdash/admin/setup`; wizard hiển thị, nhưng owner chưa tạo account/passkey. Không dùng auth bypass. |
| Admin CRUD / settings | **BLOCKED** | Chưa có đăng nhập chủ sở hữu; chưa tạo/edit/publish/unpublish post/project hoặc chỉnh homepage/service/contact bằng Admin UI. |
| Media upload / R2 | **BLOCKED** | R2 CLI trả code 10042; không có upload test và không có R2 remote bucket. |
| Type check | **PASS — direct CLI** | Astro check dùng Node.js 22.23.4: 30 files, 0 errors, 0 warnings, 0 hints. Lệnh `pnpm typecheck` hiện dùng nhầm Node 22.18 trong PATH và bị Astro từ chối; xem giới hạn bên dưới. |
| Production build | **PASS** | `pnpm build` succeeds. Warning remains for large Admin/client chunks; see performance section. |
| Wrangler dry run | **PASS** | `wrangler deploy --dry-run --config dist/server/wrangler.json` builds bundle; it does not create bindings or deploy. |
| Cloudflare deployment | **BLOCKED** | Worker does not exist; D1/R2/SESSION IDs and production secret are not provisioned. |
| Domain | **BLOCKED** | No usable DNS answer or Worker custom-domain route verified for `frorlanceedev.id.vn`. |
| Documentation | **PASS** | All nine requested files are present in `docs/`. |

## Visual evidence

The production-preview report covers Home, Services, Projects, Blog, About, and Contact at all three target sizes. Screenshots are full-page PNGs under `docs/qa/screenshots/`; see [QA README](qa/README.md). The seeded empty states for projects/blog/contact were confirmed as readable and intentional.

## Bundle analysis

`astro build` still emits the existing large-client-chunk warning. The largest files are EmDash/admin-facing client assets: `lib.DdRd4j3x.js` (~5.46 MiB), `PluginRegistry.BlfIfMvW.js` (~3.43 MiB), and a code editor chunk (~0.45 MiB). The installed `@emdash-cms/admin` package source map contains 329 modules; 324 map to that Admin package (about 3.45 MiB of unminified source content), with the Portable Text and content editor modules among the largest. This identifies the Admin package as the primary source category, not a byte-exact breakdown of Astro's generated chunks: deployment source maps are not emitted. The production preview browser requested the Admin chunks from `/_emdash/admin/setup`; the six public page routes requested no scripts. There is no client React hydration in public templates. The warning is therefore scoped to the Admin experience; no EmDash internals were modified or split.

## Local smoke coverage

- All six public pages returned HTTP 200 at three viewports.
- Earlier local HTTP smoke also confirmed `/rss.xml` and the expected redirect from legacy `/work`, plus the site 404 for a missing detail route.
- The preview server rendered the public homepage from local D1 emulation. This is not evidence of remote D1, R2, Cloudflare runtime, DNS, or production behavior.
- Public images remain unverified because the seed contains no media records.

## Git state

`git status --short --branch` cannot run: `D:\SideProject\frorlancee-dev` is not a Git repository. Therefore this report cannot identify a clean/dirty worktree or a source commit to use for rollback.

## Environment caveat

`pnpm` hiện trên máy này khởi chạy Node 22.18 dù runtime 22.23.4 đã có sẵn. Astro yêu cầu ít nhất 22.23.4. Khi chạy lệnh package, đặt đúng Node version ở đầu `PATH`; type check/build đã được xác minh bằng Astro CLI chạy dưới runtime tương thích. Không hạ `engines` để che khác biệt runtime.
