'use client'
import { useState, useCallback, useEffect } from 'react'

// ── Types ─────────────────────────────────────────────────────
interface InventoryItem {
  id: string; name: string; sku?: string; description?: string
  category: string; subCategory?: string; unit: string
  quantity: number; minQuantity?: number; maxQuantity?: number
  unitCost?: number; totalValue?: number
  supplier?: string; supplierContact?: string; location?: string
  status: string; isDeleted: boolean
  deletedAt?: string; deletionReason?: string
  createdAt: string; updatedAt: string
  createdBy?: { name: string }; updatedBy?: { name: string }; deletedBy?: { name: string }
  _count?: { transactions: number }   // ✅ optional — not always present
}
interface Transaction {
  id: string; type: string; quantity: number
  unitCost?: number; totalCost?: number
  reason?: string; reference?: string; stockAfter?: number
  createdAt: string; createdBy?: { name: string }
}
interface Summary {
  total: number; totalValue: number; lowStock: number; outOfStock: number
  byCategory: Record<string, number>
}

// ── Constants ─────────────────────────────────────────────────
const CATEGORIES = [
  { key: 'RAW_MATERIAL',  label: 'Raw Materials',   icon: '🪵', color: '#a85e2e', desc: 'Wood, fabric, metal, hardware' },
  { key: 'WIP',           label: 'Work In Progress', icon: '⚙️', color: '#7c3aed', desc: 'Unpainted or unassembled items' },
  { key: 'FINISHED_GOOD', label: 'Finished Goods',  icon: '🪑', color: '#059669', desc: 'Completed, saleable furniture' },
  { key: 'MRO',           label: 'MRO Supplies',    icon: '🔧', color: '#0284c7', desc: 'Tools, lubricants, maintenance' },
]
const UNITS   = ['pieces', 'kg', 'grams', 'meters', 'cm', 'liters', 'ml', 'sheets', 'rolls', 'boxes', 'pairs', 'sets']
const TXN_TYPES = [
  { key: 'STOCK_IN',   label: 'Stock In',    color: '#059669', dir: '+' },
  { key: 'STOCK_OUT',  label: 'Stock Out',   color: '#dc2626', dir: '-' },
  { key: 'RETURN',     label: 'Return',      color: '#2563eb', dir: '+' },
  { key: 'DAMAGE',     label: 'Damage/Loss', color: '#d97706', dir: '-' },
  { key: 'TRANSFER',   label: 'Transfer Out',color: '#7c3aed', dir: '-' },
  { key: 'ADJUSTMENT', label: 'Adjustment',  color: '#64748b', dir: '±' },
]

const STATUS_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  ACTIVE:       { bg: '#d1fae5', color: '#065f46', label: 'Active' },
  LOW_STOCK:    { bg: '#fef3c7', color: '#92400e', label: 'Low Stock' },
  OUT_OF_STOCK: { bg: '#fee2e2', color: '#991b1b', label: 'Out of Stock' },
  DISCONTINUED: { bg: '#f1f5f9', color: '#64748b', label: 'Discontinued' },
}

const fmt    = (n: number | undefined | null, dec = 2) =>
  n !== undefined && n !== null ? n.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: dec }) : '—'
const fmtRs  = (n: number | undefined | null) =>
  n !== undefined && n !== null ? `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}` : '—'
const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })

const emptyForm = { name:'', sku:'', description:'', category:'RAW_MATERIAL', subCategory:'', unit:'pieces', quantity:'', minQuantity:'', maxQuantity:'', unitCost:'', supplier:'', supplierContact:'', location:'' }

