# Hướng dẫn quản trị CMS

## Truy cập lần đầu

1. Mở `/_emdash/admin` trên đúng hostname dự định dùng.
2. Setup Wizard hiện các bước Site, Account, và Sign In. Xác nhận site title/tagline; với seed hiện tại, chọn **Sample content** để nạp homepage, bốn dịch vụ, About và Privacy đã biên soạn cho Frorlancee Dev. Seed không có bản ghi demo cho Project, Blog hoặc Contact Links. Chọn **Empty site** chỉ khi muốn tự nhập cả nội dung khởi đầu này.
3. Nhập email và tên của chủ sở hữu thật.
4. Dùng passkey thật của thiết bị (Windows Hello hoặc security key trên Windows); không dùng credential giả. Lưu passkey trên thiết bị quản trị và tạo thêm phương thức dự phòng từ account settings sau khi đăng nhập.
5. Hoàn tất setup rồi xác nhận Dashboard và đăng nhập lại.

Trên một instance mới, người đầu tiên hoàn tất wizard trở thành Admin. Không để URL public trong trạng thái Setup Wizard chưa được claim. Passkey gắn với hostname; tạo nó trên hostname cuối cùng. [Hướng dẫn xác thực EmDash](https://docs.emdashcms.com/guides/authentication/).

Lần kiểm tra này chỉ xác nhận wizard được tải tại `/_emdash/admin/setup`; chưa tạo Admin hoặc passkey. Hãy để chủ sở hữu thực hiện bước tương tác.

## Tạo và xuất bản bài viết

1. Mở **Bài viết** (`posts`) → **Add New**.
2. Nhập tiêu đề, tóm tắt, ảnh bìa (nếu có), và nội dung Portable Text; chọn taxonomy phù hợp.
3. **Save draft**, kiểm tra slug và bản nháp.
4. Dùng **Preview** để xem trước nội dung chưa xuất bản.
5. Chỉ chọn **Publish now** sau khi copy và quyền sử dụng hình ảnh đã được xác nhận.
6. Xác minh bài tại `/blog/{slug}` và `/blog`.
7. Để gỡ nội dung: mở entry và chọn **Unpublish**; kiểm tra URL công khai trả về trang 404.

EmDash tách draft khỏi live version. Lưu sửa đổi chưa đồng nghĩa nội dung public đã đổi; xem [Working with Content](https://docs.emdashcms.com/guides/working-with-content/) và [Preview Mode](https://docs.emdashcms.com/guides/preview/).

## Tạo dự án

1. Mở **Dự án** (`projects`) → **Add New**.
2. Điền tiêu đề, mô tả ngắn, phân loại, ảnh bìa, bài toán, giải pháp, tính năng, công nghệ, kết quả, và nội dung chi tiết.
3. Chỉ thêm demo/repository URLs thực sự công khai. Gallery nhận media từ thư viện CMS và chú thích tùy chọn.
4. Đánh dấu `featured` nếu dự án cần hiển thị trên trang chủ; đặt `sort_order` theo thứ tự mong muốn.
5. Save draft → Preview → Publish. Xác minh `/projects/{slug}` và index `/projects`.
6. Unpublish để rút dự án khỏi public; kiểm tra URL detail.

## Homepage và dịch vụ

- Mở **Nội dung trang chủ** (`homepage_content`) và chỉnh entry hiện có. Sửa title, mô tả, CTA, tiêu đề/mô tả từng section, quy trình, và cờ `show_*` để bật/tắt section.
- Mở **Dịch vụ** (`services`) để chỉnh bốn dịch vụ hiện có. `visible=false` ẩn khỏi public; `sort_order` điều khiển thứ tự.
- Save/Publish theo trạng thái entry. Kiểm tra trang `/` hoặc `/services` sau khi xuất bản; dữ liệu được truy vấn khi render, không cần build lại.

## Thông tin liên hệ

Mở **Liên kết liên hệ** (`contact_links`) để thêm email, Zalo, Messenger, Facebook, GitHub, LinkedIn, hoặc website. Chỉ nhập kênh đã được chủ sở hữu xác nhận. Email phải dùng dạng `mailto:you@example.com`; các URL web phải là `https://` hoặc `http://`. Bật `visible` và đặt `sort_order`, sau đó kiểm tra `/contact` và footer.

## Tải ảnh lên

Mở **Media** trong Admin, tải ảnh lên, điền alt text mô tả nội dung, rồi chọn ảnh tại trường cover/gallery tương ứng. Project cover chỉ chấp nhận JPEG, PNG, WebP hoặc AVIF. Không coi local preview là bằng chứng upload R2 production: lần kiểm tra này chưa đăng nhập hoặc tải file lên.

## Backup và phục hồi

- D1: ghi nhận recovery point/Time Travel bookmark trước migration; duy trì bản SQL offsite nếu cần lưu lâu hơn hoặc diễn tập khôi phục.
- R2: sao lưu object độc lập với D1; database backup không chứa bytes của ảnh.
- Lưu khóa `EMDASH_ENCRYPTION_KEY` trong secret manager riêng, đi cùng phiên bản ứng dụng/database/media.
- Khôi phục vào resource/database trống và kiểm tra trên staging trước khi đổi binding production. Không import dump vào database đang chạy.

Xem hướng dẫn [Backups and recovery](https://docs.emdashcms.com/guides/backups/). JSON backup của EmDash dùng để kiểm tra/chuyển dữ liệu; tài liệu hiện tại ghi rõ nó không phải định dạng restore của Admin.
