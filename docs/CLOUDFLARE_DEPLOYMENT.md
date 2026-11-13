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
| Worker / Custom Domain | PASS — Worker `frorlancee-website` đang chạy trên Custom Domain `frorlanceedev.id.vn`; bản hiện tại `6828e1c1-463f-46c3-8867-2d2e576889b0` (Secret Change sau deploy `8478eb7c-0154-4117-a6a3-ea0e7019cf0e`). Mã nguồn production tương ứng commit `f5d253d19bbcafb57a817bc88ac7d85c52b775aa` trên `main`. |
| Secret production | PASS — `EMDASH_ENCRYPTION_KEY` đã cài bằng Wrangler Secret; chỉ xác minh tên và loại `secret_text`, không đọc giá trị. Bản phục hồi local được DPAPI bảo vệ tại `.wrangler/secrets/emdash-production-key.dpapi` (ignored, gắn với Windows user/máy hiện tại). Owner còn cần lưu bản khôi phục độc lập trong password/secret manager trước khi lưu plugin credentials. Key local trong `.env` không dùng chung cho production. |
| HTTPS và Access runtime | PASS — TLS hợp lệ; request HTTPS ẩn danh tới `/` và `/_emdash/admin/setup` đều trả `302` tới Cloudflare Access login. Không theo redirect và không gửi Access cookie. |
| URL có thể truy cập Worker | PASS — Custom Domain duy nhất của Worker là `frorlanceedev.id.vn`; `workers.dev` và Worker Preview URLs đều tắt; zone không có Workers route nào khác. |
| GitHub Workers Builds | Chưa kết nối. Mục dưới đây ghi cấu hình yêu cầu cho `main`, tắt preview builds. |

Access app/policy hiện đã được xác minh: hostname gốc không giới hạn path; policy duy nhất là Allow với Include Email của owner, không gắn Bypass. Giữ Access bật cho tới khi owner tạo Admin/passkey và các kiểm tra CMS hoàn tất. Chưa mở website công khai.

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

## Kết quả kiểm tra sau deploy

1. Wrangler deployments/versions API xác nhận deployment mới; version hiện tại là `6828e1c1-463f-46c3-8867-2d2e576889b0` sau khi cài secret.
2. Cloudflare Worker Domains API trả đúng một Custom Domain cho Worker: `frorlanceedev.id.vn`, enabled; `previews_enabled=false`. Script subdomain API xác nhận `workers_dev_enabled=false` và `worker_previews_enabled=false`; zone Workers Routes API trả 0 route.
3. DNS phân giải và HTTPS trả lời với TLS validation thành công; Custom Domain được bật và Cloudflare cấp certificate.
4. Version API xác nhận binding D1 `DB` → `ef7bb509-01a5-43ed-a39d-23afb2348f94`, R2 `MEDIA` → `frorlancee-media`, KV `SESSION` → `09eb75a300c849e79788e9718b4fc9f6`, cùng `IMAGES`, `ASSETS`, `EMDASH_SITE_URL` và secret `EMDASH_ENCRYPTION_KEY`.
5. Request HEAD ẩn danh, không cookie, tới `/` và `/_emdash/admin/setup` đều nhận `302` tới Cloudflare Access login. Setup Wizard không được trả về cho request chưa xác thực.
6. Owner chưa đăng nhập để tạo Admin. Hướng dẫn setup bên dưới áp dụng sau khi owner sẵn sàng; website tiếp tục nằm sau Access.

Chưa có kiểm tra runtime đã xác thực bằng tài khoản owner. Không chạy Setup Wizard cho tới khi owner truy cập theo hướng dẫn sau đây; không tắt Access trước khi CMS checks hoàn tất.

## GitHub Workers Builds

Sau khi production Worker tồn tại, kết nối repository `HaoLe2710/frorlancee.dev` trong Worker → **Settings → Builds**:

- Production branch: `main`
- Root directory: repository root
- Dependency installation: Workers Builds detects `pnpm-lock.yaml`; `package.json` pins `pnpm@11.9.0` (there is no install-command field in this Worker Builds form).
- Build command: `pnpm typecheck && pnpm build`
- Deploy command: `pnpm exec wrangler deploy --config dist/server/wrangler.json`
- Preview builds: **disabled** (`previews_enabled: false`); không tạo Preview deployment/URL.

Sau kết nối, đọc lại Build settings và xác nhận GitHub repository, branch, commands và preview state. Chỉ push `main` sau khi review diff/checks vì commit production sẽ tự deploy. Không bật GitHub PR previews.

Nếu `HaoLe2710/frorlancee.dev` không xuất hiện trong danh sách repo của Cloudflare, cập nhật quyền cài đặt GitHub App **Cloudflare Workers and Pages** để cấp quyền chỉ cho repo này; không chọn toàn bộ repository. Kết nối repo và tạo build token sẽ cho phép Cloudflare đọc source/build đầu vào và deploy Worker theo các lệnh đã cấu hình.

## Tham khảo

- [EmDash trên Cloudflare](https://docs.emdashcms.com/deployment/cloudflare/)
- [EmDash quản lý secrets](https://docs.emdashcms.com/deployment/secrets/)
- [EmDash database and read replication](https://docs.emdashcms.com/deployment/database/)
- [Cloudflare Worker Custom Domains](https://developers.cloudflare.com/workers/configuration/routing/custom-domains/)
- [Wrangler configuration](https://developers.cloudflare.com/workers/wrangler/configuration/)
- [Workers Builds branch controls](https://developers.cloudflare.com/workers/ci-cd/builds/build-branches/)
