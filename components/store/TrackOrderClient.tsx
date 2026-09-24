'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'

// ── Types ────────────────────────────────────────────────────
type OrderStatus = 'PENDING' | 'CONFIRMED' | 'IN_PRODUCTION' | 'DELIVERED' | 'CANCELLED'

interface OrderItem {
  id: string
  quantity: number
  notes?: string
  productName: string
  productSlug: string
  imageUrl: string
}

interface TrackedOrder {
  id: string
  orderNumber: string
  customerName: string
  email: string
  phone: string
  address: string
  notes?: string
  orderType: string
  status: OrderStatus
  createdAt: string
  updatedAt: string
  items: OrderItem[]
}

// ── Status config ────────────────────────────────────────────
const STATUS_STEPS: {
  key: OrderStatus
  label: string
  description: string
  icon: React.ReactNode
}[] = [
  {
    key: 'PENDING',
    label: 'Order Received',
    description: 'We have received your inquiry and will contact you shortly.',
    icon: (
      <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2
             M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
      </svg>
    ),
  },
  {
    key: 'CONFIRMED',
    label: 'Confirmed',
    description: 'Your order has been confirmed. Materials are being sourced.',
    icon: (
      <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
      </svg>
    ),
  },
  {
    key: 'IN_PRODUCTION',
    label: 'In Production',
    description: 'Our craftsmen are building your furniture.',
    icon: (
      <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
      </svg>
    ),
  },
  {
    key: 'DELIVERED',
    label: 'Delivered',
    description: 'Your order has been delivered. Enjoy your furniture!',
    icon: (
      <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
      </svg>
    ),
  },
]

