# NhanHien — Pages Reference

> Open this file when adding a new page, changing routing, or unsure which file handles a URL.

---

## Customer Pages `app/(store)/`

All store pages are wrapped by `app/(store)/layout.tsx` which fetches nav settings from DB and passes to Navbar + Footer.

| URL                | File                               | Type   | Notes                                                                                                                               |
| ------------------ | ---------------------------------- | ------ | ----------------------------------------------------------------------------------------------------------------------------------- |
| `/`                | `(store)/page.tsx`                 | Server | Fetches: featured products, categories, testimonials (featured=true), 3 latest blog posts. Includes LocalBusiness JSON-LD.          |
| `/products`        | `(store)/products/page.tsx`        | Server | All products + categories for filter. Renders `ProductCard` components.                                                             |
| `/products/[slug]` | `(store)/products/[slug]/page.tsx` | Server | `generateStaticParams` + `generateMetadata` + Product JSON-LD + BreadcrumbList JSON-LD. Renders → `ProductDetailClient`.            |
| `/gallery`         | `(store)/gallery/page.tsx`         | Shell  | Exports metadata → `GalleryClient`. Masonry grid + category filter + keyboard lightbox.                                             |
| `/blog`            | `(store)/blog/page.tsx`            | Server | Published posts only. Featured post (first with coverImage) = hero. Rest in 3-col grid. Category filter tabs.                       |
| `/blog/[slug]`     | `(store)/blog/[slug]/page.tsx`     | Server | `generateStaticParams` + `generateMetadata`. Increments view count. Prev/next posts. Article JSON-LD. Markdown → HTML (no library). |
| `/bulk-orders`     | `(store)/bulk-orders/page.tsx`     | Shell  | Exports metadata + FAQ JSON-LD → `BulkOrdersClient`. B2B quote form.                                                                |
| `/inquiry-cart`    | `(store)/inquiry-cart/page.tsx`    | Shell  | `robots: noIndex`. → `InquiryCartClient`. Multi-item cart + single order submission.                                                |
| `/track-order`     | `(store)/track-order/page.tsx`     | Shell  | Passes `searchParams.q` as `initialQuery` → `TrackOrderClient`. Animated 4-step tracker + cancel flow.                              |
| `/about`           | `(store)/about/page.tsx`           | Server | Static content, no DB fetch.                                                                                                        |
| `/contact`         | `(store)/contact/page.tsx`         | Shell  | Exports metadata → `ContactClient`. POST /api/inquiries on submit.                                                                  |

**Duplicate metadata files** (legacy, can be removed):

- `(store)/contact/metadata.ts`
- `(store)/bulk-orders/metadata.ts`

---

## Admin Pages `app/(admin)/admin/`

All wrapped by `app/(admin)/admin/layout.tsx` which:

1. Reads `x-pathname` header (set by middleware)
2. If `/admin/login` or `/admin/register` → renders children directly (no auth check)
3. Otherwise → `getAdminSession()` → redirect to `/admin/login` if null

**Public admin routes** (have their own passthrough `layout.tsx`):

- `(admin)/admin/login/layout.tsx` → passthrough
- `(admin)/admin/register/layout.tsx` → passthrough

| URL                         | File                                        | Notes                                                                                                                            |
| --------------------------- | ------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `/admin/login`              | `(admin)/admin/login/page.tsx`              | `'use client'`. Public. Handles `pending_approval` with amber banner. Show/hide password toggle. Links to register.              |
| `/admin/register`           | `(admin)/admin/register/page.tsx`           | `'use client'`. Public. Password strength meter (5 levels). Reason field (min 20 chars). Success screen with 4-step explanation. |
| `/admin`                    | `(admin)/admin/page.tsx`                    | Server. Stat cards + recent orders + recent inquiries + quick actions.                                                           |
| `/admin/analytics`          | `(admin)/admin/analytics/page.tsx`          | Shell → `AnalyticsDashboard` (fully client, fetches API on mount).                                                               |
| `/admin/products`           | `(admin)/admin/products/page.tsx`           | Server. Product list with image thumbnails + delete button.                                                                      |
| `/admin/products/new`       | `(admin)/admin/products/new/page.tsx`       | Server. Fetches categories → `ProductForm` (create mode).                                                                        |
| `/admin/products/[id]/edit` | `(admin)/admin/products/[id]/edit/page.tsx` | Server. Fetches product + categories → `ProductForm` (edit mode).                                                                |
| `/admin/categories`         | `(admin)/admin/categories/page.tsx`         | Server. Fetches categories → `CategoryManager`.                                                                                  |
| `/admin/orders`             | `(admin)/admin/orders/page.tsx`             | Server. All orders → `OrderStatusUpdater` per row.                                                                               |
| `/admin/inquiries`          | `(admin)/admin/inquiries/page.tsx`          | Server. All inquiries → `MarkReadButton` per row.                                                                                |
| `/admin/gallery`            | `(admin)/admin/gallery/page.tsx`            | Server. Gallery items → `AdminGalleryClient`.                                                                                    |
| `/admin/inventory`          | `(admin)/admin/inventory/page.tsx`          | Server. Fetches items + computes summary → `InventoryManager`.                                                                   |
| `/admin/testimonials`       | `(admin)/admin/testimonials/page.tsx`       | Server. All testimonials → `TestimonialsManager`.                                                                                |
| `/admin/blog`               | `(admin)/admin/blog/page.tsx`               | Server. Lists posts (published/draft badges, view counts).                                                                       |
| `/admin/blog/new`           | `(admin)/admin/blog/new/page.tsx`           | Shell → `BlogEditor` (create mode).                                                                                              |
| `/admin/blog/[slug]/edit`   | `(admin)/admin/blog/[slug]/edit/page.tsx`   | Server. Fetches post → `BlogEditor` (edit mode).                                                                                 |
| `/admin/content`            | `(admin)/admin/content/page.tsx`            | Server. Fetches SiteContent keys → `ContentEditor`.                                                                              |
| `/admin/users`              | `(admin)/admin/users/page.tsx`              | Server. **Super admin only** (redirects if not). All admins → `UsersManager`.                                                    |

---

## SEO / System Routes `app/`

| File                | Description                                                                                                    |
| ------------------- | -------------------------------------------------------------------------------------------------------------- |
| `app/sitemap.ts`    | Dynamic sitemap. Includes: static pages, all product slugs, all category slugs, all published blog post slugs. |
| `app/robots.ts`     | Blocks `/admin/`, `/api/`, `/inquiry-cart`. Allows all other crawlers.                                         |
| `app/not-found.tsx` | Global 404 — branded, links to homepage.                                                                       |

---

## Admin Sidebar Groups (for reference when adding new pages)

```
Standalone:       Dashboard (/admin)  ·  Analytics (/admin/analytics)
Catalogue:        Products · Categories · Gallery
Sales & CRM:      Orders · Inquiries
Manufacturing:    Inventory
Content:          Blog · Testimonials · Content & Nav
Super Admin only: Team (/admin/users)
```

To add a new admin page to the sidebar → open `components/admin/AdminSidebar.tsx` and add to the relevant group's `children` array in the `NAV` constant.
