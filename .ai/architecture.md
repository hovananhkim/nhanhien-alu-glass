# NhanHien — Full Architecture Overview

> Every file in the project with a one-line summary of what it does.
> Read this when you need to know _which file_ to open for a given task.

---

## Root

```
middleware.ts          Edge Runtime only — cookie-presence check for /admin/* routes.
                       Sets x-pathname header so admin layout can skip auth for login/register.
                       ⚠️  ZERO imports from lib/ allowed here (Edge Runtime limitation).

package.json           Pinned versions: next@14.2.35, react@18.3.1, prisma@5.22.0,
                       tailwindcss@3.4.4, typescript@^5.4.5. Do NOT upgrade these.

tailwind.config.ts     Tailwind 3 config — custom colors (wood, charcoal), fonts, animations.
postcss.config.js      Standard PostCSS — tailwindcss + autoprefixer.
tsconfig.json          TypeScript config — path alias @/* → ./
```

---

## app/ (Next.js App Router root)

```
app/layout.tsx         Root layout — wraps everything in ThemeProvider + CartProvider,
                       loads Google Fonts (Playfair Display, DM Sans, Cormorant Garamond).

app/page.tsx           Redirects / → / (handled by store layout).

app/globals.css        Full design system: CSS custom properties (--bg-base, --accent etc.),
                       dark mode vars under [data-theme="dark"], Tailwind base/components/utilities,
                       shared utility classes (btn-wood, btn-outline, form-input, status-badge,
                       card-hover, img-zoom, animated-underline), blog-content typography.

app/not-found.tsx      Global 404 page — branded, links back to homepage.

app/sitemap.ts         Dynamic XML sitemap — all static pages + every published product slug
                       + every category slug + every published blog post slug.

app/robots.ts          robots.txt — allows all crawlers, blocks /admin/, /api/, /inquiry-cart.
```

---

## app/(store)/ — Customer-Facing Pages

All pages here are Server Components that fetch data and either render directly
or pass serialised props to a 'use client' shell component.

```
(store)/layout.tsx          Server. Fetches nav visibility settings (5 nav_show_* keys) from
                            SiteContent table. Passes navSettings to Navbar + Footer.
                            Also wraps in WhatsAppFloat.

(store)/page.tsx            Homepage. Fetches: featured products, categories, featured testimonials,
                            3 latest published blog posts. Renders: hero, categories grid,
                            marquee strip, featured products, about preview, B2B banner,
                            testimonials (DB), blog preview. Includes LocalBusiness JSON-LD.

(store)/about/page.tsx      About Us page — fully static Server Component with metadata.

(store)/contact/page.tsx    Server shell → ContactClient. Exports metadata via buildMetadata().
(store)/contact/metadata.ts Duplicate metadata export (legacy — contact/page.tsx already exports it).

(store)/gallery/page.tsx    Server shell → GalleryClient. Exports metadata.

(store)/bulk-orders/page.tsx        Server shell → BulkOrdersClient. Exports metadata + FAQ JSON-LD.
(store)/bulk-orders/metadata.ts     Duplicate metadata (legacy).

(store)/inquiry-cart/page.tsx       Server shell → InquiryCartClient.
                                    noIndex (robots: index:false) — cart pages not crawlable.

(store)/track-order/page.tsx        Server shell → TrackOrderClient.
                                    Passes searchParams.q (pre-fill from URL) as initialQuery prop.

(store)/products/page.tsx           Server. Fetches all products + categories for filter.
                                    Renders product grid using ProductCard component.

(store)/products/[slug]/page.tsx    Server. generateStaticParams + generateMetadata per product.
                                    Fetches product + related products. Adds Product JSON-LD
                                    + BreadcrumbList JSON-LD. Renders → ProductDetailClient.

(store)/blog/page.tsx               Server. Fetches published posts (optionally filtered by category).
                                    Featured post (first with coverImage) gets hero treatment.
                                    Rest shown in 3-column grid. Category filter tabs.

(store)/blog/[slug]/page.tsx        Server. generateStaticParams + generateMetadata per post.
                                    Increments view count via DB. Fetches prev/next posts.
                                    Renders article with Article JSON-LD + BreadcrumbList.
                                    Includes markdown → HTML renderer (no library).
```

