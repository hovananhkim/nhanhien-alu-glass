import Link from 'next/link'
import Image from 'next/image'
import { prisma } from '@/lib/prisma'
import type { Metadata } from 'next'
import ProductCard from '@/components/store/ProductCard'

export const metadata: Metadata = {
  title: 'Products',
  description: 'Browse our full collection of handcrafted furniture — sofas, beds, dining tables, office furniture and more. Available for individual and bulk orders.',
}

async function getProducts(categorySlug?: string, search?: string) {
  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      where: {
        ...(categorySlug ? { category: { slug: categorySlug } } : {}),
        ...(search ? {
          OR: [
            { name: { contains: search } },
            { description: { contains: search } },
            { material: { contains: search } },
          ],
        } : {}),
      },
      include: { images: { where: { isPrimary: true } }, category: true },
      orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
    }),
    prisma.category.findMany({ orderBy: { name: 'asc' } }),
  ])
  return { products, categories }
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: { category?: string; search?: string }
}) {
  const { products, categories } = await getProducts(searchParams.category, searchParams.search)
  const activeCategory = categories.find(c => c.slug === searchParams.category)

  return (
    <div className="pt-20 min-h-screen" style={{ background: 'var(--bg-base)' }}>

      {/* Header */}
      <div className="py-16 sm:py-20" style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs tracking-[0.3em] uppercase font-medium mb-3" style={{ color: 'var(--accent-text)' }}>
            Our Collection
          </p>
          <h1 className="font-display text-4xl sm:text-5xl" style={{ color: 'var(--text-primary)' }}>
            {activeCategory ? activeCategory.name : 'All Products'}
          </h1>
          {activeCategory?.description && (
            <p className="text-lg mt-3" style={{ color: 'var(--text-muted)' }}>{activeCategory.description}</p>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-10">
          <form className="flex-1 max-w-sm">
            <div className="relative">
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4"
                style={{ color: 'var(--text-faint)' }}
                fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
              <input type="search" name="search"
                placeholder="Search products..."
                defaultValue={searchParams.search}
                className="form-input pl-10 h-11 text-sm"/>
            </div>
          </form>

          <div className="flex flex-wrap gap-2">
            <Link href="/products"
              className="px-4 py-2 rounded-full text-sm font-medium transition-all border"
              style={!searchParams.category
                ? { background: 'var(--text-primary)', color: 'var(--bg-base)', borderColor: 'var(--text-primary)' }
                : { background: 'var(--bg-surface)', color: 'var(--text-secondary)', borderColor: 'var(--border-base)' }
              }>All</Link>
            {categories.map(cat => (
              <Link key={cat.id} href={`/products?category=${cat.slug}`}
                className="px-4 py-2 rounded-full text-sm font-medium transition-all border"
                style={searchParams.category === cat.slug
                  ? { background: 'var(--accent)', color: '#fff', borderColor: 'var(--accent)' }
                  : { background: 'var(--bg-surface)', color: 'var(--text-secondary)', borderColor: 'var(--border-base)' }
                }>{cat.name}</Link>
            ))}
          </div>
        </div>

        {/* Count */}
        <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
          {products.length} product{products.length !== 1 ? 's' : ''} found
          {searchParams.search ? ` for "${searchParams.search}"` : ''}
        </p>

        {/* Empty */}
        {products.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-5xl mb-4">🪑</div>
            <h3 className="font-display text-2xl mb-2" style={{ color: 'var(--text-primary)' }}>
              No products found
            </h3>
            <p className="mb-6" style={{ color: 'var(--text-muted)' }}>
              Try a different search or browse all categories
            </p>
            <Link href="/products" className="btn-primary">View All Products</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map(product => (
              <ProductCard key={product.id} product={{
                id: product.id,
                name: product.name,
                slug: product.slug,
                description: product.description,
                material: product.material,
                price: product.price,
                moq: product.moq,
                featured: product.featured,
                imageUrl: product.images[0]?.url || '',
              }} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
