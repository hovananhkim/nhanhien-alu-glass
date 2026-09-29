# NhanHien Fine Furniture 🪑

A full-stack furniture manufacturing website with B2B/B2C ordering, inquiry cart, admin panel, analytics dashboard, order tracking, dark/light mode, and SEO — built with Next.js 14, Prisma ORM, and SQLite (PostgreSQL-ready).

---

## ⚡ Quick Start

```bash
# 1. Unzip and enter folder
unzip craftura.zip && cd craftura

# 2. Copy environment file and fill in your settings
copy .env.example .env

# 3. Install pinned dependencies (avoids breaking version changes)
npm install next@14 react@18 react-dom@18 prisma@5 @prisma/client@5 tailwindcss@3 autoprefixer@10 postcss@8

# 4. Generate Prisma client and push schema to SQLite
npx prisma generate
npx prisma db push

# 5. Seed sample data (products, categories, admin user)
npx ts-node --compiler-options "{\"module\":\"CommonJS\"}" prisma/seed.ts

# 6. Start development server
npm run dev
```

Open **http://localhost:3000** for the store.  
Open **http://localhost:3000/admin** for the admin panel.

**Default Admin:** `admin@craftura.com` / `admin123`

---

## 🔧 Available Scripts

| Command               | Description                           |
| --------------------- | ------------------------------------- |
| `npm run dev`         | Start development server              |
| `npm run build`       | Build for production                  |
| `npm run start`       | Start production server               |
| `npm run db:generate` | Generate Prisma client                |
| `npm run db:push`     | Push schema to database               |
| `npm run db:seed`     | Seed sample data                      |
| `npm run db:studio`   | Open Prisma Studio (visual DB editor) |
| `npm run db:migrate`  | Run migrations (production use)       |

---

## 📁 Project Structure

```
craftura/
├── app/
│   ├── (store)/                    # Customer-facing pages
│   │   ├── page.tsx                # Homepage
│   │   ├── products/               # Products listing + detail
│   │   ├── gallery/                # Project gallery with lightbox
│   │   ├── about/                  # About Us
│   │   ├── contact/                # Contact form + map
│   │   ├── bulk-orders/            # B2B bulk order page
│   │   ├── inquiry-cart/           # Multi-item inquiry cart
│   │   └── track-order/            # Order tracking + cancel
│   ├── (admin)/admin/              # Admin panel (JWT protected)
│   │   ├── page.tsx                # Dashboard with stats
│   │   ├── analytics/              # Analytics + data export
│   │   ├── products/               # Product management (CRUD)
│   │   ├── categories/             # Category management
│   │   ├── orders/                 # Order management + status
│   │   ├── inquiries/              # Inquiry management
│   │   ├── gallery/                # Gallery management
│   │   ├── content/                # CMS + navigation visibility
│   │   └── login/                  # Admin login
│   ├── api/
│   │   ├── auth/                   # Login / logout
│   │   ├── products/               # Products CRUD
│   │   ├── categories/             # Categories CRUD
│   │   ├── orders/                 # Orders CRUD
│   │   ├── inquiries/              # Inquiries CRUD
│   │   ├── gallery/                # Gallery CRUD
│   │   ├── track-order/            # Public tracking + cancel
│   │   ├── upload/                 # Image upload to public/uploads/
│   │   └── admin/                  # Analytics, export, stats, content
│   ├── sitemap.ts                  # Dynamic XML sitemap
│   └── robots.ts                   # robots.txt
├── components/
│   ├── layout/                     # Navbar, Footer, WhatsAppFloat
│   ├── admin/                      # Admin components
│   │   ├── AnalyticsDashboard.tsx  # Charts + data table + export
│   │   ├── ContentEditor.tsx       # CMS + nav visibility toggles
│   │   ├── ProductForm.tsx         # Product create/edit with upload
│   │   └── ...
│   ├── store/                      # Customer-facing components
│   │   ├── ProductCard.tsx         # Card with Add to Inquiry List
│   │   ├── ProductDetailClient.tsx # Detail + WhatsApp + cart
│   │   ├── InquiryCartClient.tsx   # Multi-item cart + order form
│   │   ├── TrackOrderClient.tsx    # Tracking UI + cancel flow
│   │   └── ...
│   └── ui/                         # Shared UI components
│       ├── CartContext.tsx          # Global inquiry cart state
│       ├── CartIcon.tsx             # Navbar badge icon
│       ├── AddToCartButton.tsx      # Add/In-cart button variants
│       ├── ThemeProvider.tsx        # Dark/light mode context
│       ├── ThemeToggle.tsx          # Sun/moon toggle switch
│       └── WhatsAppButton.tsx       # Reusable WhatsApp CTA
├── lib/
│   ├── prisma.ts                   # Prisma client singleton
│   ├── auth.ts                     # JWT auth + session utilities
│   ├── email.ts                    # Email templates + Nodemailer
│   ├── whatsapp.ts                 # Pre-filled WhatsApp link builder
│   └── seo.ts                      # Metadata + JSON-LD generators
├── prisma/
│   ├── schema.prisma               # Database schema (9 models)
│   └── seed.ts                     # Sample data seed
├── public/
│   └── uploads/                    # Uploaded product/gallery images
├── middleware.ts                   # Admin route protection
└── .env                            # Environment variables
```

