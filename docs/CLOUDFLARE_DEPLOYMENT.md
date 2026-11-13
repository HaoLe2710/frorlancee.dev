# Triển khai Cloudflare

## Trạng thái đã xác minh — 2026-11-13

| Hạng mục | Trạng thái |
|---|---|
| Wrangler authentication | PASS — CLI xác nhận đã đăng nhập và đọc được account. |
| D1 | BLOCKED — danh sách remote không có `frorlancee-db`; các database khác được giữ nguyên. |
| R2 | BLOCKED — `wrangler r2 bucket list` trả về Cloudflare code `10042`: cần bật R2 subscription trong Dashboard. Không có bucket R2 nào được xác minh; không thanh toán hoặc bật dịch vụ thay chủ sở hữu. |
| Worker | BLOCKED — truy vấn deployment của `frorlancee-website` trả `10007`, Worker chưa tồn tại. |
| `SESSION` KV | Chưa có ID; Astro thêm binding này vào generated config. |
| Domain | BLOCKED — `frorlanceedev.id.vn` chưa có bản ghi A/AAAA/CNAME trả về khi kiểm tra; project chưa khai báo route/custom domain. Chưa xác minh domain thuộc account. |
| Encryption key | Tên `EMDASH_ENCRYPTION_KEY` có trong `.env` local bị ignore; không có Worker remote để kiểm tra/deploy secret. Giá trị không được đọc hoặc ghi vào docs. |
| Build dry run | PASS — `wrangler deploy --dry-run --config dist/server/wrangler.json` bundle thành công (20,400.75 KiB upload estimate, 5,458.79 KiB gzip estimate). Đây không phải deployment hoặc runtime check. |

Không deploy staging/production khi R2 chưa enabled, resource IDs chưa provisioned, và chưa có người sở hữu sẵn sàng claim Admin. Existing D1 databases/Workers không được dùng lại.

## Kích hoạt R2

Chủ tài khoản mở Cloudflare Dashboard → **Storage & databases → R2 → Overview** và hoàn tất subscription nếu muốn tiếp tục. CLI báo R2 chưa enabled; không có bucket `frorlancee-media` được tạo. Cloudflare nêu R2 có free monthly usage nhưng usage có thể được tính phí. Không chia sẻ Access Key/Secret Key; Wrangler dùng OAuth trực tiếp cho các thao tác R2.

Sau khi chủ tài khoản bật R2:

1. Chạy `pnpm exec wrangler r2 bucket list` để xác nhận dịch vụ đã hoạt động.
2. Tạo bucket staging riêng `frorlancee-staging-media` rồi ghi nhận tên/region; không dùng bucket của project khác.
3. Xác minh tên bucket và binding `MEDIA` khớp config staging.
4. Dùng Admin để upload file thử trên staging, kiểm tra alt text, render qua `Image`, và xóa file thử sau khi xác minh.

Hướng dẫn chính thức: [Cloudflare R2 Get started](https://developers.cloudflare.com/r2/get-started/) và [EmDash storage](https://docs.emdashcms.com/deployment/storage/).

## Tạo staging độc lập

Sau khi xác nhận account, R2, và người chịu trách nhiệm claim setup:

1. Dùng tên mới cho Worker (`frorlancee-website-staging`), D1 (`frorlancee-staging-db`), R2 (`frorlancee-staging-media`), và KV namespace phiên. Không trỏ staging về database/media của site khác.
2. Provision bindings và ghi IDs vào môi trường `staging`; environments của Wrangler không tự kế thừa toàn bộ bindings. Xác nhận generated `dist/server/wrangler.json` hoặc `.wrangler/deploy/config.json` trỏ tới đúng resource IDs.
3. Đặt `EMDASH_ENCRYPTION_KEY` qua Worker secret command; nếu dùng EmDash Cloudflare Access, cấu hình provider và secret `CF_ACCESS_AUDIENCE` theo [EmDash Cloudflare guide](https://docs.emdashcms.com/deployment/cloudflare/). Không ghi key vào `wrangler.jsonc`.
4. Set `EMDASH_SITE_URL` bằng hostname staging trước khi tạo passkey.
5. Cài dependencies, chạy type check/build, rồi dry-run config đã merge:

   ```powershell
   pnpm install --frozen-lockfile
   pnpm typecheck
   pnpm build
   pnpm exec wrangler deploy --dry-run --config dist/server/wrangler.json
   ```

6. Chỉ khi dry-run, binding IDs, Admin access plan, và người chủ sở hữu đều sẵn sàng, triển khai staging bằng `pnpm exec wrangler deploy --config dist/server/wrangler.json`.
7. Chủ sở hữu hoàn tất Setup Wizard ngay trên staging hostname bằng passkey thật; không để Worker public ở trạng thái wizard chưa claim. Nếu dùng Access, kiểm tra Access policy bảo vệ `/_emdash` và API Admin, và kiểm tra phản hồi JWT/runtime theo docs.
8. Chạy CRUD, preview/publish/unpublish, homepage/service/contact settings, và media upload qua Admin UI. Chạy lại Playwright smoke trên staging; lưu report tách riêng.

## Production và domain

Chưa có bằng chứng domain thuộc account này. Trước khi nối `frorlanceedev.id.vn`, owner xác nhận ownership/DNS zone, chọn hostname xác thực, cấu hình domain/Worker route, TLS, redirects, and `EMDASH_SITE_URL`, rồi kiểm tra DNS/HTTP/TLS. Không thêm domain route trước khi quyền quản lý được xác nhận.

Production gate: staging CRUD/media PASS; owner-run first Admin setup plan đã diễn tập; wizard không bị public trước khi owner claim; bindings/secrets verified; backup and restore rehearsal complete; domain ownership/DNS/TLS verified; release/rollback artifact recorded. Chỉ sau các bước đó thực hiện `wrangler deploy` production.

Tham khảo [EmDash Cloudflare deployment](https://docs.emdashcms.com/deployment/cloudflare/) và [Cloudflare Workers EmDash guide](https://developers.cloudflare.com/workers/framework-guides/web-apps/emdash/).
