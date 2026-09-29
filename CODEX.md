# Codex Project Guide — NhanHien

Tài liệu này là hướng dẫn dùng cho Codex/AI agent để hiểu dự án và chỉnh sửa an toàn theo các phase từ bây giờ.

## 1. Tổng quan dự án

NhanHien là một website nội thất cao cấp theo mô hình B2B/B2C, tập trung vào bán sản phẩm gỗ nội thất, inquiry cart, admin dashboard, analytics, order tracking, CMS, gallery và SEO.

Dự án chính sử dụng:

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Prisma ORM
- SQLite mặc định, có thể chuyển sang PostgreSQL
- JWT + bcryptjs cho auth admin
- Nodemailer cho email
- Local file upload vào public/uploads

Mục tiêu kinh doanh chính:

- Hiển thị sản phẩm fine furniture cho khách hàng
- Cho phép khách hàng đặt inquiry / cart nhiều sản phẩm
- Hỗ trợ order tracking và cancel order
- Quản lý nội dung và sản phẩm qua dashboard admin
- Theo dõi analytics, revenue, manufacturing cost, inventory, inquiry

## 2. Cấu trúc dự án chính

- app/
  - (store): giao diện khách hàng
  - (admin): giao diện quản trị
  - api/: API routes cho auth, products, orders, inquiries, gallery, upload...
- components/
  - admin/: dashboard quản trị
  - store/: UI khách hàng
  - layout/: navbar/footer/whatsapp
  - ui/: shared UI, cart context, theme
- lib/
  - auth.ts
  - email.ts
  - prisma.ts
  - seo.ts
  - whatsapp.ts
- prisma/
  - schema.prisma
  - seed.ts
- public/uploads/: lưu ảnh upload
- middleware.ts: bảo vệ admin routes

## 3. Kiến trúc dữ liệu chính

### Core models

- Product
- Category
- ProductImage
- Order
- OrderItem
- Inquiry
- Admin
- SiteContent
- GalleryItem
- Testimonial
- BlogPost

### Inventory / manufacturing module

- InventoryItem
- InventoryTransaction

Các model này cho thấy dự án không chỉ là storefront đơn thuần mà còn có mô-đun quản lý sản xuất và kho hàng.

## 4. Luồng nghiệp vụ quan trọng

### Khách hàng

- Duyệt sản phẩm theo category/search
- Thêm sản phẩm vào inquiry cart
- Gửi đơn hàng hoặc inquiry cho admin
- Theo dõi order bằng order number + email
- Hủy order ở trạng thái PENDING
- Liên hệ qua WhatsApp

### Admin

- Đăng nhập bằng JWT
- Dashboard thống kê lên lịch order, revenue, status, top products
- Quản lý sản phẩm: CRUD, upload ảnh, primary image
- Quản lý danh mục
- Quản lý orders và trạng thái
- Quản lý inquiries, đọc/reply
- Quản lý gallery, site content, nav visibility
- Theo dõi manufacturing cost và inventory

## 5. Môi trường và chạy dự án

### Setup nhanh

```bash
npm install
cp .env.example .env
npx prisma generate
npx prisma db push
npx ts-node --compiler-options '{"module":"CommonJS"}' prisma/seed.ts
npm run dev
```

### Scripts quan trọng

```bash
npm run dev
npm run build
npm run start
npm run db:generate
npm run db:push
npm run db:seed
npm run db:studio
npm run db:migrate
```

### Default admin account

- Email: admin@craftura.com
- Password: admin123

Lưu ý: chỉ dùng cho môi trường dev/test, không dùng trên production.

## 6. Environment variables cần có

```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="change-this-in-production"
NEXTAUTH_SECRET="change-this-in-production"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
NEXT_PUBLIC_WHATSAPP_NUMBER="+919876543210"
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your@gmail.com"
SMTP_PASS="your-app-password"
ADMIN_EMAIL="admin@craftura.com"
```

Nếu SMTP chưa cấu hình, hệ thống có thể bỏ qua email mà không làm vỡ flow chính của app.

