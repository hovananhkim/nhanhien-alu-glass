# {{t('ai.api_routes.header')}}

> {{t('ai.api_routes.open_note')}}

**{{t('ai.api_routes.auth_rule_label')}}:** {{t('ai.api_routes.auth_rule')}}  
**{{t('ai.api_routes.public_routes_label')}}:** {{t('ai.api_routes.public_routes')}}

---

## Auth `/api/auth/`

| Route                | Method | Auth   | Description                                                                                                                                                                |
| -------------------- | ------ | ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/api/auth/login`    | POST   | Public | Body: `{email, password}`. Checks isActive — returns `{error:'pending_approval'}` if false. Sets `admin_token` httpOnly cookie (7d).                                       |
| `/api/auth/logout`   | POST   | Public | Clears `admin_token` cookie.                                                                                                                                               |
| `/api/auth/register` | POST   | Public | Body: `{name, email, password, confirmPassword, reason (min 20 chars)}`. Creates Admin(isActive=false). Emails all isSuperAdmin admins. Returns `{success:true, message}`. |

---

## Catalogue `/api/products/` · `/api/categories/`

| Route                  | Method | Auth   | Description                                                             |
| ---------------------- | ------ | ------ | ----------------------------------------------------------------------- |
| `/api/products`        | GET    | Public | Supports filters. Returns products with images + category.              |
| `/api/products`        | POST   | Admin  | Creates product.                                                        |
| `/api/products/[id]`   | GET    | Admin  | Single product with all images.                                         |
| `/api/products/[id]`   | PATCH  | Admin  | Update any field.                                                       |
| `/api/products/[id]`   | DELETE | Admin  | Hard delete (also deletes images via cascade).                          |
| `/api/categories`      | GET    | Public | All categories.                                                         |
| `/api/categories`      | POST   | Admin  | Create category.                                                        |
| `/api/categories/[id]` | PATCH  | Admin  | Update.                                                                 |
| `/api/categories/[id]` | DELETE | Admin  | Delete.                                                                 |
| `/api/upload`          | POST   | Admin  | Multipart form. Saves to `public/uploads/`. Returns `{urls: string[]}`. |

---

## Sales `/api/orders/` · `/api/inquiries/`

| Route                 | Method | Auth   | Description                                                                                           |
| --------------------- | ------ | ------ | ----------------------------------------------------------------------------------------------------- |
| `/api/orders`         | GET    | Admin  | All orders with filters.                                                                              |
| `/api/orders`         | POST   | Public | Submit inquiry cart. Body includes customer info + items array. Auto-generates orderNumber (CRF-xxx). |
| `/api/orders/[id]`    | GET    | Admin  | Single order with items.                                                                              |
| `/api/orders/[id]`    | PATCH  | Admin  | Update status only. Valid: `PENDING\|CONFIRMED\|IN_PRODUCTION\|DELIVERED\|CANCELLED`.                 |
| `/api/inquiries`      | GET    | Admin  | All inquiries.                                                                                        |
| `/api/inquiries`      | POST   | Public | Contact form submission.                                                                              |
| `/api/inquiries/[id]` | PATCH  | Admin  | Toggle `isRead`.                                                                                      |
| `/api/inquiries/[id]` | DELETE | Admin  | Delete inquiry.                                                                                       |

---

## Gallery `/api/gallery/`

| Route               | Method | Auth   | Description                                        |
| ------------------- | ------ | ------ | -------------------------------------------------- |
| `/api/gallery`      | GET    | Public | All gallery items.                                 |
| `/api/gallery`      | POST   | Admin  | Create item (expects `imageUrl` already uploaded). |
| `/api/gallery/[id]` | PATCH  | Admin  | Update title/category/featured/order.              |
| `/api/gallery/[id]` | DELETE | Admin  | Delete item.                                       |

---

## Content `/api/testimonials/` · `/api/blog/`

| Route                    | Method | Auth   | Description                                                                                   |
| ------------------------ | ------ | ------ | --------------------------------------------------------------------------------------------- |
| `/api/testimonials`      | GET    | Public | All testimonials ordered by `order` asc.                                                      |
| `/api/testimonials`      | POST   | Admin  | Create. Auto-sets `order` to current count.                                                   |
| `/api/testimonials/[id]` | PATCH  | Admin  | Update any field including `featured`, `order`.                                               |
| `/api/testimonials/[id]` | DELETE | Admin  | Hard delete.                                                                                  |
| `/api/blog`              | GET    | Public | Published only. `?admin=true` returns all including drafts. `?category=X` filters.            |
| `/api/blog`              | POST   | Admin  | Create post. Auto-generates slug (title + timestamp36). Auto-calculates readTime (words/200). |
| `/api/blog/[slug]`       | GET    | Public | Single post. Increments `views` counter. `?admin=true` skips increment + returns drafts.      |
| `/api/blog/[slug]`       | PATCH  | Admin  | Update any field. Sets `publishedAt` on first publish.                                        |
| `/api/blog/[slug]`       | DELETE | Admin  | Hard delete.                                                                                  |

---

## Order Tracking `/api/track-order/` (public)

| Route                     | Method | Auth   | Description                                                                                                     |
| ------------------------- | ------ | ------ | --------------------------------------------------------------------------------------------------------------- |
| `/api/track-order`        | GET    | Public | `?q=` — search by orderNumber (exact) OR email. Returns max 10 orders. Email + phone masked in response.        |
| `/api/track-order/cancel` | POST   | Public | Body: `{orderNumber, email}` — both must match in DB. Only PENDING orders. Sets status=CANCELLED. Emails admin. |

---

## Admin-only `/api/admin/`

| Route                   | Method | Auth       | Description                                                                                                                       |
| ----------------------- | ------ | ---------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `/api/admin/analytics`  | GET    | Admin      | `?months=3\|6\|12`. Returns monthlyData, b2bTotal, b2cTotal, statusData, topProductsData, summary KPIs.                           |
| `/api/admin/export`     | GET    | Admin      | `?type=orders\|inquiries\|products &format=csv\|xlsx &from=YYYY-MM-DD &to=YYYY-MM-DD`. Pure OOXML/CSV, no library.                |
| `/api/admin/content`    | GET    | Admin      | All SiteContent records.                                                                                                          |
| `/api/admin/content`    | PUT    | Admin      | Upsert multiple key-value pairs at once. Body: `{key: value, ...}`.                                                               |
| `/api/admin/stats`      | GET    | Admin      | Dashboard counts: orders, inquiries, products, admins.                                                                            |
| `/api/admin/users`      | GET    | SuperAdmin | All admins ordered by (isSuperAdmin desc, isActive desc, createdAt asc).                                                          |
| `/api/admin/users/[id]` | PATCH  | SuperAdmin | Body: `{action}`. Actions: `approve\|deactivate\|promote\|demote`. Each sends email to affected admin. Cannot action own account. |
| `/api/admin/users/[id]` | DELETE | SuperAdmin | Permanent delete. Cannot delete self.                                                                                             |

---

## Inventory `/api/admin/inventory/`

| Route                                   | Method | Auth  | Description                                                                                                                                                                                |
| --------------------------------------- | ------ | ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `/api/admin/inventory`                  | GET    | Admin | All items (`isDeleted=false` by default; `?deleted=true` includes soft-deleted). Also returns `summary` object: `{total, totalValue, lowStock, outOfStock, byCategory}`.                   |
| `/api/admin/inventory`                  | POST   | Admin | Create InventoryItem. Auto-computes `status` and `totalValue`. Logs initial STOCK_IN transaction if opening qty > 0.                                                                       |
| `/api/admin/inventory/[id]`             | GET    | Admin | Item + last 50 transactions with `createdBy` name.                                                                                                                                         |
| `/api/admin/inventory/[id]`             | PATCH  | Admin | Update any field. If `quantity` changes → auto-logs ADJUSTMENT transaction. Recomputes status + totalValue.                                                                                |
| `/api/admin/inventory/[id]`             | DELETE | Admin | **Soft delete only.** Body: `{reason}`. Sets `isDeleted=true`, `deletedAt`, `deletedById`, `deletionReason`. Logs final STOCK_OUT transaction. Never hard-deletes.                         |
| `/api/admin/inventory/[id]/transaction` | POST   | Admin | Record stock movement. Body: `{type, quantity, unitCost?, reason?, reference?}`. Guards: qty must be positive; OUT types cannot go below 0. Updates item qty/totalValue/status atomically. |
