# Báo cáo kiểm thử và release

Ngày: **2026-11-13**. Báo cáo phân biệt kiểm tra local với bằng chứng Cloudflare production.

## Production preflight hiện tại

| Hạng mục | Kết quả | Bằng chứng / giới hạn |
|---|---|---|
| Wrangler account và domain zone | **PASS** | Cloudflare API trả zone `frorlanceedev.id.vn` trạng thái `active`; account ID khớp account của Wrangler. |
| Cloudflare Access | **PASS — policy và runtime** | Dashboard xác nhận app trên hostname root, policy duy nhất `Frorlancee Owner Only`, action Allow, một Include Email rule cho owner; không có Bypass. Request HEAD ẩn danh không cookie tới `/` và `/_emdash/admin/setup` đều nhận `302` tới Access login; không theo redirect. |
| Production bindings | **PASS — đã provision và gắn vào Worker** | Version API xác nhận D1 `DB` / `frorlancee-db` ID `ef7bb509-01a5-43ed-a39d-23afb2348f94`; R2 `MEDIA` / private bucket `frorlancee-media`; KV `SESSION` ID `09eb75a300c849e79788e9718b4fc9f6`; cùng `IMAGES` và `ASSETS`. |
| Astro/EmDash config | **PASS** | Generated Wrangler config có Custom Domain, `workers_dev=false`, `preview_urls=false`, `EMDASH_SITE_URL`, D1/R2/KV, `IMAGES`, `ASSETS`. |
| `pnpm typecheck` | **PASS** | Node.js 22.23.4 x64, pnpm 11.9.0; Astro check: 30 files, 0 errors, 0 warnings, 0 hints. |
| `pnpm build` | **PASS** | Astro server build hoàn tất. Có warning chunk >500 kB thuộc nhóm client/admin assets; không chặn build. |
| Wrangler production dry run | **PASS** | `wrangler 4.160.1 deploy --dry-run --config dist/server/wrangler.json`; bundle 20,401.69 KiB (5,460.43 KiB gzip). Output liệt kê D1 `DB`, R2 `MEDIA`, KV `SESSION`, `IMAGES`, `ASSETS`, và URL production. Dry run không deploy. |
| Production encryption key | **PASS — đã cài** | `EMDASH_ENCRYPTION_KEY` xuất hiện trong Worker Secret list dưới dạng `secret_text`; giá trị không được đọc/in. Bản local được DPAPI bảo vệ tại `.wrangler/secrets/emdash-production-key.dpapi` (ignored, gắn với Windows user/máy hiện tại). Owner cần lưu bản khôi phục độc lập trong password/secret manager trước khi lưu plugin credentials. |
| Production deployment / DNS / HTTPS | **PASS** | Worker `frorlancee-website` bản hiện tại `6828e1c1-463f-46c3-8867-2d2e576889b0`; Custom Domain enabled; DNS phân giải; TLS validation thành công. |
| URL không qua Access | **PASS — không tìm thấy** | Worker Domains API có duy nhất hostname `frorlanceedev.id.vn`; `workers.dev`, Worker Preview URLs tắt; zone Workers Routes API trả 0 route. |
| Anonymous Access runtime check | **PASS** | HEAD `/` và `/_emdash/admin/setup` không cookie đều trả `302` tới Cloudflare Access login; Setup Wizard không lộ cho khách ẩn danh. |
| First Admin / passkey / CMS CRUD | **CHỜ OWNER** | Owner phải hoàn tất Setup Wizard và tạo passkey thật trên domain production trước khi CMS flows có thể kiểm thử. |
| GitHub Workers Builds | **CHỜ ỦY QUYỀN GITHUB** | Cần kết nối repository `HaoLe2710/frorlancee.dev`, production branch `main`; previews phải tắt. |

## Local QA đã có từ lần kiểm tra trước

Tài liệu QA hiện có ghi nhận 18/18 tổ hợp route/viewport, không có lỗi browser/network trên sáu public routes, và không tải Admin JavaScript trên public pages. Ảnh nằm trong `docs/qa/`; lần kiểm tra này không chạy lại visual QA hoặc browser smoke.

## Còn cần hoàn tất trước khi mở công khai

- Owner sign-in/passkey, post/project CRUD, Site Settings, và R2 media upload.
- Lưu bản khôi phục độc lập của encryption key vào password/secret manager owner.
- GitHub Workers Builds production branch `main`, với preview builds tắt.
- Public release chỉ sau khi Admin/CMS checks pass.
