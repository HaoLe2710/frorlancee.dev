# Phát triển local

## Yêu cầu

- Node.js **22.23.4 trở lên** (`package.json` khai báo `engines.node`). Node 22.18 có sẵn trên máy trong lần kiểm tra này không đáp ứng yêu cầu; dùng bản Node mới hơn qua version manager/runtime và đặt thư mục Node đó ở đầu `PATH` trước khi gọi pnpm.
- pnpm 11.9.0 (phiên bản khai báo trong `package.json`).
- Cài Chromium Playwright với `pnpm exec playwright install chromium` nếu máy chưa có browser tương ứng.

## Cài đặt và chạy

```powershell
pnpm install --frozen-lockfile
pnpm dev
```

Mở `http://localhost:4321/`. Admin nằm tại `http://localhost:4321/_emdash/admin`. Lần đầu sẽ hiện Setup Wizard. Dev server dùng Cloudflare local emulation cho D1/R2; dữ liệu local nằm dưới `.wrangler/` và không phải dữ liệu Cloudflare thật.

Các lệnh dự án:

```powershell
pnpm typecheck
pnpm build
pnpm preview
npx emdash types
```

`npx emdash types` cần site đang chạy. Astro/EmDash tạo lại `emdash-env.d.ts`; không chỉnh file sinh tự động bằng tay.

## Seed và dữ liệu

- `seed/seed.json` là schema cùng dữ liệu nội dung khởi đầu.
- Khởi động Astro/EmDash sẽ áp dụng schema/structure cho instance chưa setup. Trong Setup Wizard, lựa chọn sample content quyết định có thêm nội dung mẫu hay không.
- Đừng chạy `emdash seed` lên một file SQLite tùy ý rồi coi đó là dữ liệu D1 đang được `pnpm dev` sử dụng. CLI seed mặc định làm việc trực tiếp với SQLite; local D1 của Cloudflare adapter có vùng lưu riêng trong `.wrangler/`.
- Giữ `.env`, `.dev.vars`, `.wrangler/`, và `dist/` ngoài Git. `.env.example` chỉ hướng dẫn tên biến; không đưa giá trị khóa thật vào tài liệu hoặc source.

## Visual QA

Khởi động server ở terminal riêng, rồi:

```powershell
pnpm qa:visual
```

Mặc định script kiểm tra `http://127.0.0.1:4321`, mở context Chromium mới và lưu 18 screenshots + report vào `docs/qa/`. Để kiểm tra production preview, chạy `pnpm preview -- --host 127.0.0.1 --port 4322` rồi:

```powershell
$env:BASE_URL = 'http://127.0.0.1:4322'
pnpm qa:visual
Remove-Item Env:\BASE_URL
```

Script không đăng nhập Admin và không tạo nội dung CMS.

## Kiểm tra CLI

Để chỉ xác thực cấu trúc seed trước khi chỉnh nội dung:

```powershell
pnpm exec emdash seed seed/seed.json --validate
```

Trước khi áp dụng seed hoặc chạy migration trên dữ liệu hiện có, xác định đúng môi trường và database. Không dùng command trên production như bước kiểm tra mặc định.