---

## 📱 All Pages

### Customer (Public)

| Page           | URL                | Description                                       |
| -------------- | ------------------ | ------------------------------------------------- |
| Homepage       | `/`                | Hero, featured products, categories, testimonials |
| Products       | `/products`        | Grid with search + category filter                |
| Product Detail | `/products/[slug]` | Gallery, specs, WhatsApp + inquiry form           |
| Gallery        | `/gallery`         | Masonry grid with lightbox + category filter      |
| About Us       | `/about`           | Story, values, manufacturing capabilities         |
| Contact        | `/contact`         | Form, map, WhatsApp, contact info                 |
| Bulk Orders    | `/bulk-orders`     | B2B quote form with FAQ                           |
| Inquiry Cart   | `/inquiry-cart`    | Multi-item cart + single order submission         |
| Track Order    | `/track-order`     | Animated status tracker + cancel flow             |

### Admin (JWT Protected)

| Page               | URL                         | Description                              |
| ------------------ | --------------------------- | ---------------------------------------- |
| Login              | `/admin/login`              | Secure JWT login                         |
| Dashboard          | `/admin`                    | Stats, recent orders, quick actions      |
| Analytics          | `/admin/analytics`          | Charts + data tables + CSV/Excel export  |
| Manufacturing Cost | `/admin/manufacturing-cost` | Material consumption cost report + trend |
| Products           | `/admin/products`           | List, add, edit, delete products         |
| New Product        | `/admin/products/new`       | Create with drag-and-drop image upload   |
| Edit Product       | `/admin/products/[id]/edit` | Edit product details + images            |
| Categories         | `/admin/categories`         | Create, edit, delete categories          |
| Orders             | `/admin/orders`             | All orders with inline status updater    |
| Inquiries          | `/admin/inquiries`          | Read/reply inquiries, mark read          |
| Gallery            | `/admin/gallery`            | Upload and manage gallery items          |
| Content & Nav      | `/admin/content`            | Edit CMS text + toggle nav visibility    |

---

## 🗄️ Database Models

| Model          | Description                                      |
| -------------- | ------------------------------------------------ |
| `Product`      | Furniture items with images, specs, price, MOQ   |
| `Category`     | Product categories with images                   |
| `ProductImage` | Multiple images per product with ordering        |
| `Order`        | Customer orders (B2B + B2C) with status tracking |
| `OrderItem`    | Individual product lines within an order         |
| `Inquiry`      | Contact form submissions                         |
| `Admin`        | Admin user accounts                              |
| `SiteContent`  | CMS key-value store (hero text, nav settings)    |
| `GalleryItem`  | Project gallery photos with categories           |

**Order statuses:** `PENDING` → `CONFIRMED` → `IN_PRODUCTION` → `DELIVERED` · `CANCELLED`

