'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Category {
  id: string; name: string; slug: string; description?: string; imageUrl?: string
  _count: { products: number }
}

export default function CategoryManager({ initialCategories }: { initialCategories: Category[] }) {
  const [categories, setCategories] = useState(initialCategories)
  const [form, setForm] = useState({ name: '', description: '', imageUrl: '' })
  const [editId, setEditId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const reset = () => { setForm({ name: '', description: '', imageUrl: '' }); setEditId(null); setError('') }

  const startEdit = (cat: Category) => {
    setEditId(cat.id)
    setForm({ name: cat.name, description: cat.description || '', imageUrl: cat.imageUrl || '' })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const url = editId ? `/api/categories/${editId}` : '/api/categories'
      const method = editId ? 'PATCH' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const d = await res.json()
        setError(d.error || 'Failed')
      } else {
        router.refresh()
        const updated = await fetch('/api/categories').then(r => r.json())
        setCategories(updated)
        reset()
      }
    } catch { setError('Something went wrong') }
    setSaving(false)
  }

  const handleDelete = async (id: string, productCount: number) => {
    if (productCount > 0) {
      alert(`Cannot delete: this category has ${productCount} products. Move or delete them first.`)
      return
    }
    if (!confirm('Delete this category?')) return
    await fetch(`/api/categories/${id}`, { method: 'DELETE' })
    const updated = await fetch('/api/categories').then(r => r.json())
    setCategories(updated)
    router.refresh()
  }

  return (
    <div className="space-y-6">
      {/* Form */}
      <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-7">
        <h2 className="font-semibold text-charcoal-700 mb-5">{editId ? 'Edit Category' : 'Add New Category'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">{error}</div>}
          <div>
            <label className="block text-xs font-medium text-charcoal-600 mb-1.5">Name *</label>
            <input type="text" required className="form-input" placeholder="e.g. Living Room"
              value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
          </div>
          <div>
            <label className="block text-xs font-medium text-charcoal-600 mb-1.5">Description</label>
            <input type="text" className="form-input" placeholder="Brief description"
              value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
          </div>
          <div>
            <label className="block text-xs font-medium text-charcoal-600 mb-1.5">Image URL</label>
            <input type="url" className="form-input" placeholder="https://..."
              value={form.imageUrl} onChange={e => setForm(p => ({ ...p, imageUrl: e.target.value }))} />
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={saving}
              className="px-6 py-2.5 bg-charcoal-800 hover:bg-charcoal-900 text-white text-sm font-medium rounded-xl transition-colors disabled:opacity-60">
              {saving ? 'Saving...' : editId ? 'Update' : 'Create Category'}
            </button>
            {editId && (
              <button type="button" onClick={reset}
                className="px-6 py-2.5 text-stone-600 hover:text-charcoal-800 text-sm font-medium transition-colors">
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* List */}
      <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-stone-100">
          <h2 className="font-semibold text-charcoal-700">All Categories</h2>
        </div>
        {categories.length === 0 ? (
          <div className="py-10 text-center text-stone-400 text-sm">No categories yet</div>
        ) : (
          <div className="divide-y divide-stone-50">
            {categories.map(cat => (
              <div key={cat.id} className="flex items-center gap-4 px-6 py-4 hover:bg-stone-50 transition-colors">
                {cat.imageUrl && (
                  <img src={cat.imageUrl} alt={cat.name} className="w-12 h-12 rounded-lg object-cover" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-charcoal-700">{cat.name}</div>
                  {cat.description && <div className="text-xs text-stone-400 mt-0.5 truncate">{cat.description}</div>}
                  <div className="text-xs text-stone-300 mt-0.5">/{cat.slug} · {cat._count.products} products</div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => startEdit(cat)}
                    className="p-1.5 text-stone-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                    <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                  </button>
                  <button onClick={() => handleDelete(cat.id, cat._count.products)}
                    className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
                    <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
