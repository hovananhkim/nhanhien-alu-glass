import { prisma } from '@/lib/prisma'
import ContentEditor from '@/components/admin/ContentEditor'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Site Content | Admin' }

// All keys the editor knows about — including nav visibility keys
const ALL_KEYS = [
  'hero_title', 'hero_subtitle',
  'about_title', 'about_text',
  'phone', 'email', 'address', 'whatsapp',
  'nav_show_gallery', 'nav_show_bulk_orders',
  'nav_show_blog', 'nav_show_about', 'nav_show_contact',
]

// Defaults for keys that may not exist in DB yet
const DEFAULTS: Record<string, string> = {
  nav_show_gallery:     'true',
  nav_show_bulk_orders: 'true',
  nav_show_blog:        'true',
  nav_show_about:       'true',
  nav_show_contact:     'true',
}

export default async function AdminContentPage() {
  const records = await prisma.siteContent.findMany({
    where: { key: { in: ALL_KEYS } },
  })

  // Merge DB values with defaults — so toggles show correct state even if not seeded
  const contentMap: Record<string, string> = { ...DEFAULTS }
  for (const record of records) {
    contentMap[record.key] = record.value
  }

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-display font-semibold text-charcoal-800">Site Content</h1>
        <p className="text-stone-400 text-sm mt-1">
          Control navigation visibility and edit homepage content
        </p>
      </div>
      <ContentEditor initialContent={contentMap} />
    </div>
  )
}
