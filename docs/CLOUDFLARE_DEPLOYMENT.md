# Triển khai production trên Cloudflare

Ngày ghi nhận: **2026-11-13**. Dự án triển khai thẳng production; không tạo staging, không đổi DNS email và không bật `workers.dev` hoặc preview URL.

## Trạng thái hiện tại

| Hạng mục | Trạng thái / bằng chứng |
|---|---|
| Wrangler account và zone | PASS — `wrangler whoami` xác nhận account hiện dùng; API Cloudflare trả đúng một zone `frorlanceedev.id.vn`, trạng thái `active`, cùng account ID. |
| Cloudflare Access | PASS — Dashboard có app `Frorlancee Dev - Initial Setup`, hostname gốc `frorlanceedev.id.vn`, không giới hạn path. App chỉ gắn policy `Frorlancee Owner Only` (Allow, một Include Email rule); không có policy Bypass gắn vào app. Email không được lưu trong tài liệu. |
| D1 | Đã tạo `frorlancee-db`, ID `ef7bb509-01a5-43ed-a39d-23afb2348f94`; `read_replication.mode=disabled` (không bật replica hoặc nâng cấp dịch vụ). |
| R2 | Đã tạo bucket private `frorlancee-media`, storage class Standard. Chưa bật public bucket domain. |
| KV phiên Astro | Đã tạo namespace `SESSION`, ID `09eb75a300c849e79788e9718b4fc9f6`. |
| Worker / Custom Domain | Chưa triển khai tại thời điểm ghi nhận này. Wrangler sẽ gắn Worker `frorlancee-website` vào Custom Domain trong lần deploy production đầu tiên. |
| Secret production | Đã sinh key production riêng; chưa cài vào Worker. Bản recovery local được DPAPI bảo vệ trong `.wrangler/secrets/emdash-production-key.dpapi` (ignored, gắn với Windows user/máy hiện tại); owner cần lưu thêm bản độc lập trong password/secret manager trước khi lưu plugin credentials. Key local trong `.env` không dùng chung cho production. |
| GitHub Workers Builds | Chưa kết nối. Mục dưới đây ghi cấu hình yêu cầu cho `main`, tắt preview builds. |

Không deploy nếu Access app/policy thay đổi, hostname bị bỏ khỏi app, hoặc policy xuất hiện Bypass. Owner hoàn tất Setup Wizard và đăng ký passkey thật trên domain sau khi Worker, HTTPS, Access và secret đã sẵn sàng.

## Binding và hostname

`wrangler.jsonc` là cấu hình gốc cho production:

- Worker: `frorlancee-website`
- Custom Domain: `frorlanceedev.id.vn` với `custom_domain: true`
- `workers_dev: false`
- `preview_urls: false`
- Runtime variable: `EMDASH_SITE_URL=https://frorlanceedev.id.vn`
- D1 binding `DB` → `frorlancee-db`
- R2 binding `MEDIA` → `frorlancee-media`
- Astro server session binding `SESSION` → namespace ID ở trên
- Astro adapter sinh binding `IMAGES` và `ASSETS` trong config tại `dist/server/wrangler.json`.
- Cron hiện có `* * * * *`; handler được khai báo trong `src/worker.ts` để xử lý scheduled publishing.

`SESSION` là KV namespace mà Astro Cloudflare adapter dùng cho server sessions. `session: "auto"` trong `d1({ binding: "DB", ... })` là D1 bookmark session riêng, không phải KV namespace. D1 hiện không có replica; tài liệu EmDash hiện tại cho biết khi không có replica, query vẫn chạy trên primary gần nhất kể cả khi dùng `session: "auto"`. Vì vậy không bật replication ở lần triển khai này.

Workers Custom Domain cần zone đang Active trong cùng Cloudflare account. Khi Wrangler triển khai Custom Domain, Cloudflare gắn hostname vào Worker và quản lý DNS record/certificate cần thiết. Không tạo record thủ công trùng lặp và không sửa MX/TXT email.

## Kiểm tra và deploy production

Chạy từ root repository với Node.js `22.23.4` và pnpm `11.9.0`:

```powershell
pnpm install --frozen-lockfile
pnpm typecheck
pnpm build
pnpm exec wrangler deploy --dry-run --config dist/server/wrangler.json
pnpm exec wrangler deploy --config dist/server/wrangler.json
```

Dry run chỉ xác nhận bundle/config ở local; nó không tạo deployment hoặc kiểm tra Worker runtime. Sau deploy, cài encryption key bằng Cloudflare Worker secret, không thêm vào Wrangler variables hoặc Git:

```powershell
pnpm exec wrangler secret put EMDASH_ENCRYPTION_KEY --config dist/server/wrangler.json
```

Dùng một production key riêng, đúng định dạng EmDash `emdash_enc_v1_` + 43 ký tự base64url. Bảo quản bản khôi phục trong password manager/secret manager của owner. Không in key ra terminal log, CI log, README hoặc chat. Xác nhận chỉ tên secret xuất hiện:

```powershell
pnpm exec wrangler secret list --config dist/server/wrangler.json
```

## Kiểm tra sau deploy

1. `wrangler deployments list --name frorlancee-website` cho thấy deployment mới.
2. Dashboard Worker Domains/Routes cho thấy duy nhất Custom Domain `frorlanceedev.id.vn`; không có `workers.dev` route.
3. Kiểm tra TLS/HTTPS và DNS của hostname.
4. Kiểm tra remote Worker settings/bindings: D1 `DB`, R2 `MEDIA`, KV `SESSION`, Astro `IMAGES`/`ASSETS`; không chỉ dựa vào `wrangler.jsonc`.
5. Gửi request chưa đăng nhập đến `/` và `/_emdash/admin/setup`. Cloudflare Access phải từ chối hoặc chuyển sang Access login; không được trả về EmDash Setup Wizard trước xác thực. Ghi nhận status/headers, không lưu Access cookie.
6. Chỉ owner đi qua Access bằng email được policy cho phép, sau đó tạo Admin/passkey trên hostname production.

Nếu domain/TLS chưa sẵn sàng, binding sai, request ẩn danh tới được EmDash, hoặc Access policy không đúng, dừng và sửa trước khi owner chạy Setup Wizard.

## GitHub Workers Builds

Sau khi production Worker tồn tại, kết nối repository `HaoLe2710/frorlancee.dev` trong Worker → **Settings → Builds**:

- Production branch: `main`
- Root directory: repository root
- Install command: `pnpm install --frozen-lockfile`
- Build command: `pnpm typecheck && pnpm build`
- Deploy command: `pnpm exec wrangler deploy --config dist/server/wrangler.json`
- Preview builds: **disabled** (`previews_enabled: false`); không tạo Preview deployment/URL.

Sau kết nối, đọc lại Build settings và xác nhận GitHub repository, branch, commands và preview state. Chỉ push `main` sau khi review diff/checks vì commit production sẽ tự deploy. Không bật GitHub PR previews.

## Tham khảo

- [EmDash trên Cloudflare](https://docs.emdashcms.com/deployment/cloudflare/)
- [EmDash quản lý secrets](https://docs.emdashcms.com/deployment/secrets/)
- [EmDash database and read replication](https://docs.emdashcms.com/deployment/database/)
- [Cloudflare Worker Custom Domains](https://developers.cloudflare.com/workers/configuration/routing/custom-domains/)
- [Wrangler configuration](https://developers.cloudflare.com/workers/wrangler/configuration/)
- [Workers Builds branch controls](https://developers.cloudflare.com/workers/ci-cd/builds/build-branches/)