## 7. Quy tắc phát triển cho Codex

### Khi sửa code, ưu tiên

- Giữ đúng kiến trúc App Router của Next.js
- Dùng TypeScript và giữ type safety
- Tôn trọng cấu trúc thư mục hiện có
- Không phá vỡ quyền admin và middleware
- Không thay đổi schema Prisma nếu không thật sự cần thiết
- Giữ nguyên pattern của API route, server action, và UI component

### Khi làm feature mới

- Xác định xem feature thuộc store/public hay admin
- Nếu cần truy cập DB thì ưu tiên Prisma model hiện có
- Nếu cần thêm field mới thì cập nhật `schema.prisma` và migration/push phù hợp
- Nếu có upload ảnh thì lưu dưới `public/uploads/` theo pattern hiện tại
- Nếu có form mới thì kiểm tra validation + trạng thái UI + admin notification

### Khi sửa bug

- Trước hết xác định bug thuộc layer nào: route, client component, Prisma query, auth, UI state, email, SEO
- Kiểm tra logic ở cả server và client
- Không sửa tạm theo kiểu dùng console log / hardcode mà không hiểu context

### Quy tắc bắt buộc về locales cho mọi nội dung giao diện

- Mọi nội dung giao diện mới hoặc được chỉnh sửa phải lấy từ `locales/vi.json` và `locales/en.json` qua `t()` trong `lib/translations.ts`. Không hardcode tiếng Việt hoặc tiếng Anh trong JSX, thuộc tính hay biến chứa nội dung giao diện.
- Phạm vi gồm: tiêu đề, label, tên button/link, header bảng, lựa chọn dropdown, placeholder, trạng thái, thông báo rỗng, lỗi/thành công, xác nhận, tooltip (`title`), `aria-label` và nội dung chỉ dành cho trình đọc màn hình.
- Thêm key có nghĩa theo module (ví dụ `admin.employees.table.add`) và cập nhật đủ hai locales trong cùng thay đổi. Tái sử dụng key có sẵn khi đúng ngữ nghĩa.
- Câu có dữ liệu động phải đặt cả câu trong locales với placeholder như `{count}`, `{name}`; không ghép số/tên với một đoạn chữ hardcode. Khi thay tên do người dùng nhập, dùng hàm thay thế để giữ nguyên ký tự đặc biệt.
- Dữ liệu người dùng nhập (tên, chức vụ, ghi chú), mã kỹ thuật, CSS, URL và giá trị enum không phải chuỗi dịch. Số, ngày, tiền tệ dùng bộ định dạng phù hợp; không hardcode ký hiệu tiền tệ trong JSX.
- Trước khi hoàn tất, rà soát toàn bộ file giao diện đã sửa, kiểm tra cả nhãn ẩn/tooltip, xác nhận mọi key tồn tại trong hai locales và không còn chuỗi giao diện hardcode. Đây là bước kiểm tra bắt buộc, không bỏ qua với thay đổi CSS hoặc component nhỏ.

### Quy tắc màu sắc nút ADD trong Admin

