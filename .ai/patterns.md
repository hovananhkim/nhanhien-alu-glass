# NhanHien — Key Patterns & Decisions

> Open this file when implementing a new feature and unsure how things connect,
> or when adding auth, email, SEO, theming, or nav settings to something.

---

## Auth System

**Cookie:** `admin_token` — httpOnly, secure in prod, sameSite: lax, 7-day expiry.

**Session check (server-side):**

```ts
// lib/auth.ts
const admin = await getAdminSession();
if (!admin)
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
// admin = { id, email, name, isActive, isSuperAdmin, role }
```

**Super admin check:**

```ts
if (!session?.isSuperAdmin)
  return NextResponse.json(
    { error: "Super admin access required." },
    { status: 403 },
  );
```

**Admin layout x-pathname trick:**
Middleware sets `x-pathname` header on every request. Admin layout reads it to skip auth for `/admin/login` and `/admin/register` — prevents infinite redirect loop.

```ts
// app/(admin)/admin/layout.tsx
const headersList = await headers()
const pathname = headersList.get('x-pathname') || ''
if (pathname.startsWith('/admin/login') || pathname.startsWith('/admin/register')) {
  return <>{children}</>   // no auth check
}
const admin = await getAdminSession()
if (!admin) redirect('/admin/login')
```

**⚠️ middleware.ts hard rule:** ZERO imports from `lib/` or `next/headers`.
Both crash in Edge Runtime. Only `req.cookies` and `NextResponse` allowed.

---

## Server + Client Shell Pattern

All complex customer-facing pages use this pattern:

```
app/(store)/contact/page.tsx         ← Server Component
  - exports const metadata (SEO)
  - may include JSON-LD scripts
  - renders <ContactClient />

components/store/ContactClient.tsx   ← 'use client'
  - all useState, useEffect, event handlers
  - all API calls
  - all interactivity
```

Admin pages mostly: server page fetches data → passes as `initialData` prop to client component.
Exception: `/admin/analytics` is fully client-side (fetches on mount, no server data).

---

## Navigation Visibility (CMS-controlled)

5 toggleable nav items stored in `SiteContent` table:

| DB key                 | Controls                                     |
| ---------------------- | -------------------------------------------- |
| `nav_show_gallery`     | Gallery link                                 |
| `nav_show_bulk_orders` | "Order Details" dropdown + Bulk Orders child |
| `nav_show_blog`        | Blog link                                    |
| `nav_show_about`       | About Us link                                |
| `nav_show_contact`     | Contact link                                 |

**Data flow:** `app/(store)/layout.tsx` (server) fetches from DB → passes `navSettings` prop to `Navbar` and `Footer`. Never fetch nav settings client-side.

**Parent auto-hide:** "Order Details" dropdown uses:

```ts
const showOrderDetails = navSettings.nav_show_bulk_orders;
// When Order Tracking is added: || navSettings.nav_show_order_tracking
```

**Adding a new toggleable nav item:**

1. Add `nav_show_X: 'true'` to NAV_DEFAULTS in `app/(store)/layout.tsx`
2. Add to NavSettings interface in `Navbar.tsx` and `Footer.tsx`
3. Add to ContentEditor.tsx NAV_TABS array
4. Add to admin content page ALL_KEYS array + DEFAULTS object
5. Add to seed.ts SiteContent array

---

## Design System

**CSS variables** (all in `app/globals.css` under `:root` and `[data-theme="dark"]`):

```
--bg-base, --bg-surface, --bg-subtle, --bg-muted
--text-primary, --text-secondary, --text-muted, --text-faint
--accent, --accent-soft, --accent-text
--border-base, --border-subtle
--nav-bg, --shadow-hover
--color-wood-300 through --color-wood-600
```

**Dark mode:** `ThemeProvider` reads localStorage → sets `data-theme` on `<html>`. All components use `var(--*)` CSS variables. Never use hardcoded colours in store components.

**Admin panel** uses Tailwind classes directly (stone/charcoal/wood palette) — not CSS variables. Admin is always light mode.

**Shared utility classes** (defined in globals.css):