---

## ✨ Feature Overview

### Customer Features

- **Product browsing** — search, filter by category, featured badges
- **Inquiry Cart** — add multiple products, adjust quantity per item, submit one order for all
- **WhatsApp integration** — pre-filled product messages, bulk order enquiry, order follow-up
- **Order Tracking** — enter order number or email to see animated progress tracker
- **Order Cancellation** — self-cancel PENDING orders (verified by email)
- **Dark / Light Mode** — warm showroom dark theme, persisted across sessions
- **Gallery** — project portfolio with masonry grid, category filter, keyboard lightbox

### Admin Features

- **Analytics Dashboard** — orders over time (bar), B2B/B2C split (donut), status breakdown, top products, trend line, monthly data table
- **Manufacturing Cost Report** — monthly consumed inventory cost, category split, top expensive materials, 6-month trend
- **Repeat Customer Detection** — order-level badge and click-to-view history modal by customer email
- **Revenue Forecast Widget** — current month expected revenue from `IN_PRODUCTION` orders with expected delivery date
- **Data Export** — CSV and Excel (no library) for orders, inquiries, products with date range filter
- **Image Upload** — drag-and-drop to `public/uploads/`, reorder, set primary
- **Nav Visibility** — toggle Gallery, Bulk Orders, About, Contact on/off from CMS
- **Email Notifications** — new order alert to admin, confirmation to customer, inquiry alert, cancel alert
- **Order Management** — status updater with CANCELLED state support
- **Gallery Management** — upload photos, set category, featured star toggle

### SEO

- Dynamic `sitemap.xml` — all pages + every product + every category
- `robots.txt` — blocks `/admin/`, `/api/`, `/inquiry-cart`
- Per-product `generateMetadata()` with unique title + description
- JSON-LD structured data: `FurnitureStore`, `Product`, `BreadcrumbList`, `FAQPage`
- Canonical URLs, `og:image`, `twitter:card` on every page

---

## 🔒 Environment Variables

```env
# ── Database ──────────────────────────────────────────────────
DATABASE_URL="file:./dev.db"              # SQLite (default)
# DATABASE_URL="postgresql://user:pass@host:5432/craftura"

# ── Authentication ────────────────────────────────────────────
JWT_SECRET="change-this-in-production"
NEXTAUTH_SECRET="change-this-in-production"

# ── App URL ───────────────────────────────────────────────────
NEXT_PUBLIC_SITE_URL="http://localhost:3000"

# ── WhatsApp ──────────────────────────────────────────────────
NEXT_PUBLIC_WHATSAPP_NUMBER="+919876543210"

# ── Email Notifications (optional) ───────────────────────────
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your@gmail.com"
SMTP_PASS="your-app-password"    # Gmail App Password (not login password)
ADMIN_EMAIL="admin@craftura.com"
```

> **Gmail App Password:** Go to `myaccount.google.com/apppasswords` to generate one. Your regular Gmail password will not work.  
> **If SMTP is not configured:** Emails are silently skipped — orders and inquiries still work normally.

---

## 🗄️ Migrating to PostgreSQL

Only **2 lines** need to change — no code changes required.

**1. Update `prisma/schema.prisma`:**

```prisma
datasource db {
  provider = "postgresql"     # ← was "sqlite"
  url      = env("DATABASE_URL")
}
```

**2. Update `.env`:**

```env
DATABASE_URL="postgresql://user:password@localhost:5432/craftura"
```

**3. Run migration:**

```bash
npx prisma migrate dev --name init
npx ts-node --compiler-options "{\"module\":\"CommonJS\"}" prisma/seed.ts
```

---

## 🛠️ Tech Stack

| Layer     | Technology                        |
| --------- | --------------------------------- |
| Framework | Next.js 14 (App Router)           |
| Language  | TypeScript                        |
| Styling   | Tailwind CSS 3                    |
| ORM       | Prisma 5                          |
| Database  | SQLite → PostgreSQL               |
| Auth      | JWT + bcryptjs                    |
| Email     | Nodemailer                        |
| Images    | Local upload to `public/uploads/` |
| Charts    | Pure SVG — no library             |
| Export    | Native OOXML — no library         |
| SEO       | Next.js Metadata API + JSON-LD    |
| Fonts     | Playfair Display + DM Sans        |

