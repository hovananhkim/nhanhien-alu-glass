'use client'
import Link from 'next/link'
import Image from 'next/image'
import AddToCartButton from '@/components/ui/AddToCartButton'

interface Props {
  product: {
    id: string
    name: string
    slug: string
    description: string
    material?: string | null
    price?: number | null
    moq?: number | null
    featured: boolean
    imageUrl: string
  }
}

export default function ProductCard({ product }: Props) {
  const fallback = 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600'

  return (
    <div
      className="group rounded-2xl overflow-hidden card-hover border flex flex-col"
      style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-base)' }}
    >
      {/* Image — clickable */}
      <Link href={`/products/${product.slug}`} className="relative aspect-[4/3] img-zoom block">
        <Image
          src={product.imageUrl || fallback}
          alt={product.name}
          fill
          className="object-cover"
        />
        {product.featured && (
          <span className="absolute top-3 right-3 text-white text-xs font-medium px-2.5 py-1 rounded-full"
            style={{ background: 'var(--accent)' }}>
            Featured
          </span>
        )}
        {/* Quick add button — visible on hover */}
        <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <AddToCartButton
            product={{
              productId: product.id,
              productName: product.name,
              productSlug: product.slug,
              imageUrl: product.imageUrl || fallback,
              material: product.material ?? undefined,
              price: product.price ?? undefined,
            }}
            variant="icon"
          />
        </div>
      </Link>

      {/* Info */}
      <div className="p-4 flex flex-col flex-1">
        <Link href={`/products/${product.slug}`}>
          <h3 className="font-display text-lg leading-tight mb-1 transition-opacity group-hover:opacity-75"
            style={{ color: 'var(--text-primary)' }}>
            {product.name}
          </h3>
        </Link>
        {product.material && (
          <p className="text-xs tracking-wider uppercase mb-2" style={{ color: 'var(--text-faint)' }}>
            {product.material}
          </p>
        )}
        <p className="text-sm line-clamp-2 mb-3 flex-1" style={{ color: 'var(--text-muted)' }}>
          {product.description}
        </p>

        <div className="flex items-center justify-between pt-3 mb-3"
          style={{ borderTop: '1px solid var(--border-subtle)' }}>
          {product.price
            ? <span className="font-display text-base" style={{ color: 'var(--accent-text)' }}>
                ₹{product.price.toLocaleString('en-IN')}
              </span>
            : <span className="text-xs" style={{ color: 'var(--text-faint)' }}>Price on request</span>
          }
          {product.moq && (
            <span className="text-xs" style={{ color: 'var(--text-faint)' }}>MOQ: {product.moq}</span>
          )}
        </div>

        {/* Add to inquiry list */}
        <AddToCartButton
          product={{
            productId: product.id,
            productName: product.name,
            productSlug: product.slug,
            imageUrl: product.imageUrl || fallback,
            material: product.material ?? undefined,
            price: product.price ?? undefined,
          }}
          variant="full"
        />
      </div>
    </div>
  )
}
