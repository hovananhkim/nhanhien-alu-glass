# NhanHien — Session Starter

> Paste this at the top of every new chat. Fill in the task section. Nothing else needed to start.

**Stack:** Next.js 14 · Prisma 5 · SQLite · Tailwind 3 · JWT auth · TypeScript · No UI lib  
**Pinned versions:** next@14.2.35 · react@18.3.1 · prisma@5.22.0 · tailwindcss@3.4.4  
**Admin URL:** /admin (JWT cookie `admin_token`) · Default: admin@craftura.com / admin123  
**Context files:** .ai/schema.md · .ai/api_routes.md · .ai/pages.md · .ai/patterns.md · .ai/architecture.md

---

## Today's task

[describe what you want to build in 1–3 sentences]

## Files likely needed

[list 1–3 specific file paths if you know them — skip if unsure]

---

## Standing rules (always apply)

- Read ONLY files needed for this specific task
- Code first, brief explanation after
- Skip git commit message unless I ask
- Skip .ai/ file updates unless I ask
- Skip packaging/zip unless I ask
- If a pattern is unclear, check .ai/patterns.md before asking me

---

## Quick reference (so you don't need to open other files for simple tasks)

**Auth pattern:** `getAdminSession()` in lib/auth.ts → returns session or null. All admin API routes call this first.  
**⚠️ middleware.ts:** ZERO imports from lib/ or next/headers — Edge Runtime crashes. Cookie check only.  
**Admin layout:** Reads `x-pathname` header → skips auth for /admin/login and /admin/register paths.  
**Server+Client pattern:** `app/(store)/X/page.tsx` (server, metadata) → `components/store/XClient.tsx` ('use client')  
**Email:** Always fire-and-forget → `sendEmail(...).catch(err => console.error(err))`  
**Image upload:** POST /api/upload → saves to public/uploads/ → returns `{ urls: string[] }`