// ── Main Component ────────────────────────────────────────────
export default function InventoryManager({ initialItems, initialSummary }: { initialItems: InventoryItem[]; initialSummary: Summary }) {
  const [items, setItems]         = useState(initialItems)
  const [summary, setSummary]     = useState(initialSummary)
  const [activeTab, setActiveTab] = useState('ALL')
  const [search, setSearch]       = useState('')
  const [showDeleted, setShowDeleted] = useState(false)

  // Panels
  const [showForm, setShowForm]       = useState(false)
  const [editItem, setEditItem]       = useState<InventoryItem | null>(null)
  const [detailItem, setDetailItem]   = useState<InventoryItem | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [showTxnForm, setShowTxnForm] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<InventoryItem | null>(null)
  const [deleteReason, setDeleteReason] = useState('')

  // Form state
  const [form, setForm]           = useState(emptyForm)
  const [saving, setSaving]       = useState(false)
  const [formError, setFormError] = useState('')

  // Txn form
  const [txnForm, setTxnForm]     = useState({ type: 'STOCK_IN', quantity: '', unitCost: '', reason: '', reference: '' })
  const [txnSaving, setTxnSaving] = useState(false)
  const [txnError, setTxnError]   = useState('')

  const reload = useCallback(async () => {
    const res  = await fetch(`/api/admin/inventory?deleted=${showDeleted}`)
    const data = await res.json()
    setItems(data.items); setSummary(data.summary)
  }, [showDeleted])

  useEffect(() => { reload() }, [reload])

  const openEdit = (item: InventoryItem) => {
    setEditItem(item)
    setForm({
      name: item.name, sku: item.sku || '', description: item.description || '',
      category: item.category, subCategory: item.subCategory || '',
      unit: item.unit, quantity: String(item.quantity),
      minQuantity: item.minQuantity != null ? String(item.minQuantity) : '',
      maxQuantity: item.maxQuantity != null ? String(item.maxQuantity) : '',
      unitCost: item.unitCost != null ? String(item.unitCost) : '',
      supplier: item.supplier || '', supplierContact: item.supplierContact || '',
      location: item.location || '',
    })
    setFormError(''); setShowForm(true)
  }

  const openDetail = async (item: InventoryItem) => {
    setDetailItem(item)
    setShowTxnForm(false)
    const res  = await fetch(`/api/admin/inventory/${item.id}`)
    const data = await res.json()
    if (!data.error) {
      setDetailItem(data)
      setTransactions(data.transactions || [])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setFormError('')
    try {
      const url    = editItem ? `/api/admin/inventory/${editItem.id}` : '/api/admin/inventory'
      const method = editItem ? 'PATCH' : 'POST'
      const res    = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      if (!res.ok) { setFormError((await res.json()).error || 'Failed'); return }
      setShowForm(false); setEditItem(null); setForm(emptyForm); await reload()
    } catch { setFormError('Something went wrong') }
    setSaving(false)
  }

  const handleSoftDelete = async () => {
    if (!showDeleteConfirm) return
    await fetch(`/api/admin/inventory/${showDeleteConfirm.id}`, { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ reason: deleteReason }) })
    setShowDeleteConfirm(null); setDeleteReason(''); await reload()
  }

  const handleTxn = async (e: React.FormEvent) => {
    e.preventDefault()

    // ── Client-side validation ──────────────────────────────
    if (!txnForm.type) {
      setTxnError('Please select a movement type.')
      return
    }
    const parsedQty = parseFloat(txnForm.quantity)
    if (!txnForm.quantity || isNaN(parsedQty) || parsedQty <= 0) {
      setTxnError('Quantity must be a positive number greater than 0.')
      return
    }
    if (txnForm.unitCost && isNaN(parseFloat(txnForm.unitCost))) {
      setTxnError('Unit cost must be a valid number.')
      return
    }

    setTxnSaving(true); setTxnError('')
    try {
      const res  = await fetch(`/api/admin/inventory/${detailItem!.id}/transaction`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(txnForm),
      })
      const data = await res.json()
      if (!res.ok) { setTxnError(data.error || 'Failed to record movement'); return }

      setShowTxnForm(false)
      setTxnForm({ type: 'STOCK_IN', quantity: '', unitCost: '', reason: '', reference: '' })

      // ✅ Refresh the detail panel — response includes _count now
      const refreshed = await fetch(`/api/admin/inventory/${detailItem!.id}`).then(r => r.json())
      if (refreshed && !refreshed.error) {
        setDetailItem(refreshed)
        setTransactions(refreshed.transactions || [])
      }
      await reload()
    } catch { setTxnError('Something went wrong. Please try again.') }
    setTxnSaving(false)
  }

  // Filter
  const filtered = items.filter(i => {
    const matchTab  = activeTab === 'ALL' || i.category === activeTab
    const matchSearch = !search || [i.name, i.sku, i.supplier, i.subCategory, i.location].filter(Boolean).join(' ').toLowerCase().includes(search.toLowerCase())
    return matchTab && matchSearch
  })

  const f = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setForm(p => ({ ...p, [field]: e.target.value }))

  // ── Render ────────────────────────────────────────────────────
  return (
    <div className="space-y-5">

      {/* ── Summary Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-stone-100 shadow-sm px-5 py-4">
          <div className="text-2xl mb-1">📦</div>
          <div className="font-display text-2xl font-semibold text-charcoal-800">{summary.total}</div>
          <div className="text-xs text-stone-400 mt-0.5">Total Items</div>
        </div>
        <div className="bg-white rounded-xl border border-stone-100 shadow-sm px-5 py-4">
          <div className="text-2xl mb-1">₹</div>
          <div className="font-display text-2xl font-semibold text-wood-600">{fmtRs(summary.totalValue)}</div>
          <div className="text-xs text-stone-400 mt-0.5">Total Inventory Value</div>
        </div>
        <div className="bg-white rounded-xl border border-stone-100 shadow-sm px-5 py-4">
          <div className="text-2xl mb-1">⚠️</div>
          <div className="font-display text-2xl font-semibold text-amber-600">{summary.lowStock}</div>
          <div className="text-xs text-stone-400 mt-0.5">Low Stock Alerts</div>
        </div>
        <div className="bg-white rounded-xl border border-stone-100 shadow-sm px-5 py-4">
          <div className="text-2xl mb-1">🚫</div>
          <div className="font-display text-2xl font-semibold text-red-500">{summary.outOfStock}</div>
          <div className="text-xs text-stone-400 mt-0.5">Out of Stock</div>
        </div>
      </div>

      {/* ── Category breakdown bar ── */}
      <div className="bg-white rounded-xl border border-stone-100 shadow-sm px-5 py-4">
        <div className="flex items-center gap-6 flex-wrap">
          {CATEGORIES.map(cat => (
            <div key={cat.key} className="flex items-center gap-2">
              <span className="text-base">{cat.icon}</span>
              <span className="text-xs text-stone-500">{cat.label}</span>
              <span className="text-xs font-bold" style={{ color: cat.color }}>{summary.byCategory[cat.key] || 0}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Header: search + add ── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2 items-center flex-wrap">
          <div className="relative">
            <input type="text" placeholder="Search name, SKU, supplier…" value={search} onChange={e => setSearch(e.target.value)}
              className="form-input pl-9 py-2 text-sm w-64" />
            <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
          </div>
          <label className="flex items-center gap-1.5 text-xs text-stone-500 cursor-pointer">
            <input type="checkbox" checked={showDeleted} onChange={e => setShowDeleted(e.target.checked)} className="w-3.5 h-3.5" />
            Show deleted
          </label>
        </div>
        <button onClick={() => { setEditItem(null); setForm(emptyForm); setFormError(''); setShowForm(true) }}
          className="flex items-center gap-2 px-5 py-2.5 bg-charcoal-800 hover:bg-charcoal-900 text-white text-sm font-medium rounded-xl transition-colors">
          <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>
          Add Item
        </button>
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-1 overflow-x-auto pb-1">
        {[{ key: 'ALL', label: 'All', icon: '🗂️' }, ...CATEGORIES].map(cat => (
          <button key={cat.key} onClick={() => setActiveTab(cat.key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${activeTab === cat.key ? 'bg-charcoal-800 text-white' : 'bg-white text-stone-600 border border-stone-200 hover:border-stone-300'}`}>
            <span>{cat.icon}</span>{cat.label}
          </button>
        ))}
      </div>

      {/* ── Items Table ── */}
      <div className="bg-white rounded-xl border border-stone-100 shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <div className="text-4xl mb-3">📦</div>
            <p className="font-medium text-charcoal-600">No items found</p>
            <p className="text-sm text-stone-400 mt-1">Add your first inventory item using the button above.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-100">
                  {['Name / SKU', 'Category', 'Qty', 'Unit Cost', 'Total Value', 'Location', 'Status', 'Updated by', ''].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-50">
                {filtered.map(item => {
                  const st = STATUS_STYLE[item.status] || STATUS_STYLE.ACTIVE
                  return (
                    <tr key={item.id} className={`hover:bg-stone-50 transition-colors ${item.isDeleted ? 'opacity-50' : ''}`}>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-charcoal-800">{item.name}</div>
                        {item.sku && <div className="text-xs text-stone-400 font-mono mt-0.5">{item.sku}</div>}
                        {item.isDeleted && <div className="text-xs text-red-400 mt-0.5">🗑 Deleted</div>}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <span>{CATEGORIES.find(c => c.key === item.category)?.icon}</span>
                          <div>
                            <div className="text-xs font-medium text-charcoal-700">{CATEGORIES.find(c => c.key === item.category)?.label}</div>
                            {item.subCategory && <div className="text-xs text-stone-400">{item.subCategory}</div>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-semibold tabular-nums">
                        <span className={item.quantity <= 0 ? 'text-red-500' : item.minQuantity && item.quantity <= item.minQuantity ? 'text-amber-600' : 'text-charcoal-800'}>
                          {fmt(item.quantity, 2)}
                        </span>
                        <span className="text-xs text-stone-400 ml-1">{item.unit}</span>
                      </td>
                      <td className="px-4 py-3 text-charcoal-700 tabular-nums">{fmtRs(item.unitCost)}</td>
                      <td className="px-4 py-3 font-medium text-charcoal-800 tabular-nums">{fmtRs(item.totalValue)}</td>
                      <td className="px-4 py-3 text-stone-500 text-xs max-w-[120px] truncate">{item.location || '—'}</td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: st.bg, color: st.color }}>
                          {st.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-stone-400">{item.updatedBy?.name || '—'}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button onClick={() => openDetail(item)} title="View details & transactions"
                            className="p-1.5 text-stone-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                          </button>
                          {!item.isDeleted && (
                            <>
                              <button onClick={() => openEdit(item)} title="Edit item"
                                className="p-1.5 text-stone-400 hover:text-charcoal-700 hover:bg-stone-100 rounded-lg transition-all">
                                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                              </button>
                              <button onClick={() => { setShowDeleteConfirm(item); setDeleteReason('') }} title="Soft delete"
                                className="p-1.5 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Add / Edit Form Panel ── */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/40 backdrop-blur-sm" onClick={() => setShowForm(false)}/>
          <div className="w-full max-w-xl bg-white h-full overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white border-b border-stone-100 px-6 py-4 flex items-center justify-between z-10">
              <h2 className="font-semibold text-charcoal-800">{editItem ? 'Edit Item' : 'Add Inventory Item'}</h2>
              <button onClick={() => setShowForm(false)} className="p-1.5 text-stone-400 hover:text-charcoal-700 rounded-lg">
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {formError && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">{formError}</div>}

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-charcoal-600 mb-1.5">Item Name *</label>
                  <input required className="form-input" placeholder="e.g. Teak Wood Planks" value={form.name} onChange={f('name')} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-charcoal-600 mb-1.5">SKU / Code</label>
                  <input className="form-input font-mono" placeholder="e.g. WD-TEAK-001" value={form.sku} onChange={f('sku')} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-charcoal-600 mb-1.5">Category *</label>
                  <select required className="form-input" value={form.category} onChange={f('category')}>
                    {CATEGORIES.map(c => <option key={c.key} value={c.key}>{c.icon} {c.label}</option>)}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-charcoal-600 mb-1.5">Sub-Category</label>
                  <input className="form-input" placeholder="e.g. Teak Wood / Power Tools / Upholstery Fabric" value={form.subCategory} onChange={f('subCategory')} />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-charcoal-600 mb-1.5">Description</label>
                  <textarea rows={2} className="form-input resize-none text-sm" placeholder="Optional details about this item…" value={form.description} onChange={f('description')} />
                </div>

                <div>
                  <label className="block text-xs font-medium text-charcoal-600 mb-1.5">Quantity {editItem ? '' : '*'}</label>
                  <input type="number" min="0" step="0.01" className="form-input" placeholder="0" value={form.quantity} onChange={f('quantity')} required={!editItem} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-charcoal-600 mb-1.5">Unit *</label>
                  <select required className="form-input" value={form.unit} onChange={f('unit')}>
                    {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-charcoal-600 mb-1.5">Min Qty (Alert)</label>
                  <input type="number" min="0" step="0.01" className="form-input" placeholder="Reorder point" value={form.minQuantity} onChange={f('minQuantity')} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-charcoal-600 mb-1.5">Max Qty (Capacity)</label>
                  <input type="number" min="0" step="0.01" className="form-input" placeholder="Storage limit" value={form.maxQuantity} onChange={f('maxQuantity')} />
                </div>

                <div>
                  <label className="block text-xs font-medium text-charcoal-600 mb-1.5">Unit Cost (₹)</label>
                  <input type="number" min="0" step="0.01" className="form-input" placeholder="0.00" value={form.unitCost} onChange={f('unitCost')} />
                </div>
                <div className="flex items-end pb-1">
                  {form.quantity && form.unitCost && (
                    <div className="text-sm">
                      <span className="text-stone-400 text-xs">Total value: </span>
                      <span className="font-semibold text-charcoal-800">{fmtRs(parseFloat(form.quantity) * parseFloat(form.unitCost))}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-charcoal-600 mb-1.5">Supplier</label>
                  <input className="form-input" placeholder="Supplier name" value={form.supplier} onChange={f('supplier')} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-charcoal-600 mb-1.5">Supplier Contact</label>
                  <input className="form-input" placeholder="+91 …" value={form.supplierContact} onChange={f('supplierContact')} />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-charcoal-600 mb-1.5">Location</label>
                  <input className="form-input" placeholder="e.g. Warehouse A – Rack 3, Production Floor" value={form.location} onChange={f('location')} />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving}
                  className="flex-1 py-2.5 bg-charcoal-800 hover:bg-charcoal-900 text-white text-sm font-medium rounded-xl transition-colors disabled:opacity-60">
                  {saving ? 'Saving…' : editItem ? 'Update Item' : 'Add Item'}
                </button>
                <button type="button" onClick={() => setShowForm(false)}
                  className="px-4 py-2.5 text-stone-500 border border-stone-200 rounded-xl hover:bg-stone-50 text-sm transition-colors">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Item Detail + Transactions Panel ── */}
      {detailItem && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/40 backdrop-blur-sm" onClick={() => { setDetailItem(null); setShowTxnForm(false) }}/>
          <div className="w-full max-w-2xl bg-white h-full overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white border-b border-stone-100 px-6 py-4 flex items-center justify-between z-10">
              <div>
                <h2 className="font-semibold text-charcoal-800">{detailItem.name}</h2>
                {detailItem.sku && <p className="text-xs text-stone-400 font-mono">{detailItem.sku}</p>}
              </div>
              <div className="flex items-center gap-2">
                {!detailItem.isDeleted && (
                  <button onClick={() => setShowTxnForm(p => !p)}
                    className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg transition-colors"
                    style={{ background: showTxnForm ? '#f1f5f9' : 'var(--accent, #a85e2e)', color: showTxnForm ? '#64748b' : '#fff' }}>
                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>
                    {showTxnForm ? 'Cancel' : 'Record Movement'}
                  </button>
                )}
                <button onClick={() => { setDetailItem(null); setShowTxnForm(false) }} className="p-1.5 text-stone-400 hover:text-charcoal-700 rounded-lg">
                  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Item info cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: 'Current Qty', value: `${fmt(detailItem.quantity, 2)} ${detailItem.unit}`, color: detailItem.quantity <= 0 ? '#dc2626' : '#1c1917' },
                  { label: 'Unit Cost',    value: fmtRs(detailItem.unitCost), color: '#1c1917' },
                  { label: 'Total Value',  value: fmtRs(detailItem.totalValue), color: '#a85e2e' },
                  // ✅ Fixed: optional chaining + fallback to transactions.length
                  { label: 'Transactions', value: String(detailItem._count?.transactions ?? transactions.length), color: '#1c1917' },
                ].map(card => (
                  <div key={card.label} className="bg-stone-50 rounded-xl p-3.5">
                    <div className="text-xs text-stone-400 mb-1">{card.label}</div>
                    <div className="font-semibold text-sm" style={{ color: card.color }}>{card.value}</div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                {[
                  { label: 'Category',        value: `${CATEGORIES.find(c => c.key === detailItem.category)?.icon} ${CATEGORIES.find(c => c.key === detailItem.category)?.label}` },
                  { label: 'Sub-Category',    value: detailItem.subCategory || '—' },
                  { label: 'Location',        value: detailItem.location || '—' },
                  { label: 'Supplier',        value: detailItem.supplier || '—' },
                  { label: 'Supplier Contact',value: detailItem.supplierContact || '—' },
                  { label: 'Min Qty Alert',   value: detailItem.minQuantity != null ? `${detailItem.minQuantity} ${detailItem.unit}` : '—' },
                  { label: 'Created by',      value: detailItem.createdBy?.name || '—' },
                  { label: 'Last updated by', value: detailItem.updatedBy?.name || '—' },
                ].map(r => (
                  <div key={r.label}>
                    <div className="text-xs text-stone-400">{r.label}</div>
                    <div className="font-medium text-charcoal-700 mt-0.5">{r.value}</div>
                  </div>
                ))}
              </div>

              {/* Transaction form */}
              {showTxnForm && (
                <div className="bg-stone-50 rounded-2xl border border-stone-200 p-5">
                  <h3 className="font-semibold text-charcoal-700 text-sm mb-4">Record Stock Movement</h3>
                  {txnError && (
                    <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg px-3 py-2 text-xs mb-3 flex items-center gap-2">
                      <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                      </svg>
                      {txnError}
                    </div>
                  )}
                  <form onSubmit={handleTxn} className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-charcoal-600 mb-1.5">
                          Movement Type <span className="text-red-400">*</span>
                        </label>
                        <select
                          required
                          className="form-input text-sm"
                          value={txnForm.type}
                          onChange={e => { setTxnForm(p => ({ ...p, type: e.target.value })); setTxnError('') }}
                        >
                          {TXN_TYPES.map(t => <option key={t.key} value={t.key}>{t.dir} {t.label}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-charcoal-600 mb-1.5">
                          Quantity <span className="text-red-400">*</span>
                          <span className="text-stone-400 font-normal ml-1">in {detailItem.unit}</span>
                        </label>
                        <input
                          required
                          type="number"
                          min="0.01"
                          step="0.01"
                          className={`form-input text-sm ${txnError && !txnForm.quantity ? 'border-red-300' : ''}`}
                          placeholder={`e.g. 10`}
                          value={txnForm.quantity}
                          onChange={e => { setTxnForm(p => ({ ...p, quantity: e.target.value })); setTxnError('') }}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-charcoal-600 mb-1.5">
                          Unit Cost (₹)
                          <span className="text-stone-400 font-normal ml-1">leave blank to keep existing</span>
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          className="form-input text-sm"
                          placeholder={detailItem.unitCost ? `Current: ₹${detailItem.unitCost}` : 'e.g. 250.00'}
                          value={txnForm.unitCost}
                          onChange={e => { setTxnForm(p => ({ ...p, unitCost: e.target.value })); setTxnError('') }}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-charcoal-600 mb-1.5">Reference</label>
                        <input
                          className="form-input text-sm"
                          placeholder="PO no., batch no., job card…"
                          value={txnForm.reference}
                          onChange={e => setTxnForm(p => ({ ...p, reference: e.target.value }))}
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs font-medium text-charcoal-600 mb-1.5">Reason</label>
                        <input
                          className="form-input text-sm"
                          placeholder="e.g. Used in Teak Sofa batch #12, Received from Rajesh Timber"
                          value={txnForm.reason}
                          onChange={e => setTxnForm(p => ({ ...p, reason: e.target.value }))}
                        />
                      </div>
                    </div>

                    {/* Live preview of what will happen */}
                    {txnForm.quantity && parseFloat(txnForm.quantity) > 0 && (
                      <div className="bg-white border border-stone-200 rounded-lg px-3 py-2 text-xs text-stone-500 flex items-center gap-2">
                        <span>Stock after movement:</span>
                        <span className="font-semibold text-charcoal-800">
                          {(() => {
                            const isOut = ['STOCK_OUT', 'DAMAGE', 'TRANSFER'].includes(txnForm.type)
                            const newQty = detailItem.quantity + (isOut ? -parseFloat(txnForm.quantity) : parseFloat(txnForm.quantity))
                            return (
                              <span className={newQty < 0 ? 'text-red-500' : ''}>
                                {fmt(newQty, 2)} {detailItem.unit}
                                {newQty < 0 && ' ⚠️ Insufficient stock'}
                              </span>
                            )
                          })()}
                        </span>
                      </div>
                    )}

                    <button type="submit" disabled={txnSaving}
                      className="w-full py-2.5 text-sm font-medium text-white rounded-xl transition-colors disabled:opacity-60"
                      style={{ background: '#a85e2e' }}>
                      {txnSaving ? 'Saving…' : 'Record Movement'}
                    </button>
                  </form>
                </div>
              )}

              {/* Transaction history */}
              <div>
                <h3 className="font-semibold text-charcoal-700 text-sm mb-3">
                  Transaction History <span className="text-stone-400 font-normal">({transactions.length})</span>
                </h3>
                {transactions.length === 0 ? (
                  <p className="text-sm text-stone-400 text-center py-8">No transactions yet.</p>
                ) : (
                  <div className="space-y-2">
                    {transactions.map(txn => {
                      const t = TXN_TYPES.find(tt => tt.key === txn.type)
                      const isOut = ['STOCK_OUT', 'DAMAGE', 'TRANSFER'].includes(txn.type)
                      return (
                        <div key={txn.id} className="flex items-start gap-3 bg-stone-50 rounded-xl p-3.5">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                            style={{ background: `${t?.color}20`, color: t?.color }}>
                            {t?.dir}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-semibold" style={{ color: t?.color }}>{t?.label}</span>
                              <span className="text-sm font-bold text-charcoal-800">
                                {isOut ? '−' : '+'}{fmt(txn.quantity, 2)} {detailItem.unit}
                              </span>
                              {txn.unitCost && <span className="text-xs text-stone-400">@ {fmtRs(txn.unitCost)}/{detailItem.unit}</span>}
                              {txn.totalCost && <span className="text-xs font-medium text-charcoal-700">= {fmtRs(txn.totalCost)}</span>}
                            </div>
                            {txn.reason && <p className="text-xs text-stone-500 mt-0.5">{txn.reason}</p>}
                            {txn.reference && <p className="text-xs text-stone-400">Ref: {txn.reference}</p>}
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-stone-300">{fmtDate(txn.createdAt)}</span>
                              {txn.createdBy && <span className="text-xs text-stone-400">by {txn.createdBy.name}</span>}
                              {txn.stockAfter != null && <span className="text-xs text-stone-300">→ stock: {fmt(txn.stockAfter, 2)}</span>}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Soft Delete Confirm Modal ── */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-7">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="#dc2626"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
            </div>
            <h3 className="font-semibold text-charcoal-800 text-center mb-1">Delete Item</h3>
            <p className="text-sm text-stone-500 text-center mb-5">
              <strong>{showDeleteConfirm.name}</strong> will be soft-deleted.
              All history is preserved for reporting.
            </p>
            <div className="mb-4">
              <label className="block text-xs font-medium text-charcoal-600 mb-1.5">Reason for deletion</label>
              <input className="form-input text-sm" placeholder="e.g. Discontinued material, Replaced by new SKU"
                value={deleteReason} onChange={e => setDeleteReason(e.target.value)} />
            </div>
            <div className="flex gap-3">
              <button onClick={handleSoftDelete}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-xl transition-colors">
                Delete
              </button>
              <button onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 py-2.5 text-stone-600 border border-stone-200 rounded-xl hover:bg-stone-50 text-sm transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
