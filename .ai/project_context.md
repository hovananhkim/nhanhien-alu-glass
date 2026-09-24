# NhanHien Fine Furniture — Project Context Index

> **For AI:** Do NOT read this whole file and then also open all sub-files.
> Read ONLY the sub-file relevant to your current task.
> Start with `session_start.md` at the top of every new chat.

---

## Sub-files — open only what you need

| File               | When to open                                        | ~Tokens |
| ------------------ | --------------------------------------------------- | ------- |
| `session_start.md` | **Every new chat** — paste at top of message        | ~150    |
| `schema.md`        | Touching DB models, Prisma queries, seed data       | ~600    |
| `api_routes.md`    | Touching any file in `app/api/`, or calling an API  | ~500    |
| `pages.md`         | Adding/changing a page, routing, metadata           | ~450    |
| `patterns.md`      | Auth, email, SEO, dark mode, nav settings, patterns | ~550    |
| `changelog.md`     | Reviewing recent changes, checking TODOs            | ~400    |
| `architecture.md`  | Finding which specific file to open for any task    | ~800    |

**Total if you read everything:** ~3,450 tokens  
**Typical session (1–2 sub-files):** ~300–700 tokens

---

## Project snapshot (read this, skip sub-files for quick questions)

**What:** Full-stack furniture manufacturing website — B2B/B2C customers + admin panel.  
**Stack:** Next.js 14 · Prisma 5 · SQLite → PostgreSQL-ready · Tailwind 3 · JWT auth · No UI lib  
**Versions (pinned):** `next@14.2.35` · `react@18.3.1` · `prisma@5.22.0` · `tailwindcss@3.4.4`  
**DB:** 13 models — Product, Category, ProductImage, Order, OrderItem, Inquiry, Admin,
SiteContent, GalleryItem, Testimonial, BlogPost, InventoryItem, InventoryTransaction  
**Admin URL:** `/admin` · Default login: `admin@craftura.com` / `admin123`  
**⚠️ Hard rules:**

- `middleware.ts` — ZERO imports from `lib/` (Edge Runtime crashes)
- Inventory items — NEVER hard delete, always soft delete with reason
- Email sends — always `.catch(err => console.error(err))`, never await in critical path

---

## Folder map (one-liner each)

```
app/(store)/          Customer pages — Server Components + 'use client' shell pattern
app/(admin)/admin/    Admin panel — JWT protected. login + register are public exceptions
app/api/              REST routes — no auth library, manual getAdminSession() per route
components/admin/     Admin UI (all 'use client') — one component per admin page section
components/store/     Customer UI (all 'use client') — one component per page interaction
components/layout/    Navbar, Footer, WhatsAppFloat — Navbar receives navSettings props
components/ui/        CartContext, ThemeProvider, AddToCartButton, WhatsAppButton
lib/                  prisma.ts, auth.ts, email.ts, seo.ts, whatsapp.ts
prisma/               schema.prisma (13 models) + seed.ts
middleware.ts         Edge Runtime — cookie check only + sets x-pathname header
```