---

## app/(admin)/admin/ — Admin Panel

Protected by `(admin)/admin/layout.tsx`. Public exceptions: login + register have their own
passthrough `layout.tsx` files to bypass the auth check.

```
(admin)/admin/layout.tsx            Master admin layout. Reads x-pathname header from middleware.
                                    If path is /admin/login or /admin/register → renders children
                                    directly (no auth). Otherwise calls getAdminSession() →
                                    redirects to login if null. Renders AdminSidebar + main area.

(admin)/admin/login/layout.tsx      Passthrough layout — lets login page bypass admin auth layout.
(admin)/admin/login/page.tsx        'use client'. Login form. Handles pending_approval response
                                    with amber banner (not red error). Show/hide password toggle.
                                    Links to /admin/register.

(admin)/admin/register/layout.tsx   Passthrough layout — lets register page bypass admin auth layout.
(admin)/admin/register/page.tsx     'use client'. Public registration form. Password strength meter
                                    (5 levels, live rules). Reason for access field (min 20 chars).
                                    On success shows "what happens next" 4-step screen.

(admin)/admin/page.tsx              Dashboard. Fetches stat counts, recent orders, recent inquiries.
                                    Renders stat cards + recent orders table + recent inquiries list
                                    + quick action links.

(admin)/admin/analytics/page.tsx    Server shell → AnalyticsDashboard (fully client).

(admin)/admin/products/page.tsx     Server. Lists all products with image thumbnails. Delete button.
(admin)/admin/products/new/page.tsx Server. Fetches categories → ProductForm (create mode).
(admin)/admin/products/[id]/edit/   Server. Fetches product + categories → ProductForm (edit mode).

(admin)/admin/categories/page.tsx   Server. Fetches categories → CategoryManager client component.

(admin)/admin/orders/page.tsx       Server. Fetches all orders → OrderStatusUpdater per row.

(admin)/admin/inquiries/page.tsx    Server. Fetches all inquiries → MarkReadButton per row.

(admin)/admin/gallery/page.tsx      Server. Fetches gallery items → AdminGalleryClient.

(admin)/admin/testimonials/page.tsx Server. Fetches all testimonials → TestimonialsManager.

(admin)/admin/blog/page.tsx         Server. Lists all blog posts — shows published/draft badges,
                                    view counts, category. Links to new + edit pages.

(admin)/admin/blog/new/page.tsx     Server shell → BlogEditor (create mode).

(admin)/admin/blog/[slug]/edit/     Server. Fetches post by slug → BlogEditor (edit mode).

(admin)/admin/content/page.tsx      Server. Fetches all SiteContent keys (text + nav_show_* flags)
                                    → ContentEditor client component.

(admin)/admin/inventory/page.tsx    Server. Fetches all non-deleted inventory items + computes
                                    summary stats (total, totalValue, lowStock, outOfStock,
                                    byCategory counts) → InventoryManager client component.

(admin)/admin/users/page.tsx        Server. Super admin only (redirects if not isSuperAdmin).
                                    Fetches all admins → UsersManager client component.
```

---

## app/api/ — REST API Routes

All admin-write routes call `getAdminSession()` and return 401 if null.
Public read routes (products, categories, blog) have no auth.

