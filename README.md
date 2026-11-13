# Frorlancee Dev

Website giới thiệu dịch vụ và dự án Frorlancee Dev, với CMS EmDash để quản lý dự án, bài viết, dịch vụ và nội dung trang.

Astro render các trang public trên Cloudflare Workers. EmDash cung cấp mô hình nội dung và giao diện quản trị.

## Production

- Domain: [https://frorlanceedev.id.vn](https://frorlanceedev.id.vn)
- Worker: `frorlancee-website`
- D1: `frorlancee-db` (`ef7bb509-01a5-43ed-a39d-23afb2348f94`)
- R2: `frorlancee-media` (bucket private)
- Astro session KV: `SESSION` (`09eb75a300c849e79788e9718b4fc9f6`)
- Cloudflare Access đang bảo vệ hostname trong giai đoạn owner tạo Admin đầu tiên và xác minh CMS.
- `workers.dev` và preview/version URL đã tắt.

Xem [hướng dẫn triển khai](docs/CLOUDFLARE_DEPLOYMENT.md), [security checklist](docs/SECURITY_CHECKLIST.md), và [release checklist](docs/RELEASE_CHECKLIST.md). Không mở website công khai trước khi release checklist hoàn tất.

## Các trang

| Trang | Route |
|---|---|
| Trang chủ | `/` |
| Dịch vụ | `/services` |
| Dự án | `/projects` và `/projects/:slug` |
| Bài viết | `/blog` và `/blog/:slug` |
| Giới thiệu | `/about` |
| Liên hệ | `/contact` |
| Quyền riêng tư | `/privacy` |
| RSS | `/rss.xml` |
| EmDash Admin | `/_emdash/admin` |

## Phát triển local

Yêu cầu: Node.js `22.23.4` (xem `.nvmrc`) và pnpm `11.9.0` (xem `package.json`).

```powershell
pnpm install --frozen-lockfile
pnpm dev
```

Mở `http://localhost:4321/`; Admin local ở `http://localhost:4321/_emdash/admin`. Dữ liệu Wrangler local trong `.wrangler/` tách biệt với production. Không dùng Setup Wizard local để tạo Admin production.

## Kiểm tra và deploy

```powershell
pnpm typecheck
pnpm build
pnpm exec wrangler deploy --dry-run --config dist/server/wrangler.json
```

Dry run chỉ build và kiểm tra Worker bundle/config local; nó không deploy hoặc xác minh runtime từ xa. Deploy trực tiếp production bằng:

```powershell
pnpm exec wrangler deploy --config dist/server/wrangler.json
```

Admin đầu tiên phải được tạo trên `https://frorlanceedev.id.vn` bằng passkey thật. Cloudflare Access giới hạn setup ban đầu cho owner. Thực hiện theo [release checklist](docs/RELEASE_CHECKLIST.md) trước khi thay đổi Access gate.

## Tài liệu dự án

- [Kiến trúc](docs/ARCHITECTURE.md)
- [Cloudflare deployment](docs/CLOUDFLARE_DEPLOYMENT.md)
- [Security checklist](docs/SECURITY_CHECKLIST.md)
- [Release checklist](docs/RELEASE_CHECKLIST.md)
- [Phát triển local](docs/LOCAL_DEVELOPMENT.md)
- [Hướng dẫn CMS](docs/CMS_USER_GUIDE.md)
- [Content model](docs/CONTENT_MODEL.md)
- [Báo cáo kiểm thử](docs/TEST_REPORT.md)
