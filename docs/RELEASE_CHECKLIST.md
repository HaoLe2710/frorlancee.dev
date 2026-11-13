# Checklist phát hành production

Triển khai thẳng production; không tạo staging hoặc preview deployment. Website tiếp tục được Cloudflare Access bảo vệ cho tới khi owner có Admin hoạt động và các kiểm tra CMS đạt yêu cầu.

## Trước deploy

- [x] Wrangler account khớp zone `frorlanceedev.id.vn` đang Active.
- [x] Access application bảo vệ hostname gốc; policy duy nhất là `Allow` với Include Email của owner; không có Bypass policy gắn vào app.
- [x] Đã tạo D1 production, R2 private bucket và Astro `SESSION` KV; ID nằm trong `wrangler.jsonc`.
- [x] `wrangler.jsonc` khai báo Worker, Custom Domain, `EMDASH_SITE_URL`, `workers_dev: false`, `preview_urls: false`.
- [x] `pnpm typecheck` thành công (Node.js 22.23.4 x64; 30 files, 0 errors/warnings/hints).
- [x] `pnpm build` thành công (còn cảnh báo chunk client/admin lớn).
- [x] Wrangler production dry run thành công với `dist/server/wrangler.json`; output có đúng D1/R2/KV/Images/Assets bindings.
- [x] Deployment Worker production hiển thị trên Cloudflare; version hiện tại `6828e1c1-463f-46c3-8867-2d2e576889b0`.
- [x] Cài production-only `EMDASH_ENCRYPTION_KEY` bằng Wrangler secret; giá trị không xuất hiện trong source/log.

## Sau deploy, trước khi owner setup

- [x] Custom Domain `frorlanceedev.id.vn` enabled, DNS phân giải, HTTPS/TLS hợp lệ.
- [x] Worker version có D1 `DB`, R2 `MEDIA`, KV `SESSION`, Astro `IMAGES`/`ASSETS`.
- [x] Không có URL Worker bỏ qua Access: `workers.dev` tắt, Preview URLs tắt, Custom Domain duy nhất, zone không có Workers route khác.
- [x] Request HEAD ẩn danh tới `/` và `/_emdash/admin/setup` chuyển tới Cloudflare Access login trước khi vào EmDash.
- [x] Production `EMDASH_SITE_URL` là `https://frorlanceedev.id.vn`.
- [ ] Owner lưu bản khôi phục độc lập của encryption key trong password/secret manager.

## Owner: tạo Admin đầu tiên

- [ ] Mở `https://frorlanceedev.id.vn/_emdash/admin/setup` và đăng nhập Cloudflare Access bằng email owner.
- [ ] Tạo EmDash Admin đầu tiên và đăng ký passkey thật bằng trình duyệt/OS trên hostname production.
- [ ] Đăng xuất, sau đó đăng nhập lại tại `https://frorlanceedev.id.vn/_emdash/admin` bằng passkey.
- [ ] Báo cho người vận hành khi Admin sẵn sàng để kiểm tra CMS. Giữ Access bật trong thời gian này.

## Kiểm tra CMS sau khi owner setup

- [ ] Xác nhận đăng nhập lần hai hoạt động và trang quản trị yêu cầu xác thực.
- [ ] Tạo, đọc và cập nhật một draft post cùng một draft project; xác minh trong Admin UI.
- [ ] Thử publish/unpublish trên dữ liệu kiểm tra và xác minh route khi Access tạm thời vẫn bật.
- [ ] Chỉnh Site Settings, kiểm tra kết quả trên trang public, rồi giữ lại cấu hình owner duyệt.
- [ ] Upload ảnh kiểm tra không nhạy cảm qua media library; xác minh hiển thị qua media flow dùng R2 private; ghi nhận media entry.
- [ ] Kiểm tra Worker logs để phát hiện lỗi binding, D1 migration, R2 hoặc auth.
- [ ] Xác nhận owner đã lưu bản khôi phục của encryption key.

Không xóa dữ liệu người dùng hiện có. Nếu cần xóa dữ liệu hoặc media kiểm tra, dùng luồng khôi phục/trash của CMS nếu có và xác nhận đúng đối tượng trước khi xóa vĩnh viễn.

## Mở website công khai

- [ ] Owner duyệt Admin, nội dung, Site Settings và media behavior đã kiểm chứng.
- [ ] Chỉ sau đó bỏ Access restriction ở hostname gốc. Giữ EmDash passkey cho `/_emdash/admin` và API; sau thay đổi, xác minh request Admin chưa đăng nhập vẫn phải đăng nhập.
- [ ] Kiểm tra homepage, project/article routes, canonical URLs, RSS, HTTPS và public media bằng request chưa đăng nhập.
- [ ] Xác nhận Setup Wizard không còn khả dụng sau khi đã tạo Admin đầu tiên.

## GitHub Workers Builds

- [ ] Kết nối `HaoLe2710/frorlancee.dev` với Worker `frorlancee-website`.
- [ ] Nếu repo không có trong selector Cloudflare, cấp GitHub App `Cloudflare Workers and Pages` quyền chỉ trên repository này; không cấp toàn bộ repositories.
- [ ] Đặt production branch `main`, thư mục gốc repository, install command `pnpm install --frozen-lockfile`, build command `pnpm typecheck && pnpm build`, deploy command `pnpm exec wrangler deploy --config dist/server/wrangler.json`.
- [ ] Giữ `previews_enabled: false`; xác nhận không có Preview deployment/URL.
- [ ] Chỉ để commit `main` tự deploy sau khi review source diff và Build settings.

**Trạng thái release:** chỉ đánh dấu hoàn tất khi có bằng chứng tương ứng trong [Cloudflare deployment](CLOUDFLARE_DEPLOYMENT.md), [security checklist](SECURITY_CHECKLIST.md), và [báo cáo kiểm thử](TEST_REPORT.md).