```
btn-wood          → primary wood-coloured CTA button
btn-outline       → outlined button (adapts to dark mode)
form-input        → standardised input/select/textarea
admin-input       → admin panel input (dark background)
admin-sidebar-link → sidebar nav item with active state
status-badge      → pill badge base
status-pending / status-confirmed / status-in_production / status-delivered / status-cancelled
card-hover        → subtle lift on hover
img-zoom          → overflow:hidden wrapper (child img scales on hover)
animated-underline → link underline animation
```

---

## Email System

```ts
// lib/email.ts
sendEmail({ to: string, subject: string, html: string }): Promise<void>
```

**Always fire-and-forget:**

```ts
sendEmail({ to, subject, html }).catch((err) =>
  console.error("[Email] failed:", err),
);
```

**Never block a user action waiting for email.** If SMTP env vars missing, `createTransporter()` returns null and emails silently skip — orders/actions still complete.

**Pre-built templates:**

- `adminNewOrderEmail(order)` — new order notification to admin
- `customerOrderConfirmationEmail(order)` — confirmation to customer
- `adminNewInquiryEmail(inquiry)` — new contact form to admin

---

## SEO Pattern (store pages)

```ts
// lib/seo.ts exports:
buildMetadata({ title, description, path, image?, noIndex?, keywords? })
localBusinessJsonLd()         // homepage — FurnitureStore schema
productJsonLd(product)        // product detail — Product schema
breadcrumbJsonLd(crumbs)      // any page with breadcrumbs
faqJsonLd(faqs)               // bulk orders page — FAQPage schema
```

**Usage:**

```ts
// In server page.tsx:
export const metadata = buildMetadata({ title: '...', description: '...', path: '/about' })

// JSON-LD in JSX:
<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
```

---

## Image Upload

```ts
// POST /api/upload — multipart/form-data with field name 'files'
// Returns: { urls: string[] }  — relative paths like /uploads/filename.jpg
// Saves to: public/uploads/
```

**⚠️ Vercel limitation:** `public/uploads/` is ephemeral on Vercel — files lost on redeploy.
To fix: update only `app/api/upload/route.ts` to use Cloudinary/S3. No other code changes needed.

---

## WhatsApp Links

```ts
// lib/whatsapp.ts
whatsappProductLink({ productName, slug })    // product inquiry
whatsappBulkOrderLink(company?)               // bulk order enquiry
whatsappGeneralLink(message?)                 // general inquiry
// All use NEXT_PUBLIC_WHATSAPP_NUMBER env var
// All return: `https://wa.me/{digits}?text={encoded}`
```

---

## Analytics Charts (pure SVG)

Fixed coordinate system — do not change these values without updating all chart functions:

```ts
const CW = 460; // canvas width (SVG units)
const CH = 140; // chart area height
const ML = 36; // left margin (Y-axis labels)
const MB = 24; // bottom margin (X-axis labels)
```

`yTicks(max)` → clean round number ticks.  
`skipEvery(n, total)` → show every Nth X-label to prevent overlap at 12 months.

---

## Inventory — Key Business Rules

- **Soft delete only.** Reason required. Record kept for cost reports.
- **Status is auto-computed** by API — never set manually unless overriding:
  `qty <= 0 → OUT_OF_STOCK · qty <= minQty → LOW_STOCK · else → ACTIVE`
- **totalValue** is a snapshot (`qty × unitCost`) updated on every change.
- **Transaction unitCost** = cost AT TIME of transaction — historical accuracy for cost reports.
- **stockAfter** on each transaction = allows reconstructing stock timeline at any point.
- **DAMAGE** is separate from **STOCK_OUT** intentionally — waste/loss vs production use.
- **reference** field = links to PO number or production batch for traceability.

---

## Prisma Gotchas

- After any schema change: `npx prisma db push` then `npx prisma generate`
- Admin model uses **named @relation()** for inventory audit trail — required because Admin has 4 separate relations to InventoryItem. If adding more relations to Admin, always use `@relation("UniqueName")`.
- `prisma.ts` uses globalThis singleton — prevents multiple client instances during hot reload.
