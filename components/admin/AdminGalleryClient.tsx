'use client'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

interface GalleryItem {
  id: string
  title: string
  description?: string
  imageUrl: string
  category: string
  featured: boolean
  order: number
}

const PRESET_CATEGORIES = [
  'Living Room', 'Bedroom', 'Dining', 'Office',
  'Hotel Project', 'Outdoor', 'Custom', 'General',
]

const emptyForm = {
  title: '', description: '',
  category: 'General', featured: false,
}

export default function AdminGalleryClient({ initialItems }: { initialItems: GalleryItem[] }) {
  const [items, setItems]           = useState(initialItems)
  const [form, setForm]             = useState(emptyForm)
  const [uploadedUrl, setUploadedUrl] = useState('')   // ← stored separately, not in form
  const [editId, setEditId]         = useState<string | null>(null)
  const [uploading, setUploading]   = useState(false)
  const [preview, setPreview]       = useState('')
  const [saving, setSaving]         = useState(false)
  const [error, setError]           = useState('')
  const [dragOver, setDragOver]     = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const router  = useRouter()

  const reset = () => {
    setForm(emptyForm)
    setUploadedUrl('')
    setEditId(null)
    setPreview('')
    setError('')
  }

  const startEdit = (item: GalleryItem) => {
    setEditId(item.id)
    setForm({
      title:       item.title,
      description: item.description || '',
      category:    item.category,
      featured:    item.featured,
    })
    setUploadedUrl(item.imageUrl)
    setPreview(item.imageUrl)
  }

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    const file = files[0]

    // Validate type + size on client before uploading
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!validTypes.includes(file.type)) {
      setError('Only JPG, PNG or WEBP images are allowed.')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('File must be under 5MB.')
      return
    }

    setUploading(true)
    setError('')
    // Show local preview immediately while uploading
    setPreview(URL.createObjectURL(file))

    const fd = new FormData()
    fd.append('files', file)
    try {
      const res  = await fetch('/api/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Upload failed')
        setPreview('')
        setUploadedUrl('')
        return
      }
      // Replace blob URL with the real saved path (e.g. /uploads/filename.jpg)
      setUploadedUrl(data.urls[0])
      setPreview(data.urls[0])
    } catch {
      setError('Upload failed. Please try again.')
      setPreview('')
      setUploadedUrl('')
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!uploadedUrl) { setError('Please upload an image first.'); return }
    if (uploading)    { setError('Please wait for the upload to finish.'); return }

    setSaving(true)
    setError('')
    try {
      const url    = editId ? `/api/gallery/${editId}` : '/api/gallery'
      const method = editId ? 'PATCH' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, imageUrl: uploadedUrl }),
      })
      if (!res.ok) {
        const d = await res.json()
        setError(d.error || 'Failed to save')
        return
      }
      const refreshed = await fetch('/api/gallery').then(r => r.json())
      setItems(refreshed)
      reset()
      router.refresh()
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this gallery item?')) return
    await fetch(`/api/gallery/${id}`, { method: 'DELETE' })
    setItems(p => p.filter(i => i.id !== id))
    router.refresh()
  }

  const toggleFeatured = async (item: GalleryItem) => {
    await fetch(`/api/gallery/${item.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ featured: !item.featured }),
    })
    setItems(p => p.map(i => i.id === item.id ? { ...i, featured: !i.featured } : i))
  }

  return (
    <div className="grid lg:grid-cols-5 gap-8">

      {/* ── LEFT: Form ── */}
      <div className="lg:col-span-2">
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-7 sticky top-8">
          <h2 className="font-semibold text-charcoal-700 mb-5">
            {editId ? 'Edit Gallery Item' : 'Add New Item'}
          </h2>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm mb-5">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* ── Image Upload Zone ── */}
            <div>
              <label className="block text-xs font-medium text-charcoal-600 mb-1.5">
                Image *
                <span className="ml-2 font-normal text-stone-400">JPG, PNG or WEBP · Max 5MB</span>
              </label>

              <div
                className={`relative border-2 border-dashed rounded-xl transition-all cursor-pointer ${
                  dragOver
                    ? 'border-wood-500 bg-wood-50'
                    : preview
                      ? 'border-stone-200'
                      : 'border-stone-200 hover:border-wood-300 hover:bg-stone-50'
                } ${preview ? 'p-2' : 'p-8 text-center'}`}
                onClick={() => !uploading && fileRef.current?.click()}
                onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={e => {
                  e.preventDefault()
                  setDragOver(false)
                  handleFileUpload(e.dataTransfer.files)
                }}
              >
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  className="hidden"
                  onChange={e => handleFileUpload(e.target.files)}
                />

                {preview ? (
                  /* Preview with overlay controls */
                  <div className="relative aspect-video rounded-lg overflow-hidden group">
                    <Image src={preview} alt="Preview" fill className="object-cover"/>

                    {/* Uploading spinner */}
                    {uploading && (
                      <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-2">
                        <span className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
                        <span className="text-white text-xs">Uploading...</span>
                      </div>
                    )}

                    {/* Hover: change image */}
                    {!uploading && (
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="bg-white text-charcoal-700 text-xs font-medium px-3 py-1.5 rounded-lg">
                          Click to replace
                        </span>
                      </div>
                    )}

                    {/* Success indicator */}
                    {!uploading && uploadedUrl && (
                      <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-1">
                        <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/>
                        </svg>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Empty drop zone */
                  <>
                    <div className="w-12 h-12 bg-stone-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor"
                        className="text-stone-400">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                      </svg>
                    </div>
                    <p className="text-sm font-medium text-charcoal-600 mb-0.5">
                      Drop image here or click to browse
                    </p>
                    <p className="text-xs text-stone-400">
                      Saved to <code className="bg-stone-100 px-1 rounded">public/uploads/</code>
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-xs font-medium text-charcoal-600 mb-1.5">Title *</label>
              <input type="text" required className="form-input"
                placeholder="e.g. Heritage Hotel Lobby"
                value={form.title}
                onChange={e => setForm(p => ({ ...p, title: e.target.value }))}/>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-medium text-charcoal-600 mb-1.5">
                Description
                <span className="ml-1 font-normal text-stone-400">(optional)</span>
              </label>
              <textarea rows={2} className="form-input resize-none text-sm"
                placeholder="Brief description of the project..."
                value={form.description}
                onChange={e => setForm(p => ({ ...p, description: e.target.value }))}/>
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-medium text-charcoal-600 mb-1.5">Category</label>
              <select className="form-input"
                value={form.category}
                onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
                {PRESET_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* Featured */}
            <label className="flex items-center gap-2.5 cursor-pointer py-1">
              <input type="checkbox"
                className="w-4 h-4 rounded border-stone-300 accent-wood-600"
                checked={form.featured}
                onChange={e => setForm(p => ({ ...p, featured: e.target.checked }))}/>
              <span className="text-sm text-charcoal-700">Show as Featured</span>
            </label>

            {/* Submit / Cancel */}
            <div className="flex gap-3 pt-1">
              <button type="submit"
                disabled={saving || uploading || !uploadedUrl}
                className="flex-1 py-2.5 bg-charcoal-800 hover:bg-charcoal-900 text-white text-sm font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                {saving
                  ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>Saving...</>
                  : editId ? 'Update Item' : 'Add to Gallery'
                }
              </button>
              {editId && (
                <button type="button" onClick={reset}
                  className="px-4 py-2.5 text-stone-500 hover:text-charcoal-700 text-sm transition-colors border border-stone-200 rounded-xl">
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* ── RIGHT: Gallery Grid ── */}
      <div className="lg:col-span-3">
        {items.length === 0 ? (
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm py-20 text-center">
            <div className="text-5xl mb-3">🖼️</div>
            <p className="font-medium text-charcoal-600">No gallery items yet</p>
            <p className="text-sm text-stone-400 mt-1">Upload your first project photo using the form.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {items.map(item => (
              <div key={item.id}
                className="group bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden card-hover">

                {/* Image */}
                <div className="relative aspect-video img-zoom">
                  <Image src={item.imageUrl} alt={item.title} fill className="object-cover"/>
                  <div className="absolute top-2 left-2 flex gap-1.5 flex-wrap">
                    {item.featured && (
                      <span className="text-xs bg-wood-600 text-white px-2 py-0.5 rounded-full font-medium">
                        Featured
                      </span>
                    )}
                    <span className="text-xs bg-black/50 text-white px-2 py-0.5 rounded-full backdrop-blur-sm">
                      {item.category}
                    </span>
                  </div>
                </div>

                {/* Info + Controls */}
                <div className="p-4">
                  <h3 className="font-semibold text-sm text-charcoal-700 truncate">{item.title}</h3>
                  {item.description && (
                    <p className="text-xs text-stone-400 mt-0.5 line-clamp-1">{item.description}</p>
                  )}
                  {/* File path hint */}
                  <p className="text-xs text-stone-300 mt-1 truncate font-mono">
                    {item.imageUrl}
                  </p>

                  <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-stone-50">
                    {/* Toggle featured */}
                    <button onClick={() => toggleFeatured(item)}
                      className={`p-1.5 rounded-lg transition-all ${
                        item.featured
                          ? 'bg-wood-100 text-wood-600'
                          : 'text-stone-400 hover:bg-stone-100 hover:text-stone-600'
                      }`}
                      title={item.featured ? 'Remove from featured' : 'Mark as featured'}>
                      <svg width="14" height="14" fill={item.featured ? 'currentColor' : 'none'}
                        viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
                      </svg>
                    </button>

                    {/* Edit */}
                    <button onClick={() => startEdit(item)}
                      className="p-1.5 text-stone-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                      title="Edit">
                      <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                      </svg>
                    </button>

                    {/* Delete */}
                    <button onClick={() => handleDelete(item.id)}
                      className="p-1.5 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all ml-auto"
                      title="Delete">
                      <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}