---

## 🚀 Deployment

### Vercel (Recommended)

```bash
npm i -g vercel
vercel
```

Set all environment variables in the Vercel dashboard under **Settings → Environment Variables**.

### Production with PostgreSQL

1. Create a database at [Supabase](https://supabase.com), [Neon](https://neon.tech), or [Railway](https://railway.app) — all have free tiers
2. Update `DATABASE_URL` and `schema.prisma` provider as shown above
3. Deploy to Vercel (it runs `npx prisma generate` automatically)
4. Run seed once via Vercel CLI or a one-off script

---

## 📸 Image Storage Note

Product and gallery images are stored in `public/uploads/` on the server. This works perfectly for local development and single-server deployments.

For multi-server or serverless deployments (Vercel), the filesystem is ephemeral — uploaded images will not persist between deployments. In that case, migrate image storage to:

- [Cloudinary](https://cloudinary.com) — free tier 25GB
- [AWS S3](https://aws.amazon.com/s3/)
- [Supabase Storage](https://supabase.com/storage)

Only the upload API route (`app/api/upload/route.ts`) needs updating — all other code stays the same.

---

## 📈 Roadmap

- [ ] Deploy to Vercel + PostgreSQL
- [ ] Cloudinary / S3 image storage
- [ ] Homepage gallery preview section
- [ ] Testimonials management via admin
- [ ] Image optimization (WebP conversion on upload)
- [ ] Product comparison tool
- [ ] Downloadable PDF product catalogue
- [ ] Blog / craft stories (SEO)
- [ ] Analytics charts: revenue trend, inventory
- [ ] B2B account registration + order history
- [ ] Online payment (Razorpay / Stripe)
- [ ] Multi-language (Hindi / Gujarati)
- [ ] Staff roles + permissions

---

## 🔐 Security Notes

- Change `JWT_SECRET` and `NEXTAUTH_SECRET` before going live
- Use HTTPS in production (`NODE_ENV=production` enables secure cookies)
- The default password `admin123` is for development only — change it immediately on a live server
- Order cancellation requires both order number + email match (prevents others cancelling your order)
- Admin routes are protected by both middleware (cookie check) and server-side session validation

---

## 📄 License

Private — All rights reserved, Kathan Patel.

## Quản lý Nhân viên

Mục `/admin/employees` dành cho quản trị viên đang hoạt động. Hồ sơ nhân viên
độc lập với mục Nhân sự (`/admin/users`), không tạo tài khoản đăng nhập.

- Thêm/sửa hồ sơ, đơn giá mỗi công, đánh dấu nghỉ việc và giữ lịch sử.
- Chấm công theo ngày: 0, 0.5, 1, 1.5 hoặc 2 công. Mỗi nhân viên có một bản ghi
  mỗi ngày; lưu lại ngày đã có sẽ cập nhật bản ghi. Đơn giá được lưu theo ngày.
- Ghi nhận tiền ứng và tiền trả lương thực tế, bằng VNĐ nguyên đồng.
- Tổng kết theo tháng: số dư đầu kỳ + lương phát sinh − tiền ứng − tiền trả lương.
  Số dương là còn phải trả nhân viên; số âm là đã trả dư/ứng trước.
  Tổng đã trả từ trước đến nay bao gồm cả ứng lương và trả lương ở mọi tháng.
- Có thể xóa bản ghi nhập nhầm sau khi xác nhận; tổng kết tự tính lại.

Cập nhật cơ sở dữ liệu trên môi trường triển khai theo quy trình hiện tại của dự án:

```bash
npm run db:generate
npm run db:push
```

Kiểm tra công thức và API trên SQLite tạm riêng biệt:

```bash
node --test tests/employees.test.cjs
```
