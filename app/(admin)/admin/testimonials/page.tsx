import { prisma } from '@/lib/prisma'
import TestimonialsManager from '@/components/admin/TestimonialsManager'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Testimonials | Admin' }

export default async function AdminTestimonialsPage() {
  const items = await prisma.testimonial.findMany({
    orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
  })
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-display font-semibold text-charcoal-800">Testimonials</h1>
        <p className="text-stone-400 text-sm mt-1">
          Manage customer reviews shown on the homepage. {items.filter(i => i.featured).length} currently visible.
        </p>
      </div>
      <TestimonialsManager initialItems={JSON.parse(JSON.stringify(items))} />
    </div>
  )
}