// ── Helpers ──────────────────────────────────────────────────
function getStepIndex(status: OrderStatus): number {
  if (status === 'CANCELLED') return -1
  return STATUS_STEPS.findIndex(s => s.key === status)
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

// ── Main component ───────────────────────────────────────────
export default function TrackOrderClient({ initialQuery }: { initialQuery: string }) {
  const [query, setQuery]         = useState(initialQuery)
  const [loading, setLoading]     = useState(false)
  const [orders, setOrders]       = useState<TrackedOrder[]>([])
  const [error, setError]         = useState('')
  const [searched, setSearched]   = useState(false)

  // Auto-search if query pre-filled from URL
  useEffect(() => {
    if (initialQuery) handleSearch(undefined, initialQuery)
  }, [])

  const handleSearch = async (e?: React.FormEvent, overrideQ?: string) => {
    e?.preventDefault()
    const q = (overrideQ ?? query).trim()
    if (!q) return
    setLoading(true)
    setError('')
    setOrders([])
    setSearched(true)
    try {
      const res  = await fetch(`/api/track-order?q=${encodeURIComponent(q)}`)
      const data = await res.json()
      if (!res.ok) setError(data.error)
      else setOrders(data.orders)
    } catch { setError('Connection error. Please try again.') }
    setLoading(false)
  }

  return (
    <div className="pt-20 min-h-screen" style={{ background: 'var(--bg-base)' }}>

      {/* Header */}
      <div className="py-14 border-b" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-xs tracking-[0.3em] uppercase font-medium mb-3" style={{ color: 'var(--accent-text)' }}>
            Order Status
          </p>
          <h1 className="font-display text-4xl sm:text-5xl mb-4" style={{ color: 'var(--text-primary)' }}>
            Track Your Order
          </h1>
          <p className="text-base" style={{ color: 'var(--text-muted)' }}>
            Enter your order reference number (e.g. CRF-ABC123) or the email address you placed the order with.
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">

        {/* Search form */}
        <form onSubmit={handleSearch}
          className="flex gap-3 mb-10 p-1.5 rounded-2xl border shadow-sm"
          style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-base)' }}>
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Order number or email address…"
            className="flex-1 px-4 py-3 text-sm rounded-xl outline-none border-0 bg-transparent"
            style={{ color: 'var(--text-primary)' }}
          />
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="px-6 py-3 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-50 flex items-center gap-2 shrink-0"
            style={{ background: 'var(--accent)' }}
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
            ) : (
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
            )}
            {loading ? 'Searching…' : 'Track'}
          </button>
        </form>

        {/* Error */}
        {error && (
          <div className="rounded-2xl p-5 mb-8 flex items-start gap-3"
            style={{ background: '#fef2f2', border: '1px solid #fecaca' }}>
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#dc2626" className="shrink-0 mt-0.5">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <div>
              <p className="text-sm font-medium text-red-700">{error}</p>
              <p className="text-xs text-red-500 mt-1">
                Need help? <Link href="/contact" className="underline">Contact us</Link>
              </p>
            </div>
          </div>
        )}

        {/* Empty state after search */}
        {searched && !loading && !error && orders.length === 0 && (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">📦</div>
            <p className="font-display text-xl" style={{ color: 'var(--text-primary)' }}>No orders found</p>
          </div>
        )}

        {/* Orders list */}
        <div className="space-y-6">
          {orders.map(order => (
            <OrderCard key={order.id} order={order} onCancelled={(id) => {
              setOrders(prev => prev.map(o =>
                o.id === id ? { ...o, status: 'CANCELLED' } : o
              ))
            }} />
          ))}
        </div>

        {/* No search yet — show helper tips */}
        {!searched && (
          <div className="grid sm:grid-cols-3 gap-4 mt-4">
            {[
              { icon: '🔢', title: 'Use Order Number', body: 'Your order reference starts with CRF- and was emailed to you after placing.' },
              { icon: '📧', title: 'Use Email Address', body: 'Enter the email you used when placing your order to see all your orders.' },
              { icon: '📞', title: 'Need Help?', body: 'Can\'t find your order? Call us on +91 98765 43210 or WhatsApp us.' },
            ].map(tip => (
              <div key={tip.title} className="rounded-2xl p-5 border"
                style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-base)' }}>
                <div className="text-2xl mb-3">{tip.icon}</div>
                <h3 className="font-semibold text-sm mb-1.5" style={{ color: 'var(--text-primary)' }}>{tip.title}</h3>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>{tip.body}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Order card with status tracker ──────────────────────────
function OrderCard({
  order,
  onCancelled,
}: {
  order: TrackedOrder
  onCancelled: (id: string) => void
}) {
  const [showCancel, setShowCancel]       = useState(false)
  const [cancelEmail, setCancelEmail]     = useState('')
  const [cancelling, setCancelling]       = useState(false)
  const [cancelError, setCancelError]     = useState('')
  const isCancelled = order.status === 'CANCELLED'
  const canCancel   = order.status === 'PENDING'
  const stepIndex   = getStepIndex(order.status)

  const handleCancel = async () => {
    if (!cancelEmail.trim()) { setCancelError('Please enter your email to confirm.'); return }
    setCancelling(true)
    setCancelError('')
    try {
      const res  = await fetch('/api/track-order/cancel', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ orderNumber: order.orderNumber, email: cancelEmail.trim() }),
      })
      const data = await res.json()
      if (!res.ok) { setCancelError(data.error); return }
      setShowCancel(false)
      onCancelled(order.id)
    } catch { setCancelError('Something went wrong. Please try again.') }
    setCancelling(false)
  }

  return (
    <div className="rounded-2xl border overflow-hidden"
      style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-base)' }}>

      {/* Card header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 py-5 border-b"
        style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-subtle)' }}>
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="font-display font-semibold text-lg" style={{ color: 'var(--text-primary)' }}>
              {order.orderNumber}
            </span>
            <StatusBadge status={order.status} />
            <span className="text-xs px-2.5 py-1 rounded-full font-medium"
              style={{ background: 'var(--bg-muted)', color: 'var(--text-muted)' }}>
              {order.orderType === 'B2B' ? 'Bulk Order' : 'Individual'}
            </span>
          </div>
          <p className="text-xs mt-1" style={{ color: 'var(--text-faint)' }}>
            Placed {formatDate(order.createdAt)}
            {order.updatedAt !== order.createdAt && ` · Updated ${formatDate(order.updatedAt)}`}
          </p>
        </div>

        {/* Cancel button — only for PENDING */}
        {canCancel && !showCancel && (
          <button
            onClick={() => setShowCancel(true)}
            className="text-xs font-medium px-4 py-2 rounded-lg border transition-all shrink-0"
            style={{ color: '#dc2626', borderColor: '#fecaca', background: '#fef2f2' }}
          >
            Cancel Order
          </button>
        )}
      </div>

      {/* ── Cancel confirmation panel ── */}
      {showCancel && (
        <div className="px-6 py-5 border-b"
          style={{ background: '#fffbeb', borderColor: '#fde68a' }}>
          <div className="flex items-start gap-3 mb-4">
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#d97706" className="shrink-0 mt-0.5">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
            </svg>
            <div>
              <p className="text-sm font-semibold text-amber-800">Are you sure you want to cancel?</p>
              <p className="text-xs text-amber-700 mt-0.5">
                This cannot be undone. Enter your email address to confirm cancellation.
              </p>
            </div>
          </div>
          <div className="flex gap-3 flex-col sm:flex-row">
            <input
              type="email"
              placeholder="Confirm your email address"
              value={cancelEmail}
              onChange={e => { setCancelEmail(e.target.value); setCancelError('') }}
              className="form-input flex-1 text-sm py-2"
            />
            <div className="flex gap-2 shrink-0">
              <button
                onClick={handleCancel}
                disabled={cancelling}
                className="px-5 py-2 text-sm font-semibold text-white rounded-lg transition-all disabled:opacity-60"
                style={{ background: '#dc2626' }}
              >
                {cancelling ? 'Cancelling…' : 'Confirm Cancel'}
              </button>
              <button
                onClick={() => { setShowCancel(false); setCancelError(''); setCancelEmail('') }}
                className="px-4 py-2 text-sm font-medium rounded-lg border transition-all"
                style={{ borderColor: 'var(--border-base)', color: 'var(--text-muted)', background: 'var(--bg-surface)' }}
              >
                Keep Order
              </button>
            </div>
          </div>
          {cancelError && (
            <p className="text-xs text-red-600 mt-2">{cancelError}</p>
          )}
        </div>
      )}

      {/* ── Animated status tracker ── */}
      {!isCancelled ? (
        <div className="px-6 py-8">
          {/* Progress bar */}
          <div className="relative mb-8">
            {/* Track line */}
            <div className="absolute top-5 left-5 right-5 h-0.5"
              style={{ background: 'var(--border-base)' }}/>
            {/* Filled portion */}
            <div
              className="absolute top-5 left-5 h-0.5 transition-all duration-700 ease-out"
              style={{
                background: 'var(--accent)',
                width: stepIndex <= 0
                  ? '0%'
                  : `${(stepIndex / (STATUS_STEPS.length - 1)) * 100}%`,
              }}
            />

            {/* Steps */}
            <div className="relative flex justify-between">
              {STATUS_STEPS.map((step, i) => {
                const done    = i < stepIndex
                const current = i === stepIndex
                const future  = i > stepIndex
                return (
                  <div key={step.key} className="flex flex-col items-center" style={{ width: '25%' }}>
                    {/* Circle */}
                    <div
                      className="relative w-10 h-10 rounded-full flex items-center justify-center z-10 transition-all duration-500"
                      style={{
                        background: done || current ? 'var(--accent)' : 'var(--bg-surface)',
                        border:     future ? '2px solid var(--border-base)' : '2px solid var(--accent)',
                        color:      done || current ? 'white' : 'var(--text-faint)',
                        boxShadow:  current ? '0 0 0 4px var(--accent-soft)' : 'none',
                      }}
                    >
                      {done ? (
                        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/>
                        </svg>
                      ) : (
                        step.icon
                      )}
                      {/* Pulse for current step */}
                      {current && (
                        <span className="absolute inset-0 rounded-full animate-ping opacity-20"
                          style={{ background: 'var(--accent)' }}/>
                      )}
                    </div>
                    {/* Label */}
                    <p className="text-center mt-3 text-xs font-semibold leading-tight"
                      style={{ color: done || current ? 'var(--text-primary)' : 'var(--text-faint)' }}>
                      {step.label}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Current status description */}
          <div className="rounded-xl px-5 py-4 text-center"
            style={{ background: 'var(--accent-soft)', border: '1px solid var(--border-base)' }}>
            <p className="text-sm font-semibold" style={{ color: 'var(--accent-text)' }}>
              {STATUS_STEPS[stepIndex]?.label}
            </p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              {STATUS_STEPS[stepIndex]?.description}
            </p>
          </div>
        </div>
      ) : (
        /* Cancelled state */
        <div className="px-6 py-10 text-center">
          <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="#dc2626">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </div>
          <p className="font-display text-lg font-semibold text-red-700 mb-1">Order Cancelled</p>
          <p className="text-sm text-red-500">
            This order was cancelled. <Link href="/products" className="underline">Browse products</Link> to place a new order.
          </p>
        </div>
      )}

      {/* ── Items list ── */}
      <div className="px-6 pb-6">
        <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-faint)' }}>
          Items in this order
        </p>
        <div className="space-y-3">
          {order.items.map(item => (
            <div key={item.id} className="flex items-center gap-3 rounded-xl p-3 border"
              style={{ background: 'var(--bg-subtle)', borderColor: 'var(--border-subtle)' }}>
              {item.imageUrl && (
                <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0">
                  <Image src={item.imageUrl} alt={item.productName} fill className="object-cover"/>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <Link href={`/products/${item.productSlug}`}
                  className="text-sm font-medium hover:underline"
                  style={{ color: 'var(--text-primary)' }}>
                  {item.productName}
                </Link>
                {item.notes && (
                  <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--text-faint)' }}>
                    Note: {item.notes}
                  </p>
                )}
              </div>
              <span className="text-sm font-semibold shrink-0" style={{ color: 'var(--text-secondary)' }}>
                × {item.quantity}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer info */}
      <div className="px-6 pb-5 flex flex-wrap gap-x-6 gap-y-1">
        <p className="text-xs" style={{ color: 'var(--text-faint)' }}>
          📍 {order.address}
        </p>
        {order.notes && (
          <p className="text-xs" style={{ color: 'var(--text-faint)' }}>
            📝 {order.notes}
          </p>
        )}
      </div>
    </div>
  )
}

// ── Status badge ─────────────────────────────────────────────
function StatusBadge({ status }: { status: OrderStatus }) {
  const config: Record<OrderStatus, { label: string; bg: string; color: string }> = {
    PENDING:       { label: 'Pending',       bg: '#fef3c7', color: '#92400e' },
    CONFIRMED:     { label: 'Confirmed',     bg: '#dbeafe', color: '#1e40af' },
    IN_PRODUCTION: { label: 'In Production', bg: '#ede9fe', color: '#5b21b6' },
    DELIVERED:     { label: 'Delivered',     bg: '#d1fae5', color: '#065f46' },
    CANCELLED:     { label: 'Cancelled',     bg: '#fee2e2', color: '#991b1b' },
  }
  const c = config[status] || config.PENDING
  return (
    <span className="text-xs font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full"
      style={{ background: c.bg, color: c.color }}>
      {c.label}
    </span>
  )
}
