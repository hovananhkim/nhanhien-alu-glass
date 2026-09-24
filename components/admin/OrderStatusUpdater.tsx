'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const statuses = ['PENDING', 'CONFIRMED', 'IN_PRODUCTION', 'DELIVERED', 'CANCELLED']

export default function OrderStatusUpdater({
  orderId, currentStatus, expectedDeliveryAt
}: { orderId: string; currentStatus: string; expectedDeliveryAt?: Date | string | null }) {
  const [status, setStatus] = useState(currentStatus)
  const [deliveryDate, setDeliveryDate] = useState(
    expectedDeliveryAt ? new Date(expectedDeliveryAt).toISOString().slice(0, 10) : '',
  )
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const save = async (nextStatus: string, nextDeliveryDate: string) => {
    setSaving(true)
    setError('')
    const res = await fetch(`/api/orders/${orderId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: nextStatus,
        expectedDeliveryAt: nextDeliveryDate || null,
      }),
    })
    if (!res.ok) {
      const json = await res.json().catch(() => null)
      throw new Error(json?.error || 'Failed to update order')
    }
    router.refresh()
    setSaving(false)
  }

  const handleChange = async (newStatus: string) => {
    const prevStatus = status
    setStatus(newStatus)
    try {
      await save(newStatus, deliveryDate)
    } catch (e: any) {
      setStatus(prevStatus)
      setError(e.message || 'Failed to update status')
      setSaving(false)
    }
  }

  const handleDateChange = async (newDate: string) => {
    const prevDate = deliveryDate
    setDeliveryDate(newDate)
    try {
      await save(status, newDate)
    } catch (e: any) {
      setDeliveryDate(prevDate)
      setError(e.message || 'Failed to update delivery date')
      setSaving(false)
    }
  }

  const isInProduction = status === 'IN_PRODUCTION'

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="relative">
        <select
          value={status}
          onChange={e => handleChange(e.target.value)}
          disabled={saving}
          className={`text-xs font-semibold px-3 py-1.5 rounded-lg border appearance-none cursor-pointer pr-7 transition-all ${
            status === 'PENDING' ? 'bg-amber-50 border-amber-200 text-amber-800' :
            status === 'CONFIRMED' ? 'bg-blue-50 border-blue-200 text-blue-800' :
            status === 'IN_PRODUCTION' ? 'bg-indigo-50 border-indigo-200 text-indigo-800' :
            status === 'DELIVERED' ? 'bg-green-50 border-green-200 text-green-800' :
            'bg-red-50 border-red-200 text-red-700'
          }`}
        >
          {statuses.map(s => (
            <option key={s} value={s}>{s.replace('_', ' ')}</option>
          ))}
        </select>
        <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
          {saving ? (
            <span className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin block" />
          ) : (
            <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor"><path d="M2 3l3 4 3-4H2z"/></svg>
          )}
        </div>
      </div>
      {(isInProduction || deliveryDate) && (
        <div className="flex flex-col items-end gap-1">
          <input
            type="date"
            value={deliveryDate}
            onChange={e => handleDateChange(e.target.value)}
            disabled={saving}
            className={`text-xs px-2 py-1.5 rounded-lg border bg-white ${
              isInProduction && !deliveryDate
                ? 'border-amber-300 text-amber-800'
                : 'border-stone-200 text-stone-600'
            }`}
            title="Expected delivery date"
          />
          {isInProduction && !deliveryDate && (
            <p className="text-[10px] text-amber-700">Set date for forecast</p>
          )}
        </div>
      )}
      {error && <p className="text-[10px] text-red-600 max-w-36 text-right">{error}</p>}
    </div>
  )
}
