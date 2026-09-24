'use client'

import { useEffect, useMemo, useState } from 'react'

type TrendRow = { label: string; totalCost: number; rawMaterialCost: number }
type CostData = {
  summary: {
    totalConsumptionCost: number
    rawMaterialCost: number
    rawMaterialShare: number
    monthCount: number
  }
  trend: TrendRow[]
  categoryBreakdown: { category: string; amount: number }[]
  topMaterials: { name: string; amount: number }[]
}

const fmtRs = (n: number) => `₹${n.toLocaleString('en-IN')}`

export default function ManufacturingCostDashboard() {
  const [months, setMonths] = useState(6)
  const [data, setData] = useState<CostData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError('')
      try {
        const res = await fetch(`/api/admin/manufacturing-cost?months=${months}`)
        const json = await res.json()
        if (!res.ok) {
          setError(json.error || 'Failed to load report')
          return
        }
        setData(json)
      } catch {
        setError('Failed to load report')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [months])

  const maxTrend = useMemo(
    () => Math.max(...(data?.trend.map(row => row.totalCost) || [1]), 1),
    [data],
  )
  const maxCategory = useMemo(
    () => Math.max(...(data?.categoryBreakdown.map(row => row.amount) || [1]), 1),
    [data],
  )

  if (loading) return <div className="p-8 text-sm text-stone-400">Loading manufacturing cost report...</div>
  if (error) return <div className="p-8"><div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">{error}</div></div>
  if (!data) return null

  return (
    <div className="p-6 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-display font-semibold text-charcoal-800">Manufacturing Cost Report</h1>
          <p className="text-xs text-stone-400 mt-0.5">Track consumed material cost trends and major cost drivers.</p>
        </div>
        <div className="flex items-center gap-1">
          {[3, 6, 12].map(m => (
            <button
              key={m}
              onClick={() => setMonths(m)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                months === m ? 'bg-charcoal-800 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {m}mo
            </button>
          ))}
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-3">
        <Card label="Consumed Cost" value={fmtRs(data.summary.totalConsumptionCost)} />
        <Card label="RAW_MATERIAL Cost" value={fmtRs(data.summary.rawMaterialCost)} />
        <Card label="RAW Share" value={`${data.summary.rawMaterialShare}%`} />
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-white rounded-xl border border-stone-100 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-charcoal-700 mb-4">6-Month Cost Trend</h2>
          <div className="space-y-3">
            {data.trend.map(row => (
              <div key={row.label}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-charcoal-700 font-medium">{row.label}</span>
                  <span className="text-stone-500">{fmtRs(row.totalCost)}</span>
                </div>
                <div className="h-2 rounded-full bg-stone-100 overflow-hidden">
                  <div className="h-full bg-wood-500 rounded-full" style={{ width: `${(row.totalCost / maxTrend) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-stone-100 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-charcoal-700 mb-4">Category Breakdown</h2>
          <div className="space-y-3">
            {data.categoryBreakdown.length === 0 && <p className="text-xs text-stone-400">No cost data.</p>}
            {data.categoryBreakdown.map(row => (
              <div key={row.category}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-medium text-charcoal-700">{row.category}</span>
                  <span className="text-stone-500">{fmtRs(row.amount)}</span>
                </div>
                <div className="h-2 rounded-full bg-stone-100 overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: `${(row.amount / maxCategory) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-stone-100 shadow-sm p-5">
        <h2 className="text-sm font-semibold text-charcoal-700 mb-4">Top 5 Most Expensive Materials</h2>
        {data.topMaterials.length === 0 ? (
          <p className="text-xs text-stone-400">No material consumption found for selected period.</p>
        ) : (
          <div className="divide-y divide-stone-100">
            {data.topMaterials.map((mat, idx) => (
              <div key={mat.name} className="py-3 flex items-center justify-between">
                <div className="text-sm text-charcoal-700">
                  <span className="text-stone-400 mr-2">{String(idx + 1).padStart(2, '0')}</span>
                  {mat.name}
                </div>
                <div className="text-sm font-semibold text-charcoal-800">{fmtRs(mat.amount)}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function Card({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white rounded-xl border border-stone-100 shadow-sm p-4">
      <div className="text-xs text-stone-400 mb-1">{label}</div>
      <div className="text-xl font-display font-semibold text-charcoal-800">{value}</div>
    </div>
  )
}
