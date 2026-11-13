# Báo cáo kiểm thử và release

Ngày: **2026-11-13**. Báo cáo phân biệt kiểm tra local với bằng chứng Cloudflare production.

## Production preflight hiện tại

| Hạng mục | Kết quả | Bằng chứng / giới hạn |
|---|---|---|
| Wrangler account và domain zone | **PASS** | Cloudflare API trả zone `frorlanceedev.id.vn` trạng thái `active`; account ID khớp account của Wrangler. |
| Cloudflare Access | **PASS — cấu hình** | Dashboard xác nhận app trên hostname root, policy duy nhất `Frorlancee Owner Only`, action Allow, một Include Email rule cho owner. Không có Bypass policy gắn vào app. Chưa có Worker request để kiểm tra chặn tại runtime. |
| Production bindings | **PASS — đã provision** | D1 `frorlancee-db` ID `ef7bb509-01a5-43ed-a39d-23afb2348f94`; R2 private bucket `frorlancee-media`; KV `SESSION` ID `09eb75a300c849e79788e9718b4fc9f6`. |
| Astro/EmDash config | **PASS** | Generated Wrangler config có Custom Domain, `workers_dev=false`, `preview_urls=false`, `EMDASH_SITE_URL`, D1/R2/KV, `IMAGES`, `ASSETS`. |
| `pnpm typecheck` | **PASS** | Node.js 22.23.4 x64, pnpm 11.9.0; Astro check: 30 files, 0 errors, 0 warnings, 0 hints. |
| `pnpm build` | **PASS** | Astro server build hoàn tất. Có warning chunk >500 kB thuộc nhóm client/admin assets; không chặn build. |
| Wrangler production dry run | **PASS** | `wrangler 4.160.1 deploy --dry-run --config dist/server/wrangler.json`; bundle 20,401.69 KiB (5,460.43 KiB gzip). Output liệt kê D1 `DB`, R2 `MEDIA`, KV `SESSION`, `IMAGES`, `ASSETS`, và URL production. Dry run không deploy. |
| Production encryption key | **TẠO — CHƯA UPLOAD** | Production key riêng đã sinh, định dạng được kiểm tra và bản local được DPAPI bảo vệ tại `.wrangler/secrets/emdash-production-key.dpapi` (ignored, gắn với Windows user/máy hiện tại). Chưa có Worker để nhận secret. Owner cần lưu thêm bản khôi phục độc lập trong password/secret manager trước khi lưu plugin credentials. |
| Production deployment / DNS / HTTPS | **CHƯA KIỂM TRA** | Chưa chạy `wrangler deploy`; Custom Domain, certificate và runtime chưa được xác minh. |
| Anonymous Access runtime check | **CHƯA KIỂM TRA** | Cần kiểm tra `/` và `/_emdash/admin/setup` sau khi route được tạo. |
| First Admin / passkey / CMS CRUD | **CHỜ OWNER** | Owner phải hoàn tất Setup Wizard và tạo passkey thật trên domain production trước khi CMS flows có thể kiểm thử. |
| GitHub Workers Builds | **CHƯA KẾT NỐI** | Yêu cầu branch `main`, preview builds disabled. |

## Local QA đã có từ lần kiểm tra trước

Tài liệu QA hiện có ghi nhận 18/18 tổ hợp route/viewport, không có lỗi browser/network trên sáu public routes, và không tải Admin JavaScript trên public pages. Ảnh nằm trong `docs/qa/`; lần kiểm tra này không chạy lại visual QA hoặc browser smoke.

## Còn cần xác minh sau deploy

- Worker deployment và bindings đang hoạt động trên Cloudflare.
- DNS/TLS/HTTPS cho `frorlanceedev.id.vn`.
- Access chặn request ẩn danh trước Setup Wizard.
- Owner sign-in/passkey, post/project CRUD, Site Settings, và R2 media upload.
- GitHub Workers Builds production branch `main`, với preview builds tắt.
- Public release chỉ sau khi Admin/CMS checks pass.
