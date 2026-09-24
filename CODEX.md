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