```
── Auth ──────────────────────────────────────────────────────────────────────

api/auth/login/route.ts         POST. Verifies email+password. Checks isActive (returns
                                pending_approval error code if false). Sets httpOnly JWT cookie.

api/auth/logout/route.ts        POST. Clears admin_token cookie.

api/auth/register/route.ts      POST. Public. Validates name/email/password strength/reason.
                                Creates Admin(isActive=false). Emails all isSuperAdmin admins.

── Products ──────────────────────────────────────────────────────────────────

api/products/route.ts           GET (public, with filters). POST (admin — creates product).
api/products/[id]/route.ts      GET (admin). PATCH (admin — update). DELETE (admin).

── Categories ────────────────────────────────────────────────────────────────

api/categories/route.ts         GET (public). POST (admin).
api/categories/[id]/route.ts    PATCH (admin). DELETE (admin).

── Orders ────────────────────────────────────────────────────────────────────

api/orders/route.ts             GET (admin, with filters). POST (public — submit inquiry cart).
api/orders/[id]/route.ts        GET (admin). PATCH (admin — update status only).
                                Valid statuses: PENDING | CONFIRMED | IN_PRODUCTION | DELIVERED | CANCELLED

── Inquiries ─────────────────────────────────────────────────────────────────

api/inquiries/route.ts          GET (admin). POST (public — contact form submission).
api/inquiries/[id]/route.ts     PATCH (admin — mark read/unread). DELETE (admin).

── Gallery ───────────────────────────────────────────────────────────────────

api/gallery/route.ts            GET (public). POST (admin — create item, expects imageUrl).
api/gallery/[id]/route.ts       PATCH (admin — update). DELETE (admin).

── Testimonials ──────────────────────────────────────────────────────────────

api/testimonials/route.ts       GET (public). POST (admin — create).
api/testimonials/[id]/route.ts  PATCH (admin — update name/role/quote/rating/featured/order).
                                DELETE (admin).

── Blog ──────────────────────────────────────────────────────────────────────

api/blog/route.ts               GET (public — only published; ?admin=true returns all including
                                drafts; ?category= filter). POST (admin — create post, auto-generates
                                slug from title + timestamp suffix, auto-calculates readTime).

api/blog/[slug]/route.ts        GET (public — increments views counter; admin=true skips increment).
                                PATCH (admin — update any field, sets publishedAt on first publish).
                                DELETE (admin).

── Order Tracking (public) ───────────────────────────────────────────────────

api/track-order/route.ts        GET. Public. Searches by orderNumber (exact) OR email.
                                Returns max 10 orders. Masks email + phone in response.

api/track-order/cancel/route.ts POST. Public. Requires orderNumber + email to match in DB.
                                Only PENDING orders can be cancelled. Updates status to CANCELLED.
                                Emails admin notification on cancel.

── Inventory (admin-only) ────────────────────────────────────────────────────

api/admin/inventory/route.ts                GET. Returns all items (isDeleted=false by default;
                                            ?deleted=true to include). Also returns summary object:
                                            { total, totalValue, lowStock, outOfStock, byCategory }.
                                            POST. Creates InventoryItem. Validates category,
                                            auto-computes status and totalValue. Logs initial
                                            STOCK_IN transaction if opening qty > 0.

api/admin/inventory/[id]/route.ts           GET. Returns single item with last 50 transactions
                                            (all with createdBy name).
                                            PATCH. Updates any field. If quantity changes, auto-logs
                                            ADJUSTMENT transaction with ±diff. Recomputes status +
                                            totalValue. Guards against updating deleted items.
                                            DELETE (soft). Sets isDeleted=true, deletedAt, deletedById,
                                            deletionReason (required in body). Logs final STOCK_OUT
                                            transaction for audit trail. Never hard-deletes.

api/admin/inventory/[id]/transaction/route.ts  POST. Records a stock movement. Types: STOCK_IN |
                                               STOCK_OUT | ADJUSTMENT | RETURN | DAMAGE | TRANSFER.
                                               Guards: qty must be positive; OUT types cannot take
                                               stock below 0. Records unitCost + totalCost at time of
                                               transaction. Updates item quantity, totalValue, status.

── Admin-only endpoints ──────────────────────────────────────────────────────

api/admin/analytics/route.ts    GET. Requires session. ?months=3|6|12. Returns: monthlyData
                                (orders/b2b/b2c/inquiries/revenue per month), b2bTotal, b2cTotal,
                                statusData, topProductsData (by order item count), summary KPIs.

api/admin/export/route.ts       GET. Requires session. ?type=orders|inquiries|products
                                &format=csv|xlsx &from=YYYY-MM-DD &to=YYYY-MM-DD.
                                Builds CSV (UTF-8 BOM) or XLSX (pure OOXML ZIP) with no library.

api/admin/content/route.ts      GET (all SiteContent records). PUT (upsert multiple keys at once).

api/admin/stats/route.ts        GET. Dashboard summary: counts for orders/inquiries/products/admins.

api/admin/users/route.ts        GET. Super admin only. Returns all admins ordered by
                                (isSuperAdmin desc, isActive desc, createdAt asc).

api/admin/users/[id]/route.ts   PATCH. Super admin only. action: approve | deactivate |
                                promote | demote. Each sends email to affected admin.
                                Guard: cannot action own account.
                                DELETE. Super admin only. Cannot delete self.
```

