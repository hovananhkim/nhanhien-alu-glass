# NhanHien — Database Schema Reference

> Open this file when touching: prisma/schema.prisma, seed.ts, any API that queries DB, or any new model.

**Provider:** SQLite (`file:./dev.db`) — change provider + DATABASE_URL to switch to PostgreSQL. No other code changes needed.  
**ORM:** Prisma 5. After schema changes always run: `npx prisma db push` then `npx prisma generate`.

---

## All 13 Models

### Product

```
id, name, slug (unique), description, dimensions?, material?,
price?, moq?, featured (bool), inStock (bool),
categoryId (FK → Category), createdAt, updatedAt
→ relations: category, images (ProductImage[]), orderItems (OrderItem[])
```

### Category

```
id, name (unique), slug (unique), description?, imageUrl?,
createdAt, updatedAt
→ relations: products (Product[])
```

### ProductImage

```
id, url, altText?, isPrimary (bool), order (int),
productId (FK → Product, cascade delete)
```

### Order

```
id, orderNumber (unique, format: CRF-{timestamp36}-{random4}),
customerName, email, phone, address, notes?,
orderType ("B2C" | "B2B"), status ("PENDING"),
createdAt, updatedAt
→ relations: items (OrderItem[])
```

**Statuses:** `PENDING → CONFIRMED → IN_PRODUCTION → DELIVERED` · also `CANCELLED`  
Customer can self-cancel PENDING only (API: POST /api/track-order/cancel, requires email verify).  
Admin can set any status via PATCH /api/orders/[id].

### OrderItem

```
id, quantity, notes?,
orderId (FK → Order, cascade delete), productId (FK → Product)
```

### Inquiry

```
id, name, email, phone, subject?, message, isRead (bool, default false),
createdAt
```

Contact form submissions. No relation to Order — separate pipeline.

### Admin

```
id, email (unique), password (bcrypt), name,
role ("admin" | "superadmin"), isActive (bool, default false),
isSuperAdmin (bool, default false), createdAt, updatedAt
→ inventory relations: inventoryCreated[], inventoryUpdated[],
  inventoryDeleted[], inventoryTransactions[]
```

⚠️ `isActive=false` until super admin approves. Login blocked if false (returns `error: 'pending_approval'`).

### SiteContent

```
id, key (unique), value, updatedAt
```

Key-value CMS. Nav visibility keys: `nav_show_gallery`, `nav_show_bulk_orders`,
`nav_show_blog`, `nav_show_about`, `nav_show_contact` (all default `'true'`).

### GalleryItem

```
id, title, description?, imageUrl, category (default "General"),
featured (bool), order (int), createdAt, updatedAt
```

### Testimonial

```
id, name, role, location, quote, rating (1–5, default 5),
featured (bool, default true), order (int),
createdAt, updatedAt
```

Homepage shows only `featured=true` records, ordered by `order` asc.

### BlogPost

```
id, title, slug (unique), excerpt, content (markdown),
coverImage?, category (default "General"), tags (comma-separated string),
published (bool), readTime (int, auto-calc: words/200),
views (int, incremented on public GET), createdAt, updatedAt, publishedAt?
```

`publishedAt` set on first publish. Public API returns only `published=true`.

### InventoryItem

```
id, name, sku (unique)?, description?,
category ("RAW_MATERIAL"|"WIP"|"FINISHED_GOOD"|"MRO"), subCategory?,
unit (default "pieces"), quantity (float), minQuantity?, maxQuantity?,
unitCost?, totalValue (quantity × unitCost snapshot),
supplier?, supplierContact?, location?,
status ("ACTIVE"|"LOW_STOCK"|"OUT_OF_STOCK"|"DISCONTINUED"),
isDeleted (bool, default false), deletedAt?, deletedById?, deletionReason?,
createdById?, updatedById?, createdAt, updatedAt
→ relations: transactions (InventoryTransaction[])
```

**NEVER hard-delete.** Always soft-delete: set `isDeleted=true` + `deletedAt` + `deletionReason`.  
Status auto-computed: qty≤0 → OUT_OF_STOCK, qty≤minQty → LOW_STOCK, else ACTIVE.

### InventoryTransaction

```
id, inventoryId (FK → InventoryItem),
type ("STOCK_IN"|"STOCK_OUT"|"ADJUSTMENT"|"RETURN"|"DAMAGE"|"TRANSFER"),
quantity (float, always positive — type determines direction),
unitCost?, totalCost (qty × unitCost at transaction time),
reason?, reference (PO/batch number)?,
stockAfter (snapshot of qty after this txn),
createdById?, createdAt
```

OUT types (decrease stock): STOCK_OUT, DAMAGE, TRANSFER  
IN types (increase stock): STOCK_IN, RETURN, ADJUSTMENT  
Guard: OUT types cannot take stock below 0.

---

## Named Relations on Admin (required for Prisma)

```prisma
inventoryCreated      InventoryItem[]        @relation("InventoryCreatedBy")
inventoryUpdated      InventoryItem[]        @relation("InventoryUpdatedBy")
inventoryDeleted      InventoryItem[]        @relation("InventoryDeletedBy")
inventoryTransactions InventoryTransaction[] @relation("TransactionCreatedBy")
```

---

## Seed Data (prisma/seed.ts)

- 1 super admin: `admin@craftura.com` / `admin123` (isActive=true, isSuperAdmin=true)
- 6 categories, 6 products with images
- Gallery items
- SiteContent defaults (hero text, contact info, all nav*show*\* = 'true')
- 3 testimonials (featured=true)
- 2 blog posts (published=true): teak sourcing + sofa buying guide
