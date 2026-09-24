'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Testimonial {
  id: string; name: string; role: string; location: string
  quote: string; rating: number; featured: boolean; order: number
}
const empty = { name: '', role: '', location: '', quote: '', rating: 5, featured: true }

export default function TestimonialsManager({ initialItems }: { initialItems: Testimonial[] }) {
  const [items, setItems]   = useState(initialItems)
  const [form, setForm]     = useState(empty)
  const [editId, setEditId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState('')
  const router = useRouter()

  const reset   = () => { setForm(empty); setEditId(null); setError('') }
  const refresh = async () => setItems(await fetch('/api/testimonials').then(r => r.json()))
  const startEdit = (t: Testimonial) => { setEditId(t.id); setForm({ name: t.name, role: t.role, location: t.location, quote: t.quote, rating: t.rating, featured: t.featured }) }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setError('')
    try {
      const res = await fetch(editId ? `/api/testimonials/${editId}` : '/api/testimonials', {
        method: editId ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) { setError((await res.json()).error || 'Failed'); return }
      await refresh(); reset(); router.refresh()
    } catch { setError('Something went wrong') }
    setSaving(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this testimonial?')) return
    await fetch(`/api/testimonials/${id}`, { method: 'DELETE' })
    await refresh(); router.refresh()
  }

  const toggleFeatured = async (t: Testimonial) => {
    await fetch(`/api/testimonials/${t.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ featured: !t.featured }) })
    setItems(p => p.map(i => i.id === t.id ? { ...i, featured: !i.featured } : i))
  }

  return (
    <div className="grid lg:grid-cols-5 gap-8">
      {/* Form */}
      <div className="lg:col-span-2">
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-7 sticky top-8">
          <h2 className="font-semibold text-charcoal-700 mb-5">{editId ? 'Edit Testimonial' : 'Add Testimonial'}</h2>
          {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm mb-4">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-charcoal-600 mb-1.5">Customer Name *</label>
              <input type="text" required className="form-input" placeholder="Rajesh Patel"
                value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
            </div>
            <div>
              <label className="block text-xs font-medium text-charcoal-600 mb-1.5">Role / Company *</label>
              <input type="text" required className="form-input" placeholder="GM, Heritage Grand Hotel"
                value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))} />
            </div>
            <div>
              <label className="block text-xs font-medium text-charcoal-600 mb-1.5">Location</label>
              <input type="text" className="form-input" placeholder="Ahmedabad"
                value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} />
            </div>
            <div>
              <label className="block text-xs font-medium text-charcoal-600 mb-1.5">Testimonial *</label>
              <textarea required rows={4} className="form-input resize-none" placeholder="Write the customer quote..."
                value={form.quote} onChange={e => setForm(p => ({ ...p, quote: e.target.value }))} />
            </div>
            <div>
              <label className="block text-xs font-medium text-charcoal-600 mb-2">Rating</label>
              <div className="flex gap-1.5 items-center">
                {[1,2,3,4,5].map(star => (
                  <button key={star} type="button" onClick={() => setForm(p => ({ ...p, rating: star }))}
                    className="transition-transform hover:scale-110">
                    <svg width="22" height="22" viewBox="0 0 16 16" fill={star <= form.rating ? '#c4783a' : '#e7e5e4'}>
                      <path d="M8 1l1.8 3.6L14 5.3l-3 2.9.7 4.1L8 10.4l-3.7 1.9.7-4.1-3-2.9 4.2-.7z"/>
                    </svg>
                  </button>
                ))}
                <span className="text-xs text-stone-400 ml-1">{form.rating}/5</span>
              </div>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 rounded border-stone-300" style={{ accentColor: '#a85e2e' }}
                checked={form.featured} onChange={e => setForm(p => ({ ...p, featured: e.target.checked }))} />
              <span className="text-sm text-charcoal-700">Show on homepage</span>
            </label>
            <div className="flex gap-3 pt-1">
              <button type="submit" disabled={saving}
                className="flex-1 py-2.5 bg-charcoal-800 hover:bg-charcoal-900 text-white text-sm font-medium rounded-xl transition-colors disabled:opacity-60">
                {saving ? 'Saving…' : editId ? 'Update' : 'Add Testimonial'}
              </button>
              {editId && (
                <button type="button" onClick={reset}
                  className="px-4 py-2.5 text-stone-500 hover:text-charcoal-700 text-sm border border-stone-200 rounded-xl transition-colors">
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* List */}
      <div className="lg:col-span-3 space-y-4">
        {items.length === 0 ? (
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm py-16 text-center">
            <div className="text-4xl mb-3">⭐</div>
            <p className="font-medium text-charcoal-600">No testimonials yet</p>
            <p className="text-sm text-stone-400 mt-1">Add your first customer review using the form.</p>
          </div>
        ) : items.map(t => (
          <div key={t.id} className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex gap-0.5 mb-3">
                  {Array(t.rating).fill(0).map((_,i) => (
                    <svg key={i} width="13" height="13" viewBox="0 0 16 16" fill="#c4783a">
                      <path d="M8 1l1.8 3.6L14 5.3l-3 2.9.7 4.1L8 10.4l-3.7 1.9.7-4.1-3-2.9 4.2-.7z"/>
                    </svg>
                  ))}
                </div>
                <p className="text-sm text-stone-600 italic leading-relaxed mb-4">&ldquo;{t.quote}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm shrink-0"
                    style={{ background: 'var(--accent-soft)', color: 'var(--accent-text)' }}>
                    {t.name[0]}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-sm text-charcoal-700">{t.name}</div>
                    <div className="text-xs text-stone-400">{t.role}{t.location ? ` · ${t.location}` : ''}</div>
                  </div>
                  {t.featured && (
                    <span className="text-xs bg-wood-50 text-wood-600 border border-wood-200 px-2.5 py-1 rounded-full font-medium shrink-0">
                      On homepage
                    </span>
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-1 shrink-0">
                <button onClick={() => toggleFeatured(t)} title={t.featured ? 'Remove from homepage' : 'Add to homepage'}
                  className={`p-1.5 rounded-lg transition-all ${t.featured ? 'bg-wood-100 text-wood-600' : 'text-stone-400 hover:bg-stone-100'}`}>
                  <svg width="15" height="15" fill={t.featured ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
                  </svg>
                </button>
                <button onClick={() => startEdit(t)} className="p-1.5 text-stone-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                  <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                </button>
                <button onClick={() => handleDelete(t.id)} className="p-1.5 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                  <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