---

## components/layout/ — Site-Wide Layout

```
Navbar.tsx          'use client'. Receives navSettings props (from store layout).
                    Renders: logo, desktop nav links, "Order Details" dropdown (Bulk Orders +
                    Track Order children), Blog link, cart icon with badge, theme toggle,
                    "Get Quote" CTA. Mobile: hamburger → accordion. Dropdown closes on
                    outside click + route change. showOrderDetails computed from children.

Footer.tsx          Server Component. Receives navSettings props. Renders quick links,
                    contact info, social section. Filters quick links based on nav_show_* flags.

WhatsAppFloat.tsx   'use client'. Fixed bottom-right WhatsApp bubble. Pre-filled general inquiry
                    message. Uses NEXT_PUBLIC_WHATSAPP_NUMBER env var.
```

---

## components/store/ — Customer-Facing Client Components

```
ProductCard.tsx          'use client'. Product grid card — image, name, category badge,
                         material, price (or "Price on request"), AddToCartButton.

ProductDetailClient.tsx  'use client'. Full product detail page — image gallery (thumbnail
                         strip), specs table, WhatsApp inquiry button, AddToCartButton variants.

InquiryCartClient.tsx    'use client'. Multi-item inquiry cart. Reads CartContext.
                         Qty +/- per item, per-item notes, B2C/B2B radio, contact form.
                         Submits one POST /api/orders for all items. Success screen links to
                         track-order with pre-filled order number.

TrackOrderClient.tsx     'use client'. Receives initialQuery from URL searchParams.
                         Search form → GET /api/track-order. Renders OrderCard per result.
                         OrderCard: animated 4-step progress tracker (SVG progress bar +
                         pulsing ring on current step), cancel flow (email confirmation panel),
                         items list, status badge.

GalleryClient.tsx        'use client'. Fetches gallery items from API on mount. Masonry grid
                         with category filter tabs. Lightbox with keyboard nav (← → Esc).

BulkOrdersClient.tsx     'use client'. B2B bulk order page — features grid, quote form,
                         WhatsApp CTA, FAQ accordion.

ContactClient.tsx        'use client'. Contact form — POST /api/inquiries. Shows success message.
```

---

## components/admin/ — Admin Panel Components

