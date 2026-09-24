'use client'
import { useState, useEffect, useCallback } from 'react'

// ── Types ─────────────────────────────────────────────────────
interface MonthData {
  label: string; orders: number; b2b: number
  b2c: number; inquiries: number; revenue: number
}
interface AnalyticsData {
  monthlyData:     MonthData[]
  b2bTotal:        number
  b2cTotal:        number
  statusData:      { status: string; count: number }[]
  topProductsData: { productName: string; orderCount: number; totalQty: number }[]
  summary: {
    totalOrders: number; totalInquiries: number
    deliveredOrders: number; cancelledOrders: number
    estimatedRevenue: number; conversionRate: number
  }
}

// ── Palette ───────────────────────────────────────────────────
const C = {
  wood:   '#a85e2e', woodL: '#e0b878',
  blue:   '#3b82f6', green: '#10b981',
  purple: '#8b5cf6', red:   '#ef4444',
  amber:  '#f59e0b', cyan:  '#06b6d4',
  grid:   '#f0ece7', label: '#a8a29e', axis: '#d6d3d1',
}
const STATUS_COLORS: Record<string, string> = {
  PENDING: C.amber, CONFIRMED: C.blue,
  IN_PRODUCTION: C.purple, DELIVERED: C.green, CANCELLED: C.red,
}
const BAR_COLORS = [C.wood, C.blue, C.purple, C.green, C.amber, C.red, C.cyan]

// ── Helpers ───────────────────────────────────────────────────
const fmt   = (n: number) => n.toLocaleString('en-IN')
const fmtRs = (n: number) => `₹${n.toLocaleString('en-IN')}`

// Smart Y-axis ticks — always clean round numbers
function yTicks(max: number): number[] {
  if (max === 0) return [0]
  const raw  = max / 4
  const mag  = Math.pow(10, Math.floor(Math.log10(raw)))
  const nice = Math.ceil(raw / mag) * mag
  return [0, nice, nice * 2, nice * 3, nice * 4]
}

// Skip x-labels when too crowded — show every Nth
function skipEvery(n: number, total: number): number {
  if (total <= 6)  return 1
  if (total <= 9)  return 2
  return 3
}

