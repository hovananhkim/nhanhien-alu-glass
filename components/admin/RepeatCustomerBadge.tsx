'use client'

import { useState } from 'react'

type OrderHistory = {
  id: string
  orderNumber: string
  status: string
  orderType: string
  createdAt: string
  estimatedValue: number
}

const fmtRs = (n: number) => `₹${n.toLocaleString('en-IN')}`

export default function RepeatCustomerBadge({ email, count }: { email: string; count: number }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [orders, setOrders] = useState<OrderHistory[]>([])
  const [error, setError] = useState('')

  const handleOpen = async () => {
    setOpen(true)
    if (orders.length > 0) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/admin/orders/by-email?email=${encodeURIComponent(email)}`)
      const json = await res.json()
      if (!res.ok) {
        setError(json.error || 'Failed to load history')
        return
      }
      setOrders(json.orders || [])
    } catch {
      setError('Failed to load history')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={handleOpen}
        className="text-[11px] px-2 py-1 rounded-full font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors"
      >
        Repeat Customer ({count})
      </button>

      {open && (
        <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center p-4" onClick={() => setOpen(false)}>
          <div className="w-full max-w-lg bg-white rounded-2xl border border-stone-200 shadow-xl p-5" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-charcoal-800">Order History</h3>
                <p className="text-xs text-stone-500 mt-0.5">{email}</p>
              </div>
              <button onClick={() => setOpen(false)} className="text-sm text-stone-500 hover:text-charcoal-700">Close</button>
            </div>

            {loading && <p className="text-sm text-stone-400">Loading...</p>}
            {error && <p className="text-sm text-red-600">{error}</p>}
            {!loading && !error && (
              <div className="max-h-80 overflow-auto divide-y divide-stone-100">
                {orders.map(order => (
                  <div key={order.id} className="py-3 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-charcoal-700">{order.orderNumber}</p>
                      <p className="text-xs text-stone-500">
                        {new Date(order.createdAt).toLocaleDateString('en-IN')} · {order.status.replace('_', ' ')}
                      </p>
                    </div>
                    <p className="text-xs font-semibold text-charcoal-700">{fmtRs(order.estimatedValue)}</p>
                  </div>
                ))}
                {!orders.length && <p className="py-6 text-center text-xs text-stone-400">No previous orders found.</p>}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
