'use client'
import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import WhatsAppButton from '@/components/ui/WhatsAppButton'
import { whatsappProductLink } from '@/lib/whatsapp'
import AddToCartButton from '@/components/ui/AddToCartButton'

interface Product {
  id: string; name: string; slug: string; description: string
  dimensions?: string; material?: string; price?: number; moq?: number
  images: { id: string; url: string; altText?: string; isPrimary: boolean }[]
  category: { name: string; slug: string }
}
interface Related {
  id: string; name: string; slug: string
  images: { url: string }[]
}

export default function ProductDetailClient({ product, related }: { product: Product; related: Related[] }) {
  const [activeImg, setActiveImg] = useState(0)
  const [quantity, setQuantity]   = useState(1)
  const [orderType, setOrderType] = useState<'B2C'|'B2B'>('B2C')
  const [form, setForm]           = useState({ name:'', email:'', phone:'', address:'', notes:'' })
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted]   = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form, orderType,
          items: [{ productId: product.id, quantity, notes: form.notes }],
        }),
      })
      if (res.ok) setSubmitted(true)
    } catch (err) { console.error(err) }
    setSubmitting(false)
  }

  if (submitted) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-base)' }}>
        <div className="text-center max-w-md mx-auto px-4 py-20">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg width="36" height="36" fill="none" viewBox="0 0 36 36">
              <path d="M7 18l7 7 15-15" stroke="#16a34a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h2 className="font-display text-3xl mb-3" style={{ color: 'var(--text-primary)' }}>Order Received!</h2>
          <p className="text-lg mb-2" style={{ color: 'var(--text-secondary)' }}>Thank you for your inquiry.</p>
          <p className="mb-8" style={{ color: 'var(--text-muted)' }}>Our team will contact you shortly to confirm your order.</p>
          <Link href="/products" className="btn-primary">Continue Shopping</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="pt-20 min-h-screen" style={{ background: 'var(--bg-base)' }}>

      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
        <nav className="flex gap-2 text-sm" style={{ color: 'var(--text-faint)' }}>
          {[
            { href:'/', label:'Home' },
            { href:'/products', label:'Products' },
            { href:`/products?category=${product.category.slug}`, label:product.category.name },
          ].map(b => (
            <span key={b.href} className="flex items-center gap-2">
              <Link href={b.href} className="hover:underline transition-colors"
                style={{ color: 'var(--text-muted)' }}>{b.label}</Link>
              <span style={{ color: 'var(--border-base)' }}>/</span>
            </span>
          ))}
          <span style={{ color: 'var(--text-primary)' }}>{product.name}</span>
        </nav>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid lg:grid-cols-2 gap-12 xl:gap-16">

          {/* Gallery */}
          <div>
            <div className="relative aspect-square rounded-2xl overflow-hidden border"
              style={{ borderColor: 'var(--border-base)' }}>
              <Image
                src={product.images[activeImg]?.url || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800'}
                alt={product.images[activeImg]?.altText || product.name}
                fill className="object-cover"
              />
            </div>
            {product.images.length > 1 && (
              <div className="flex gap-3 mt-4 overflow-x-auto pb-1">
                {product.images.map((img, i) => (
                  <button key={img.id} onClick={() => setActiveImg(i)}
                    className="relative w-20 h-20 rounded-lg overflow-hidden shrink-0 border-2 transition-all"
                    style={{ borderColor: i === activeImg ? 'var(--accent)' : 'var(--border-base)' }}>
                    <Image src={img.url} alt={img.altText || product.name} fill className="object-cover"/>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info + Form */}
          <div>
            <Link href={`/products?category=${product.category.slug}`}
              className="inline-block text-xs px-3 py-1.5 rounded-full font-medium mb-4 border"
              style={{ color: 'var(--accent-text)', background: 'var(--accent-soft)', borderColor: 'var(--border-base)' }}>
              {product.category.name}
            </Link>
            <h1 className="font-display text-3xl sm:text-4xl mb-2" style={{ color: 'var(--text-primary)' }}>
              {product.name}
            </h1>
            {product.price && (
              <p className="font-display text-2xl mb-5" style={{ color: 'var(--accent-text)' }}>
                ₹{product.price.toLocaleString('en-IN')}
              </p>
            )}
            <p className="leading-relaxed mb-7" style={{ color: 'var(--text-secondary)' }}>
              {product.description}
            </p>

            {/* Specs */}
            <div className="rounded-xl border p-5 mb-7"
              style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-base)' }}>
              <h3 className="font-semibold text-sm uppercase tracking-wider mb-4" style={{ color: 'var(--text-muted)' }}>
                Specifications
              </h3>
              <div className="space-y-3">
                {[
                  product.dimensions && { label: 'Dimensions', value: product.dimensions },
                  product.material   && { label: 'Material',   value: product.material },
                  product.moq        && { label: 'Min. Order Qty (B2B)', value: `${product.moq} units` },
                ].filter(Boolean).map((spec: any) => (
                  <div key={spec.label} className="flex justify-between text-sm pb-3 last:pb-0"
                    style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <span style={{ color: 'var(--text-muted)' }}>{spec.label}</span>
                    <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{spec.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Add to inquiry list */}
            <AddToCartButton
              product={{
                productId: product.id,
                productName: product.name,
                productSlug: product.slug,
                imageUrl: product.images[0]?.url || '',
                material: product.material,
                price: product.price,
              }}
              variant="outline"
              className="w-full mb-6"
            />

            {/* Order type toggle */}
            <div className="flex rounded-lg border p-1 mb-6"
              style={{ background: 'var(--bg-subtle)', borderColor: 'var(--border-base)' }}>
              {(['B2C','B2B'] as const).map(type => (
                <button key={type} onClick={() => setOrderType(type)}
                  className="flex-1 py-2.5 text-sm font-medium rounded-md transition-all"
                  style={orderType === type
                    ? { background: 'var(--bg-surface)', color: 'var(--text-primary)', boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }
                    : { color: 'var(--text-muted)' }
                  }>
                  {type === 'B2C' ? '🏠 Individual Order' : '🏢 Bulk / Business Order'}
                </button>
              ))}
            </div>

            {/* Inquiry Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                    Full Name *
                  </label>
                  <input type="text" required className="form-input" placeholder="Raj Patel"
                    value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}/>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                    Phone *
                  </label>
                  <input type="tel" required className="form-input" placeholder="+91 98765 43210"
                    value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}/>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                  Email *
                </label>
                <input type="email" required className="form-input" placeholder="you@example.com"
                  value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}/>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                  Delivery Address *
                </label>
                <input type="text" required className="form-input" placeholder="Your full address"
                  value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))}/>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                  Quantity {orderType === 'B2B' && product.moq ? `(Min. ${product.moq})` : ''}
                </label>
                <input type="number"
                  min={orderType === 'B2B' && product.moq ? product.moq : 1}
                  className="form-input" value={quantity}
                  onChange={e => setQuantity(parseInt(e.target.value) || 1)}/>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                  Custom Requirements / Notes
                </label>
                <textarea rows={3} className="form-input resize-none"
                  placeholder="Special dimensions, finish, color..."
                  value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}/>
              </div>

              <button type="submit" disabled={submitting} className="btn-wood w-full text-base">
                {submitting
                  ? <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"/>
                      Placing Inquiry...
                    </span>
                  : 'Place Inquiry'
                }
              </button>

              {/* Divider */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px" style={{ background: 'var(--border-base)' }}/>
                <span className="text-xs" style={{ color: 'var(--text-faint)' }}>or</span>
                <div className="flex-1 h-px" style={{ background: 'var(--border-base)' }}/>
              </div>

              {/* WhatsApp CTA */}
              <WhatsAppButton
                href={whatsappProductLink({
                  productName: product.name,
                  material: product.material,
                  price: product.price,
                  quantity,
                  orderType,
                })}
                label="Enquire on WhatsApp"
                size="lg"
                variant="solid"
                className="w-full justify-center"
              />

              <p className="text-center text-xs" style={{ color: 'var(--text-faint)' }}>
                No payment required · Our team will contact you to confirm
              </p>
            </form>
          </div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div className="mt-20">
            <div className="section-divider"/>
            <h2 className="font-display text-3xl text-center mb-10" style={{ color: 'var(--text-primary)' }}>
              You Might Also Like
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              {related.map(p => (
                <Link key={p.id} href={`/products/${p.slug}`}
                  className="group card-hover rounded-xl overflow-hidden border"
                  style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-base)' }}>
                  <div className="relative aspect-square img-zoom">
                    <Image
                      src={p.images[0]?.url || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400'}
                      alt={p.name} fill className="object-cover"
                    />
                  </div>
                  <div className="p-3">
                    <h3 className="font-display text-sm" style={{ color: 'var(--text-primary)' }}>{p.name}</h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