- Tất cả nút tạo mới (`Add`, `Thêm`, dấu `+` để thêm bản ghi), kể cả nút trong modal/form, phải dùng nền đen `bg-charcoal-800` (#1c1917), chữ trắng `text-white` và hover `hover:bg-charcoal-900` (#0c0a09).
- Dùng `transition-colors`; khi bị vô hiệu hóa, dùng `disabled:opacity-50 disabled:cursor-not-allowed` và thuộc tính `disabled` trên button.
- Không dùng màu `wood`, màu riêng của từng module hoặc mã màu hardcode cho nút ADD. Giữ kích thước và bố cục phù hợp với giao diện hiện có.
- Áp dụng cho cả module mới và khi sửa nút tạo mới của module hiện có, ví dụ: Thêm nhân viên, Chấm công, Ghi nhận chi tiền, Add Product, Add Item.

Mẫu class màu sắc và trạng thái:

```tsx
className="bg-charcoal-800 hover:bg-charcoal-900 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
```

### Quy tắc Field, thanh tìm kiếm và dropdown trong Admin

- Tất cả control một dòng trong Field (`text`, `tel`, `number`, `date`, `month`, `select`) dùng cùng chiều cao **40px** (`h-10`), `text-sm`, `rounded-lg`, border 1px; không dựa vào padding dọc mặc định của trình duyệt để tính chiều cao.
- Field dùng label phía trên với `leading-5`, cách control `gap-1`. Control một dòng dùng `py-0`; các control cạnh nhau phải thẳng hàng. Textarea là ngoại lệ nhiều dòng: `min-h-20 resize-y`; checkbox giữ kích thước riêng.
- Các Field tìm kiếm/lọc nằm trên **cùng một hàng**, dùng `flex flex-nowrap items-end gap-3`. Màn hình hẹp cuộn ngang trong thanh lọc (`overflow-x-auto`), không kéo rộng cả trang.
- Width phải vừa loại dữ liệu: tháng khoảng `w-44`, tìm tên/số điện thoại khoảng `w-52`, dropdown `w-fit`/`w-auto` theo lựa chọn dài nhất. Field trong thanh lọc dùng `shrink-0`, không tự giãn `flex-1` hoặc chiếm toàn hàng. Input trong form nhập hồ sơ vẫn có thể dùng `w-full`.
- Dropdown theo mẫu `EmployeeSelect` của phần Nhân viên: wrapper `relative block w-fit max-w-full`, select `h-10 w-auto max-w-full appearance-none pl-3 pr-9 py-0`.
- Dùng một icon chevron hướng xuống 14px thay mũi tên native; đặt `absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none`, `aria-hidden="true"`. Mũi tên cách mép phải **12px**; nội dung có khoảng trống riêng nên không đè lên mũi tên.
- Dropdown phải giữ label, trạng thái focus rõ ràng, thao tác bàn phím native và `disabled`. Dùng chung class/component để tránh lệch chiều cao và padding giữa các form.
- Focus của input, textarea và dropdown phải giống form Sản phẩm: viền `var(--accent)` màu cam và quầng `0 0 0 3px rgba(168,94,46,0.12)`. Dùng `.form-input` hoặc `.admin-field-control` để chia sẻ quy tắc CSS; không dùng viền/ring `charcoal` màu đen khi focus. Màu đen của nút ADD là quy tắc riêng, không áp dụng cho focus của Field.
- Khi thêm hoặc sửa Field, kiểm tra input tháng/ngày, text và select trên cùng hàng; không tạo style dropdown riêng khác chuẩn này.

### Quy tắc bảng danh sách trong Admin

- Dùng trang Sản phẩm (`app/(admin)/admin/products/page.tsx`) làm mẫu chuẩn cho trang danh sách, bao gồm Nhân viên → Tất cả. Dùng HTML `table`, mỗi bản ghi một dòng.
- Đầu trang: tiêu đề `text-2xl font-display font-semibold text-charcoal-800`, số lượng bản ghi `text-stone-400 text-sm mt-1`, nút Thêm bên phải theo quy tắc ADD; cách bảng `mb-8`.
- Khung bảng: `bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden`. Dùng vùng `overflow-x-auto` khi bảng rộng.
- Header nền trắng, viền dưới `border-stone-100`; chữ `text-xs font-semibold text-stone-400 uppercase tracking-wider`. Cột đầu `px-6 py-4`, các cột khác `px-4 py-4`.
- Thân bảng: `divide-y divide-stone-50`; dòng `hover:bg-stone-50 transition-colors`. Nội dung chính `text-sm text-charcoal-700`; tên `font-medium text-sm text-charcoal-800`, mô tả phụ `text-xs text-stone-400`.
- Cột đầu có ảnh hoặc chữ viết tắt trong ô `w-12 h-12 rounded-lg bg-stone-100`; trạng thái dùng badge `text-xs rounded-full font-medium`, xanh cho đang hoạt động, đỏ cho ngừng hoạt động.
- Cột Thao tác căn phải, dùng icon nhỏ có `title` và `aria-label`; chỉ hiển thị thao tác đã hỗ trợ. Không thêm thao tác xóa hồ sơ có lịch sử chỉ để giống mẫu.
- Giữ tên, trạng thái và thao tác trên màn hình nhỏ; ẩn các cột phụ theo breakpoint như trang Sản phẩm. Có thông báo khi danh sách trống.
- Nhân viên → Tất cả hiển thị mọi hồ sơ, gồm cả nhân viên đã nghỉ. Chấm công, bộ lọc tháng, tổng kết lương và thanh toán nằm ở các mục riêng, không hiển thị mặc định bên dưới bảng danh sách.

## 8. Các phase chỉnh sửa đề xuất

### Phase 1 — Foundation / stabilize

- Đảm bảo app chạy local
- Kiểm tra env + Prisma + seed
- Khởi động admin và store routes
- Xác nhận auth, orders, inquiries, products hoạt động

### Phase 2 — Product & catalog fixes

- Sửa search/filter/category
- Kiểm tra product detail, slug, image, featured flag
- Duyệt các vấn đề liên quan tới inventory và category mapping

### Phase 3 — Ordering & inquiry flows

- Cart, inquiry cart, order summary, tracking
- Validate order status lifecycle
- Kiểm tra cancel order và email confirmation

### Phase 4 — Admin operations

- Product CRUD
- Orders management
- Inquiry management
- Gallery and CMS content updates
- Inventory / manufacturing cost analytics

### Phase 5 — UX & SEO polish

- Metadata, sitemap, robots, structured data
- Dark mode / theme consistency
- Landing page performance and visual QA

### Phase 6 — Production hardening

- Secure env vars
- JWT secret rotation
- Email configuration
- Check upload strategy for Vercel/serverless
- Validate PostgreSQL ready config

## 9. Mẫu workflow cho mỗi task

1. Đọc README + cấu trúc liên quan
2. Tìm file vừa khớp với chức năng cần sửa
3. Đọc các file route/component/model liên quan
4. Chỉ sửa những file cần thiết
5. Khi cần DB: kiểm tra Prisma schema trước khi thay đổi
6. Test bằng build hoặc chạy route tương ứng
7. Nếu sửa UI: ưu tiên giữ nguyên design language hiện có
8. Ghi chú lại nếu cần migration hoặc env mới

## 10. Những điểm rủi ro cần tránh

- Không bỏ qua middleware bảo vệ admin
- Không để public route gọi dữ liệu admin mà không kiểm tra auth
- Không hardcode order status mới mà không đồng bộ với Prisma enum/string values
- Không xóa dữ liệu sản phẩm nếu có order liên quan
- Không làm thay đổi slug/category logic gây mất route
- Không để upload ảnh không kiểm tra định dạng / lưu vào đúng folder
- Không quên cập nhật metadata/SEO khi thêm page hoặc product mới
- Không thay đổi `NEXT_PUBLIC_SITE_URL` hoặc `DATABASE_URL` sai môi trường

## 11. Gợi ý tri thức domain cho dự án

Dự án này là một website thương mại nội thất nên cần giữ:

- Giao diện warm luxury, phù hợp showroom furniture
- Tính thẩm mỹ và mô tả sản phẩm rõ ràng
- Nền tảng B2B/B2C đồng thời
- Độ tin cậy trong order management và inquiry workflow
- Bảo mật admin và dữ liệu khách hàng

## 12. Kết luận

Mục tiêu chính của Codex khi làm việc với repo này là:

- hiểu rõ mô hình thương mại nội thất + admin dashboard
- không phá vỡ flow nghiệp vụ hiện có
- ưu tiên sửa theo phase rõ ràng và kiểm tra kỹ trước khi finalize

Nếu cần thêm nhiệm vụ hoặc phase mới, hãy thêm vào file này để làm tài liệu tham chiếu thống nhất cho toàn bộ quá trình phát triển.