```
AdminSidebar.tsx         'use client'. Grouped accordion sidebar. Accepts admin + isSuperAdmin.
                         Structure:
                           Standalone: Dashboard, Analytics
                           Catalogue  (accordion) → Products, Categories, Gallery
                           Sales & CRM (accordion) → Orders, Inquiries
                           Manufacturing (accordion) → Inventory
                           Content (accordion) → Blog, Testimonials, Content & Nav
                           Super Admin section (isSuperAdmin only) → Team
                         Accordion behaviour: group headers are toggle buttons (not links).
                         Active child auto-opens its parent on mount and route change.
                         Active items: white text + bg-white/10 + wood-400 icon tint.
                         Width reduced to w-56 (from w-64). All icons extracted to Icon object.
                         ⭐ badge in footer (no text label — just star icon to save space).

AdminGalleryClient.tsx   'use client'. Gallery management — drag-drop file upload (POST /api/upload
                         then POST /api/gallery), featured star toggle, delete. Image grid preview.

AnalyticsDashboard.tsx   'use client'. Full analytics UI. Fetches /api/admin/analytics on mount.
                         Charts/Table toggle. Charts: stacked bar (orders over time), donut
                         (B2B vs B2C), horizontal bars (status breakdown, top products), dual
                         line chart (orders vs inquiries trend). All pure SVG — no library.
                         Fixed coordinate system: CW=460, CH=140, ML=36, MB=24.
                         Table: monthly breakdown, status table, top products table.
                         Export panel: type/format/date-range selector + quick export shortcuts.

BlogEditor.tsx           'use client'. Blog post editor. Write/Preview tabs (live markdown preview).
                         Cover image upload via /api/upload. Category selector, comma-separated tags.
                         Auto read-time from word count. Publish Now / Save as Draft buttons.
                         Calls POST /api/blog (create) or PATCH /api/blog/[slug] (update).

BlogPostEditor.tsx       'use client'. Appears to be an older/duplicate version of BlogEditor.tsx.
                         ⚠️  Check if still used — may be safe to delete.

CategoryManager.tsx      'use client'. Category CRUD — inline add/edit form + list. Calls
                         /api/categories. Supports name, slug (auto-generated), description, imageUrl.

ContentEditor.tsx        'use client'. Two sections: (1) Navigation Visibility — toggle switches
                         for Gallery, Bulk Orders, Blog, About, Contact with parent-badge for
                         items inside dropdowns. (2) Text fields — Hero, About, Contact info.
                         Single "Save All Changes" → PUT /api/admin/content.

DeleteProductButton.tsx  'use client'. Single delete button with confirm dialog → DELETE
                         /api/products/[id] → router.refresh().

MarkReadButton.tsx       'use client'. Toggle read/unread on inquiries → PATCH /api/inquiries/[id].

OrderStatusUpdater.tsx   'use client'. Status dropdown per order row. Options: PENDING |
                         CONFIRMED | IN_PRODUCTION | DELIVERED | CANCELLED → PATCH /api/orders/[id].

ProductForm.tsx          'use client'. Create/edit product form. Drag-drop multi-image upload
                         (POST /api/upload). Reorder images, set primary. All product fields:
                         name, slug (auto), description, category, material, dimensions,
                         price, MOQ, featured, inStock.

InventoryManager.tsx     'use client'. Full inventory management UI (597 lines).
                         4-tab layout (All / Raw Materials / WIP / Finished Goods / MRO).
                         Summary cards: total items, total value, low stock count, out-of-stock count.
                         Table: name+SKU, category+sub, quantity (coloured by threshold), unit cost,
                         total value, location, status badge, updated-by, action buttons.
                         Add/Edit panel: right-side drawer with full form — name, SKU, category,
                         sub-category, unit, qty, min/max qty thresholds, unit cost (live total
                         value preview), supplier, location.
                         Soft delete modal: requires deletion reason before confirming.
                         Detail panel: item info grid + Record Movement form (type, qty, cost,
                         reason, reference) + full transaction history timeline.
                         Reload after every mutation. showDeleted toggle for audit view.

TestimonialsManager.tsx  'use client'. Split layout — sticky form (left) + list (right).
                         Star rating picker (1-5). Featured toggle (shows/hides on homepage).
                         CRUD via /api/testimonials. Instant optimistic UI updates.

UsersManager.tsx         'use client'. Two sections: pending approvals (amber pulsing dot, top)
                         + active admins list. Actions: approve | deactivate | promote | demote
                         → confirmation modal → PATCH /api/admin/users/[id]. Toast notifications.
                         Cannot action own account. Delete (permanent) with browser confirm.
```

---

## components/ui/ — Shared Primitives

