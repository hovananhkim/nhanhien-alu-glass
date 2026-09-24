# NhanHien — Changelog & TODOs

> Update the "Recent Changes" section at the end of every session that makes meaningful changes.
> Keep only the last 10 changes. Move older ones to the bottom under "Archived".

---

## Open TODOs (prioritised)

### High Priority

- [ ] **Deploy** to Vercel + migrate DB to PostgreSQL (Neon/Supabase) — 2 line change in schema + env
- [ ] **Cloudinary/S3** for image uploads — only `app/api/upload/route.ts` needs changing
- [ ] **B2B account registration** + order history portal

### Medium Priority

- [ ] **Homepage gallery preview** — gallery exists at /gallery, not previewed on homepage
- [ ] **Image optimization** — convert uploads to WebP on save (in upload API)
- [ ] **Product comparison** tool — side-by-side specs for 2–3 products
- [ ] **Downloadable PDF** product catalogue — auto-generated from product data
- [ ] **Rate limiting** on public APIs (track-order, orders POST, inquiries POST)
- [ ] **Inventory reports** — cost-to-manufacture, category spend, price trends (data already in DB)

### Low Priority / Future

- [ ] Click-to-call floating button (mobile) — `tel:` link, similar to WhatsApp float
- [ ] Online payment (Razorpay / Stripe)
- [ ] PWA manifest + service worker
- [ ] Multi-language support (Hindi / Gujarati) with `next-intl`
- [ ] Staff roles / permissions (granular beyond superAdmin/admin)
- [ ] B2B custom price lists per client

---

## Recent Changes (newest first)

1. **AdminSidebar grouped accordion** — flat 10-item list replaced with grouped accordion.
   Groups: Catalogue (Products/Categories/Gallery), Sales & CRM (Orders/Inquiries),
   Manufacturing (Inventory), Content (Blog/Testimonials/Content & Nav). Standalone:
   Dashboard, Analytics. Active child auto-opens parent on mount + route change.
   Width w-64 → w-56. All SVGs extracted to `Icon` object.

2. **Inventory module** — `InventoryItem` + `InventoryTransaction` DB models.
   4 categories: RAW_MATERIAL / WIP / FINISHED_GOOD / MRO.
   Full CRUD: create, edit, soft-delete (reason required, never hard-delete).
   Stock movements: STOCK_IN / STOCK_OUT / ADJUSTMENT / RETURN / DAMAGE / TRANSFER.
   Each transaction stores `unitCost` + `totalCost` at time of transaction for future
   cost reports. `stockAfter` snapshot enables timeline reconstruction.
   Summary cards: total items, total value, low stock, out-of-stock.
   `/admin/inventory` page + 3 API routes.

3. **Admin registration + approval workflow** — `/admin/register` (public form with
   password strength meter + reason field). Creates Admin(isActive=false). Emails all
   super admins. `/admin/users` (super admin only) — approve/deactivate/promote/demote.
   Each action sends email to affected user. Cannot action own account.

4. **Middleware fix** — removed `verifyToken` import which crashed Edge Runtime.
   Now cookie-presence check only. Middleware sets `x-pathname` header so admin layout
   can skip auth redirect for login/register without infinite loop.

5. **Testimonials (#16)** — `Testimonial` DB model, `TestimonialsManager.tsx`,
   `/admin/testimonials`. Homepage fetches from DB (featured=true only).
   Hardcoded testimonials array removed from homepage.

6. **Blog / Craft Stories (#17)** — `BlogPost` DB model, `BlogEditor.tsx`,
   public `/blog` + `/blog/[slug]`, admin `/admin/blog`. Article JSON-LD,
   view counter increment on public GET, prev/next navigation, CTA box.
   Blog link added to navbar (desktop + mobile) with admin visibility toggle.

7. **Analytics (#11) + Export (#12)** — `AnalyticsDashboard.tsx` with 6 pure SVG charts
   (no library). Charts/Table view toggle. Export panel: CSV + XLSX (pure OOXML ZIP,
   no library) for orders/inquiries/products with date range filter.

8. **Order tracking (#4)** — `/track-order` with animated 4-step SVG progress tracker.
   Customer self-cancel (PENDING only, email verification). Admin email on cancel.
   "Track Order" live in navbar under "Order Details" dropdown.

9. **Nav visibility control** — Admin toggles per-page nav items from CMS.
   `nav_show_*` keys in SiteContent. Parent "Order Details" auto-hides when all children
   hidden. `showOrderDetails` computed variable in Navbar.

10. **Inquiry cart + dark mode + SEO** — CartContext (localStorage), CartIcon, AddToCartButton.
    Dark mode CSS variable system. Dynamic sitemap, robots.txt, JSON-LD on all key pages.

---

## Archived (older changes)

- Initial project setup: Next.js 14, Prisma, SQLite, Tailwind 3, JWT auth
- Product/Category/Order/Inquiry CRUD
- Gallery management with image upload
- Admin panel: Dashboard, Products, Categories, Orders, Inquiries, Gallery, Content & Nav
- WhatsApp integration (float button + pre-filled product/bulk/general messages)
- Email notifications (Nodemailer): new order, order confirmation, new inquiry
