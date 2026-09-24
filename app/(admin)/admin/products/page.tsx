import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import Image from 'next/image'
import DeleteProductButton from '@/components/admin/DeleteProductButton'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Products | Admin' }

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    include: {
      images: { where: { isPrimary: true } },
      category: true,
      _count: { select: { orderItems: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-display font-semibold text-charcoal-800">Products</h1>
          <p className="text-stone-400 text-sm mt-1">{products.length} products in catalogue</p>
        </div>
        <Link href="/admin/products/new" className="inline-flex items-center gap-2 px-5 py-2.5 bg-charcoal-800 hover:bg-charcoal-900 text-white text-sm font-medium rounded-xl transition-colors">
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>
          Add Product
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-stone-100">
              <th className="text-left px-6 py-4 text-xs font-semibold text-stone-400 uppercase tracking-wider">Product</th>
              <th className="text-left px-4 py-4 text-xs font-semibold text-stone-400 uppercase tracking-wider hidden md:table-cell">Category</th>
              <th className="text-left px-4 py-4 text-xs font-semibold text-stone-400 uppercase tracking-wider hidden lg:table-cell">Price</th>
              <th className="text-left px-4 py-4 text-xs font-semibold text-stone-400 uppercase tracking-wider hidden lg:table-cell">MOQ</th>
              <th className="text-left px-4 py-4 text-xs font-semibold text-stone-400 uppercase tracking-wider hidden sm:table-cell">Orders</th>
              <th className="text-left px-4 py-4 text-xs font-semibold text-stone-400 uppercase tracking-wider">Status</th>
              <th className="px-4 py-4 text-xs font-semibold text-stone-400 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-50">
            {products.map(product => (
              <tr key={product.id} className="hover:bg-stone-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-stone-100 shrink-0">
                      {product.images[0] ? (
                        <Image src={product.images[0].url} alt={product.name} fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-stone-300 text-xl">🪑</div>
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-sm text-charcoal-800">{product.name}</div>
                      {product.material && <div className="text-xs text-stone-400 mt-0.5">{product.material}</div>}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 hidden md:table-cell">
                  <span className="text-xs bg-stone-100 text-stone-600 px-2.5 py-1 rounded-full font-medium">{product.category.name}</span>
                </td>
                <td className="px-4 py-4 text-sm text-charcoal-700 hidden lg:table-cell">
                  {product.price ? `₹${product.price.toLocaleString('en-IN')}` : <span className="text-stone-300">–</span>}
                </td>
                <td className="px-4 py-4 text-sm text-charcoal-700 hidden lg:table-cell">
                  {product.moq || <span className="text-stone-300">–</span>}
                </td>
                <td className="px-4 py-4 text-sm text-charcoal-700 hidden sm:table-cell">
                  {product._count.orderItems}
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-2">
                    {product.featured && (
                      <span className="text-xs bg-wood-100 text-wood-700 px-2 py-0.5 rounded-full font-medium">Featured</span>
                    )}
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${product.inStock ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                      {product.inStock ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link href={`/products/${product.slug}`} target="_blank"
                      className="p-1.5 text-stone-400 hover:text-charcoal-700 transition-colors rounded-md hover:bg-stone-100">
                      <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                    </Link>
                    <Link href={`/admin/products/${product.id}/edit`}
                      className="p-1.5 text-stone-400 hover:text-blue-600 transition-colors rounded-md hover:bg-blue-50">
                      <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                    </Link>
                    <DeleteProductButton id={product.id} name={product.name} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {products.length === 0 && (
          <div className="py-20 text-center text-stone-400">
            <div className="text-5xl mb-3">🪑</div>
            <p className="font-medium text-charcoal-600">No products yet</p>
            <Link href="/admin/products/new" className="inline-block mt-4 text-wood-600 text-sm hover:underline">Add your first product →</Link>
          </div>
        )}
      </div>
    </div>
  )
}
