import { prisma } from '@/lib/prisma'
import ProductForm from '@/components/admin/ProductForm'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const [product, categories] = await Promise.all([
    prisma.product.findUnique({
      where: { id: params.id },
      include: { images: { orderBy: { order: 'asc' } } },
    }),
    prisma.category.findMany({ orderBy: { name: 'asc' } }),
  ])

  if (!product) notFound()

  return (
    <div className="p-8 max-w-3xl">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/admin/products" className="text-stone-400 hover:text-charcoal-700 transition-colors">
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg>
        </Link>
        <div>
          <h1 className="text-2xl font-display font-semibold text-charcoal-800">Edit Product</h1>
          <p className="text-stone-400 text-sm mt-0.5">{product.name}</p>
        </div>
      </div>
      <ProductForm
        categories={categories}
        mode="edit"
        initialData={{
          id: product.id,
          name: product.name,
          description: product.description,
          categoryId: product.categoryId,
          dimensions: product.dimensions || '',
          material: product.material || '',
          price: product.price?.toString() || '',
          moq: product.moq?.toString() || '',
          featured: product.featured,
          inStock: product.inStock,
          images: product.images.map(img => ({ url: img.url, altText: img.altText || '' })),
        }}
      />
    </div>
  )
}