export default function AnalyticsDashboard() {
  const [data, setData]     = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [months, setMonths] = useState(6)
  const [error, setError]   = useState('')
  const [view, setView]     = useState<'charts' | 'table'>('charts')

  // Export
  const [exportType,   setExportType]   = useState<'orders'|'inquiries'|'products'>('orders')
  const [exportFormat, setExportFormat] = useState<'csv'|'xlsx'>('xlsx')
  const [exportFrom,   setExportFrom]   = useState('')
  const [exportTo,     setExportTo]     = useState('')
  const [exporting,    setExporting]    = useState(false)

  const load = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const res  = await fetch(`/api/admin/analytics?months=${months}`)
      const json = await res.json()
      if (!res.ok) { setError(json.error); return }
      setData(json)
    } catch { setError('Failed to load analytics.') }
    setLoading(false)
  }, [months])

  useEffect(() => { load() }, [load])

  const handleExport = async () => {
    setExporting(true)
    const p = new URLSearchParams({
      type: exportType, format: exportFormat,
      ...(exportFrom ? { from: exportFrom } : {}),
      ...(exportTo   ? { to:   exportTo   } : {}),
    })
    const res = await fetch(`/api/admin/export?${p}`)
    if (res.ok) {
      const blob = await res.blob()
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      a.href     = url
      a.download = `craftura-${exportType}-${new Date().toISOString().slice(0,10)}.${exportFormat}`
      a.click(); URL.revokeObjectURL(url)
    } else {
      const d = await res.json(); alert(d.error || 'Export failed')
    }
    setExporting(false)
  }

  if (loading) return (
    <div className="p-8 flex items-center justify-center h-64">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-stone-200 border-t-wood-600 rounded-full animate-spin mx-auto mb-3"/>
        <p className="text-stone-400 text-sm">Loading analytics…</p>
      </div>
    </div>
  )
  if (error) return (
    <div className="p-8"><div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm">{error}</div></div>
  )
  if (!data) return null

  const { monthlyData, b2bTotal, b2cTotal, statusData, topProductsData, summary } = data

  return (
    <div className="p-6 space-y-5">

      {/* ── Header ── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-display font-semibold text-charcoal-800">Analytics</h1>
          <p className="text-stone-400 text-xs mt-0.5">Business intelligence from your live data</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* View toggle */}
          <div className="flex rounded-lg border border-stone-200 p-0.5 bg-stone-50 text-xs">
            {(['charts','table'] as const).map(v => (
              <button key={v} onClick={() => setView(v)}
                className={`px-3 py-1.5 rounded-md font-medium capitalize transition-all ${
                  view === v ? 'bg-white shadow-sm text-charcoal-800' : 'text-stone-400 hover:text-charcoal-600'
                }`}>{v === 'charts' ? '📊 Charts' : '📋 Data Table'}</button>
            ))}
          </div>
          {/* Month filter */}
          <div className="flex items-center gap-1">
            <span className="text-xs text-stone-400 mr-1">Period:</span>
            {[3, 6, 12].map(m => (
              <button key={m} onClick={() => setMonths(m)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  months === m ? 'bg-charcoal-800 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}>{m}mo</button>
            ))}
          </div>
        </div>
      </div>

      {/* ── KPI Row — compact 6 cards ── */}
      <div className="grid grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: 'Orders',      value: fmt(summary.totalOrders),        color: C.blue,   icon: '📋' },
          { label: 'Delivered',   value: fmt(summary.deliveredOrders),    color: C.green,  icon: '✅' },
          { label: 'Inquiries',   value: fmt(summary.totalInquiries),     color: C.amber,  icon: '💬' },
          { label: 'Conversion',  value: `${summary.conversionRate}%`,    color: C.purple, icon: '📈' },
          { label: 'Cancelled',   value: fmt(summary.cancelledOrders),    color: C.red,    icon: '❌' },
          { label: 'Est. Revenue',value: fmtRs(summary.estimatedRevenue), color: C.wood,   icon: '₹'  },
        ].map(k => (
          <div key={k.label} className="bg-white rounded-xl border border-stone-100 shadow-sm px-4 py-3">
            <div className="text-base mb-1">{k.icon}</div>
            <div className="font-display text-xl font-semibold" style={{ color: k.color }}>{k.value}</div>
            <div className="text-xs text-stone-400 mt-0.5">{k.label}</div>
          </div>
        ))}
      </div>

      {/* ════════════════════════════════════════════════════════ */}
      {/* ── CHARTS VIEW ── */}
      {/* ════════════════════════════════════════════════════════ */}
      {view === 'charts' && (
        <div className="space-y-5">

          {/* Row 1: Bar + Donut side by side */}
          <div className="grid lg:grid-cols-3 gap-5">

            {/* Stacked bar — 2/3 width */}
            <div className="lg:col-span-2 bg-white rounded-xl border border-stone-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-sm text-charcoal-700">Orders Over Time</h2>
                <div className="flex items-center gap-3 text-xs text-stone-500">
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm" style={{ background: C.wood }}/>B2B</span>
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm" style={{ background: C.woodL }}/>B2C</span>
                </div>
              </div>
              <BarChart data={monthlyData} />
            </div>

            {/* Donut — 1/3 width */}
            <div className="bg-white rounded-xl border border-stone-100 shadow-sm p-5">
              <h2 className="font-semibold text-sm text-charcoal-700 mb-4">B2B vs B2C</h2>
              <DonutChart b2b={b2bTotal} b2c={b2cTotal} />
            </div>
          </div>

          {/* Row 2: Line chart + two bar lists */}
          <div className="grid lg:grid-cols-3 gap-5">

            {/* Line — 1/3 */}
            <div className="bg-white rounded-xl border border-stone-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-sm text-charcoal-700">Trend</h2>
                <div className="flex items-center gap-3 text-xs text-stone-500">
                  <span className="flex items-center gap-1"><span className="w-4 h-0.5 inline-block rounded" style={{ background: C.wood }}/>Orders</span>
                  <span className="flex items-center gap-1"><span className="w-4 h-0.5 inline-block rounded" style={{ background: C.blue }}/>Inquiries</span>
                </div>
              </div>
              <LineChart data={monthlyData} />
            </div>

            {/* Status bars — 1/3 */}
            <div className="bg-white rounded-xl border border-stone-100 shadow-sm p-5">
              <h2 className="font-semibold text-sm text-charcoal-700 mb-4">By Status</h2>
              <StatusBars data={statusData} />
            </div>

            {/* Top products — 1/3 */}
            <div className="bg-white rounded-xl border border-stone-100 shadow-sm p-5">
              <h2 className="font-semibold text-sm text-charcoal-700 mb-4">Top Products</h2>
              <TopProductsBars data={topProductsData} />
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════ */}
      {/* ── DATA TABLE VIEW ── */}
      {/* ════════════════════════════════════════════════════════ */}
      {view === 'table' && (
        <div className="space-y-5">

          {/* Monthly breakdown table */}
          <div className="bg-white rounded-xl border border-stone-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between">
              <h2 className="font-semibold text-sm text-charcoal-700">Monthly Breakdown</h2>
              <span className="text-xs text-stone-400">Last {months} months</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-stone-50 border-b border-stone-100">
                    {['Month','Total Orders','B2B','B2C','Inquiries','Est. Revenue'].map(h => (
                      <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wider whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-50">
                  {[...monthlyData].reverse().map(row => (
                    <tr key={row.label} className="hover:bg-stone-50 transition-colors">
                      <td className="px-5 py-3 font-medium text-charcoal-700 whitespace-nowrap">{row.label}</td>
                      <td className="px-5 py-3">
                        <span className="font-semibold text-charcoal-800">{row.orders}</span>
                        {row.orders > 0 && (
                          <div className="w-16 h-1.5 rounded-full mt-1 overflow-hidden bg-stone-100">
                            <div className="h-full rounded-full" style={{
                              width: `${(row.orders / Math.max(...monthlyData.map(d => d.orders), 1)) * 100}%`,
                              background: C.blue,
                            }}/>
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        <span className="inline-flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-sm" style={{ background: C.wood }}/>
                          <span className="font-medium" style={{ color: C.wood }}>{row.b2b}</span>
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <span className="inline-flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-sm" style={{ background: C.woodL }}/>
                          <span className="font-medium" style={{ color: '#b07a2a' }}>{row.b2c}</span>
                        </span>
                      </td>
                      <td className="px-5 py-3 text-stone-500">{row.inquiries}</td>
                      <td className="px-5 py-3 font-medium text-charcoal-700">
                        {row.revenue > 0 ? fmtRs(row.revenue) : <span className="text-stone-300">—</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-stone-200 bg-stone-50">
                    <td className="px-5 py-3 font-semibold text-charcoal-800 text-xs uppercase tracking-wider">Total</td>
                    <td className="px-5 py-3 font-bold text-charcoal-800">{summary.totalOrders}</td>
                    <td className="px-5 py-3 font-semibold" style={{ color: C.wood }}>{b2bTotal}</td>
                    <td className="px-5 py-3 font-semibold" style={{ color: '#b07a2a' }}>{b2cTotal}</td>
                    <td className="px-5 py-3 font-semibold text-charcoal-700">{summary.totalInquiries}</td>
                    <td className="px-5 py-3 font-bold text-charcoal-700">{fmtRs(summary.estimatedRevenue)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Two tables side by side: Status + Top Products */}
          <div className="grid lg:grid-cols-2 gap-5">

            {/* Status breakdown table */}
            <div className="bg-white rounded-xl border border-stone-100 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-stone-100">
                <h2 className="font-semibold text-sm text-charcoal-700">Orders by Status</h2>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-stone-50 border-b border-stone-100">
                    {['Status','Count','Share'].map(h => (
                      <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-50">
                  {statusData.map(row => {
                    const total = statusData.reduce((s, r) => s + r.count, 0)
                    const pct   = total > 0 ? Math.round((row.count / total) * 100) : 0
                    const color = STATUS_COLORS[row.status] || C.axis
                    const label: Record<string,string> = {
                      PENDING:'Pending', CONFIRMED:'Confirmed',
                      IN_PRODUCTION:'In Production', DELIVERED:'Delivered', CANCELLED:'Cancelled',
                    }
                    return (
                      <tr key={row.status} className="hover:bg-stone-50">
                        <td className="px-5 py-3">
                          <span className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full" style={{ background: color }}/>
                            <span className="font-medium text-charcoal-700">{label[row.status] || row.status}</span>
                          </span>
                        </td>
                        <td className="px-5 py-3 font-semibold text-charcoal-800">{row.count}</td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-1.5 rounded-full bg-stone-100 overflow-hidden">
                              <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }}/>
                            </div>
                            <span className="text-xs text-stone-500">{pct}%</span>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Top products table */}
            <div className="bg-white rounded-xl border border-stone-100 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-stone-100">
                <h2 className="font-semibold text-sm text-charcoal-700">Top Products by Orders</h2>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-stone-50 border-b border-stone-100">
                    {['#','Product','Orders','Units'].map(h => (
                      <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-50">
                  {topProductsData.slice(0, 8).map((row, i) => (
                    <tr key={row.productName} className="hover:bg-stone-50">
                      <td className="px-5 py-3 text-stone-400 font-mono text-xs">{String(i+1).padStart(2,'0')}</td>
                      <td className="px-5 py-3 font-medium text-charcoal-700 max-w-[180px] truncate" title={row.productName}>
                        {row.productName}
                      </td>
                      <td className="px-5 py-3">
                        <span className="font-semibold text-charcoal-800">{row.orderCount}</span>
                      </td>
                      <td className="px-5 py-3 text-stone-500">{row.totalQty}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── Export Panel ── */}
      <div className="bg-white rounded-xl border border-stone-100 shadow-sm p-5">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-base">📥</span>
          <h2 className="font-semibold text-sm text-charcoal-700">Export Data</h2>
          <span className="text-xs text-stone-400 ml-1">— Download as CSV or Excel for accounting / GST</span>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end">
          <div>
            <label className="block text-xs font-medium text-charcoal-600 mb-1">Data Type</label>
            <select className="form-input text-sm py-2"
              value={exportType} onChange={e => setExportType(e.target.value as any)}>
              <option value="orders">Orders</option>
              <option value="inquiries">Inquiries</option>
              <option value="products">Products</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-charcoal-600 mb-1">Format</label>
            <div className="flex rounded-lg border border-stone-200 p-0.5 bg-stone-50">
              {(['csv','xlsx'] as const).map(f => (
                <button key={f} onClick={() => setExportFormat(f)}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-md uppercase tracking-wide transition-all ${
                    exportFormat === f ? 'bg-white shadow-sm text-charcoal-800' : 'text-stone-400'
                  }`}>{f}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-charcoal-600 mb-1">From</label>
            <input type="date" className="form-input text-sm py-2"
              value={exportFrom} onChange={e => setExportFrom(e.target.value)}/>
          </div>
          <div>
            <label className="block text-xs font-medium text-charcoal-600 mb-1">To</label>
            <input type="date" className="form-input text-sm py-2"
              value={exportTo} onChange={e => setExportTo(e.target.value)}/>
          </div>
          <button onClick={handleExport} disabled={exporting}
            className="flex items-center justify-center gap-2 py-2 px-4 bg-charcoal-800 hover:bg-charcoal-900 text-white text-sm font-medium rounded-xl transition-colors disabled:opacity-60">
            {exporting
              ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>Exporting…</>
              : <><svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>Download {exportFormat.toUpperCase()}</>
            }
          </button>
        </div>
        <div className="mt-3 pt-3 border-t border-stone-100 flex flex-wrap gap-2">
          <span className="text-xs text-stone-400 self-center">Quick:</span>
          {[
            { label: 'This month orders', type: 'orders', from: thisMonthStart(), fmt: 'xlsx' },
            { label: 'All orders',        type: 'orders', from: '', fmt: 'xlsx' },
            { label: 'All inquiries',     type: 'inquiries', from: '', fmt: 'csv' },
            { label: 'Product catalogue', type: 'products', from: '', fmt: 'xlsx' },
          ].map(q => (
            <button key={q.label}
              onClick={() => { setExportType(q.type as any); setExportFrom(q.from); setExportTo(''); setExportFormat(q.fmt as any) }}
              className="text-xs px-2.5 py-1 rounded-lg border border-stone-200 text-stone-500 hover:border-wood-400 hover:text-wood-600 transition-all">
              {q.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function thisMonthStart() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-01`
}

// ══════════════════════════════════════════════════════════════
// SVG Chart Components — fixed coordinate system with proper margins
// ══════════════════════════════════════════════════════════════

// Shared chart dimensions
const CW  = 460   // canvas width  (SVG units)
const CH  = 140   // chart area height
const ML  = 36    // left margin  (Y axis labels)
const MB  = 24    // bottom margin (X axis labels)
const MR  = 8     // right margin

function BarChart({ data }: { data: MonthData[] }) {
  if (!data.length) return <Empty />
  const maxVal = Math.max(...data.map(d => d.orders), 1)
  const ticks  = yTicks(maxVal)
  const maxTick = ticks[ticks.length - 1]
  const n      = data.length
  const skip   = skipEvery(1, n)
  const chartW = CW - ML - MR
  const barW   = Math.max(6, Math.min(28, (chartW / n) * 0.55))

  return (
    <svg viewBox={`0 0 ${CW} ${CH + MB + 4}`} className="w-full">
      {/* Y-axis grid + labels */}
      {ticks.map(t => {
        const y = CH - (t / maxTick) * CH
        return (
          <g key={t}>
            <line x1={ML} y1={y} x2={CW - MR} y2={y} stroke={C.grid} strokeWidth="1"/>
            <text x={ML - 5} y={y + 4} textAnchor="end" fontSize="9" fill={C.label}>{t}</text>
          </g>
        )
      })}
      {/* Y axis line */}
      <line x1={ML} y1={0} x2={ML} y2={CH} stroke={C.axis} strokeWidth="0.5"/>

      {/* Bars */}
      {data.map((d, i) => {
        const cx   = ML + (i / n) * chartW + chartW / n / 2
        const b2cH = (d.b2c / maxTick) * CH
        const b2bH = (d.b2b / maxTick) * CH
        const totalH = b2cH + b2bH
        const showLabel = i % skip === 0

        return (
          <g key={d.label}>
            {/* B2C */}
            {b2cH > 0 && <rect x={cx - barW/2} y={CH - b2cH} width={barW} height={b2cH} fill={C.woodL} rx="2"/>}
            {/* B2B on top */}
            {b2bH > 0 && <rect x={cx - barW/2} y={CH - totalH} width={barW} height={b2bH} fill={C.wood} rx="2"/>}
            {/* X label — only every Nth */}
            {showLabel && (
              <text x={cx} y={CH + MB - 4} textAnchor="middle" fontSize="9" fill={C.label}>
                {d.label}
              </text>
            )}
            <title>{d.label}: {d.orders} orders (B2B {d.b2b}, B2C {d.b2c})</title>
          </g>
        )
      })}
      {/* X axis line */}
      <line x1={ML} y1={CH} x2={CW - MR} y2={CH} stroke={C.axis} strokeWidth="0.5"/>
    </svg>
  )
}

function LineChart({ data }: { data: MonthData[] }) {
  if (!data.length) return <Empty />
  const maxV  = Math.max(...data.map(d => Math.max(d.orders, d.inquiries)), 1)
  const ticks = yTicks(maxV)
  const maxTick = ticks[ticks.length - 1]
  const n     = data.length
  const skip  = skipEvery(1, n)
  const chartW = CW - ML - MR

  const pts = (key: 'orders'|'inquiries') =>
    data.map((d, i) => ({
      x: ML + (n === 1 ? chartW/2 : (i / (n-1)) * chartW),
      y: CH - (d[key] / maxTick) * CH,
    }))

  const orderPts   = pts('orders')
  const inquiryPts = pts('inquiries')
  const poly = (p: {x:number;y:number}[]) => p.map(pt => `${pt.x},${pt.y}`).join(' ')
  const areaPath = (p: {x:number;y:number}[]) =>
    `M${p[0].x},${CH} ${p.map(pt => `L${pt.x},${pt.y}`).join(' ')} L${p[p.length-1].x},${CH} Z`

  return (
    <svg viewBox={`0 0 ${CW} ${CH + MB + 4}`} className="w-full">
      {ticks.map(t => {
        const y = CH - (t / maxTick) * CH
        return (
          <g key={t}>
            <line x1={ML} y1={y} x2={CW-MR} y2={y} stroke={C.grid} strokeWidth="1"/>
            <text x={ML-5} y={y+4} textAnchor="end" fontSize="9" fill={C.label}>{t}</text>
          </g>
        )
      })}
      <line x1={ML} y1={0} x2={ML} y2={CH} stroke={C.axis} strokeWidth="0.5"/>
      <line x1={ML} y1={CH} x2={CW-MR} y2={CH} stroke={C.axis} strokeWidth="0.5"/>

      <path d={areaPath(inquiryPts)} fill={C.blue} opacity="0.07"/>
      <path d={areaPath(orderPts)}   fill={C.wood} opacity="0.07"/>

      <polyline points={poly(inquiryPts)} fill="none" stroke={C.blue} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <polyline points={poly(orderPts)}   fill="none" stroke={C.wood} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>

      {data.map((d, i) => (
        <g key={i}>
          <circle cx={orderPts[i].x}   cy={orderPts[i].y}   r="2.5" fill="white" stroke={C.wood} strokeWidth="1.5"/>
          <circle cx={inquiryPts[i].x} cy={inquiryPts[i].y} r="2.5" fill="white" stroke={C.blue} strokeWidth="1.5"/>
          {i % skip === 0 && (
            <text x={orderPts[i].x} y={CH + MB - 4} textAnchor="middle" fontSize="9" fill={C.label}>
              {d.label}
            </text>
          )}
          <title>{d.label}: {d.orders} orders, {d.inquiries} inquiries</title>
        </g>
      ))}
    </svg>
  )
}

function DonutChart({ b2b, b2c }: { b2b: number; b2c: number }) {
  const total = b2b + b2c
  if (total === 0) return <Empty />
  const b2bPct = b2b / total
  const cx = 70, cy = 70, r = 52, sw = 22
  const circ   = 2 * Math.PI * r
  const b2bArc = b2bPct * circ
  const b2cArc = (1 - b2bPct) * circ

  return (
    <div className="flex flex-col items-center gap-3">
      <svg viewBox="0 0 140 140" className="w-32 h-32">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={C.woodL} strokeWidth={sw}
          strokeDasharray={`${b2cArc} ${circ}`}
          transform={`rotate(-90 ${cx} ${cy})`}/>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={C.wood} strokeWidth={sw}
          strokeDasharray={`${b2bArc} ${circ}`}
          strokeDashoffset={-b2cArc}
          transform={`rotate(-90 ${cx} ${cy})`}/>
        <text x={cx} y={cy-6} textAnchor="middle" fontSize="16" fontWeight="700" fill="#1c1917">{total}</text>
        <text x={cx} y={cy+10} textAnchor="middle" fontSize="8" fill="#78716c">total</text>
      </svg>
      <div className="flex gap-5 text-xs w-full">
        {[{label:'B2B', val:b2b, pct:Math.round(b2bPct*100), color:C.wood},
          {label:'B2C', val:b2c, pct:Math.round((1-b2bPct)*100), color:C.woodL}].map(s => (
          <div key={s.label} className="flex-1 rounded-lg p-2.5 text-center" style={{ background: `${s.color}14` }}>
            <div className="font-semibold text-xs text-charcoal-600 mb-0.5">{s.label}</div>
            <div className="font-display text-lg font-bold" style={{ color: s.color }}>{s.val}</div>
            <div className="text-stone-400">{s.pct}%</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function StatusBars({ data }: { data: { status: string; count: number }[] }) {
  if (!data.length) return <Empty />
  const max = Math.max(...data.map(d => d.count), 1)
  const labels: Record<string,string> = {
    PENDING:'Pending', CONFIRMED:'Confirmed',
    IN_PRODUCTION:'In Production', DELIVERED:'Delivered', CANCELLED:'Cancelled',
  }
  return (
    <div className="space-y-3">
      {data.map(d => {
        const pct   = (d.count / max) * 100
        const color = STATUS_COLORS[d.status] || C.axis
        return (
          <div key={d.status}>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-medium text-charcoal-700">{labels[d.status] || d.status}</span>
              <span className="font-semibold tabular-nums" style={{ color }}>{d.count}</span>
            </div>
            <div className="h-2 rounded-full" style={{ background: C.grid }}>
              <div className="h-full rounded-full transition-all duration-500"
                style={{ width: `${pct}%`, background: color }}/>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function TopProductsBars({ data }: { data: { productName: string; orderCount: number }[] }) {
  if (!data.length) return <Empty />
  const max  = Math.max(...data.map(d => d.orderCount), 1)
  const top6 = data.slice(0, 6)
  return (
    <div className="space-y-3">
      {top6.map((d, i) => {
        const pct   = (d.orderCount / max) * 100
        const color = BAR_COLORS[i % BAR_COLORS.length]
        return (
          <div key={d.productName}>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-medium text-charcoal-700 truncate max-w-[150px]" title={d.productName}>
                {d.productName}
              </span>
              <span className="font-semibold ml-2 shrink-0 tabular-nums" style={{ color }}>
                {d.orderCount}
              </span>
            </div>
            <div className="h-2 rounded-full" style={{ background: C.grid }}>
              <div className="h-full rounded-full transition-all duration-500"
                style={{ width: `${pct}%`, background: color }}/>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function Empty() {
  return (
    <div className="flex items-center justify-center h-24 text-stone-300 text-xs">
      No data for this period
    </div>
  )
}