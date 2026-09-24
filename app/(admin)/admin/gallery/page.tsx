import { prisma } from '@/lib/prisma'
import AdminGalleryClient from '../../../../components/admin/AdminGalleryClient'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Gallery | Admin' }

export default async function AdminGalleryPage() {
  const items = await prisma.galleryItem.findMany({
    orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
  })
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-display font-semibold text-charcoal-800">Gallery</h1>
        <p className="text-stone-400 text-sm mt-1">
          Showcase your previous projects. {items.length} item{items.length !== 1 ? 's' : ''} published.
        </p>
      </div>
      <AdminGalleryClient initialItems={JSON.parse(JSON.stringify(items))} />
    </div>
  )
}