# Security checklist

## Hiện trạng

- [x] `.env` và `.dev.vars` được ignore; `.env.example` chỉ có tên/ghi chú biến.
- [x] Kiểm tra file local xác nhận `EMDASH_ENCRYPTION_KEY` có giá trị; không đọc/ghi giá trị vào terminal output, report hoặc docs.
- [x] Admin route được xác nhận nằm dưới `/_emdash/admin`.
- [x] `astro.config.mjs` không cấu hình `auth: access(...)`; Cloudflare Access policy trong Dashboard chưa được xác minh.
- [x] Không tạo credential/passkey, không gọi dev auth bypass, không chỉnh trực tiếp database để giả lập Admin CRUD.
- [ ] First Admin chưa được tạo; Setup Wizard đang mở. Chỉ chủ sở hữu hoàn tất trên hostname đúng.
- [ ] Production secret chưa được cài vào Worker (Worker chưa tồn tại).
- [ ] R2 và custom domain chưa sẵn sàng.
- [ ] Có Cloudflare Access auth hay policy chưa được cấu hình/xác minh trong project.
- [ ] Chưa kiểm tra quyền Admin/Editor/Author bằng tài khoản test.
- [ ] Chưa diễn tập restore D1, R2 media, và encryption key cùng nhau.

## Trước khi public

1. Chọn hostname thật và bảo vệ đường dẫn Admin/API theo kế hoạch auth. Trên instance mới, người đầu tiên hoàn tất setup sẽ là Admin; chỉ owner nên truy cập setup trước khi site public. Không đưa Worker lên `workers.dev` khi chưa có người owner sẵn sàng claim wizard hoặc cơ chế Access bảo vệ.
2. Tạo passkey thật trên hostname cuối cùng hoặc chủ động cấu hình EmDash Cloudflare Access; không tạo passkey trên `localhost` nếu định dùng hostname khác.
3. Chỉ cấp role cần thiết. Dùng Admin cho account quản trị; Editors quản lý toàn bộ nội dung; Authors chỉ quản lý nội dung của họ; Contributors cần phê duyệt publish.
4. Cài `EMDASH_ENCRYPTION_KEY` bằng secret management của Worker. Không thêm `.env`, `.dev.vars`, access tokens, OAuth secrets, hoặc R2 API credentials vào Git.
5. Giữ R2 bucket private. Không bật public bucket access cho bucket chứa `backups/`; public R2 domain có thể làm lộ mọi object reachable.
6. Thêm rate/security rules phù hợp cho site và kiểm tra response headers/Access policy trên staging.
7. Thu thập backup D1 + media object + encryption key-list trước migration/destructive operation; thử restore trên resource riêng.

EmDash trên Cloudflare có tùy chọn [Cloudflare Access auth](https://docs.emdashcms.com/deployment/cloudflare/); passkeys là domain-bound. Xem thêm [Authentication](https://docs.emdashcms.com/guides/authentication/) và [R2 public-access cautions](https://docs.emdashcms.com/deployment/cloudflare/).

## Local secrets

`EMDASH_ENCRYPTION_KEY` hiện chỉ có trong `.env` local bị ignore. `.env.example` ghi cách đặt production secret. Không đưa giá trị vào Markdown, screenshots, shell history, chat, output report, hoặc issue tracker. Rà soát rotation/backup key list cùng database recovery point.
