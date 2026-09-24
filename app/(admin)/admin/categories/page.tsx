import { prisma } from '@/lib/prisma'
import CategoryManager from '@/components/admin/CategoryManager'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Categories | Admin' }

export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: { name: 'asc' },
  })
  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-display font-semibold text-charcoal-800">Categories</h1>
        <p className="text-stone-400 text-sm mt-1">{categories.length} categories</p>
      </div>
      <CategoryManager initialCategories={JSON.parse(JSON.stringify(categories))} />
    </div>
  )
}