```
CartContext.tsx      'use client'. React context + localStorage persistence for inquiry cart.
                     Exports: CartProvider, useCart(), CartItem type.
                     Cart state: array of { productId, productName, slug, imageUrl, quantity, notes }.

CartIcon.tsx         'use client'. Navbar cart icon — reads count from CartContext. Shows badge
                     when count > 0. Colour adapts to scrolled/home state (passed as props).

AddToCartButton.tsx  'use client'. Three variants (icon | outline | full). Reads + writes CartContext.
                     Shows "In List" state when product already in cart. Instant feedback.

ThemeProvider.tsx    'use client'. Context for dark/light mode. Reads/writes localStorage.
                     Sets data-theme="dark"|"light" on <html>. Exports: ThemeProvider, useTheme().

ThemeToggle.tsx      'use client'. Sun/moon pill toggle button. Calls toggle() from ThemeProvider.

WhatsAppButton.tsx   'use client'. Reusable WhatsApp CTA button. Props: href (wa.me URL), label,
                     size (sm|md|lg), variant (solid|outline). Opens in new tab.
```

---

## lib/ — Server-Side Utilities

```
lib/prisma.ts        Prisma client singleton — standard globalThis pattern to prevent
                     multiple instances during Next.js hot reload in development.

lib/auth.ts          JWT + session utilities.
                     hashPassword() / verifyPassword() — bcrypt wrappers.
                     generateToken(payload) — signs JWT, 7d expiry.
                     verifyToken(token) — returns JwtPayload or null.
                     getAdminSession() — reads admin_token cookie → verifies JWT → fetches
                       admin from DB → checks isActive → returns session or null.
                     generateOrderNumber() — returns "CRF-{timestamp36}-{random4}" string.
                     ⚠️  Uses next/headers — cannot be imported in middleware.ts.

lib/email.ts         Nodemailer email utility. createTransporter() returns null if SMTP not
                     configured (emails silently skip). Exports:
                     adminNewOrderEmail() — HTML template for new order notification to admin.
                     customerOrderConfirmationEmail() — HTML template for customer confirmation.
                     adminNewInquiryEmail() — HTML template for new inquiry notification.
                     sendEmail({ to, subject, html }) — sends via transporter.
                     ⚠️  Always fire-and-forget: sendEmail(...).catch(err => console.error(...)).

lib/seo.ts           SEO utilities. Exports:
                     buildMetadata({ title, description, path, image, noIndex, keywords })
                       — returns Next.js Metadata with canonical, og:*, twitter:*, robots.
                     localBusinessJsonLd() — FurnitureStore schema for homepage.
                     productJsonLd(product) — Product schema for product detail pages.
                     breadcrumbJsonLd(crumbs) — BreadcrumbList schema.
                     faqJsonLd(faqs) — FAQPage schema for bulk orders page.

lib/whatsapp.ts      WhatsApp link generators. Exports:
                     whatsappProductLink({ productName, slug }) — product inquiry message.
                     whatsappBulkOrderLink(company?) — bulk order enquiry message.
                     whatsappGeneralLink(message?) — general inquiry message.
                     All return wa.me/{number}?text={encoded} URLs.
```

---

## prisma/ — Database

```
prisma/schema.prisma    13 models: Category, Product, ProductImage, Order, OrderItem,
                        Inquiry, Admin, SiteContent, GalleryItem, Testimonial, BlogPost,
                        InventoryItem, InventoryTransaction.
                        Admin model has 4 named inventory relations (createdBy / updatedBy /
                        deletedBy / transactionCreatedBy) using @relation("Name") syntax.
                        SQLite provider (change to postgresql for production).
                        See project_context.md §4 for field details.

prisma/seed.ts          Seeds: 1 super admin (admin@craftura.com / admin123, isActive=true,
                        isSuperAdmin=true), 6 categories, 6 products with images, gallery items,
                        site content defaults (including nav_show_* = 'true'), 3 testimonials,
                        2 blog posts (teak sourcing + sofa buying guide).
```

---

## .ai/ — AI Context Files

```
.ai/project_context.md    High-level memory: goal, patterns, all pages, all APIs, recent
                          changes, open TODOs. Read this first every session.

.ai/architecture.md       This file — every file with a one-line summary.
                          Read when you need to find which file to open.
```

---

_Last updated: after sidebar grouped accordion refactor — Catalogue / Sales & CRM / Manufacturing / Content groups, auto-open active parent, w-56 width._
