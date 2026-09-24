'use client'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

interface Category { id: string; name: string }

interface ProductImage {
  url: string
  altText: string
  uploading?: boolean
  preview?: string
}

interface Props {
  categories: Category[]
  initialData?: {
    id?: string
    name?: string
    description?: string
    categoryId?: string
    dimensions?: string
    material?: string
    price?: string
    moq?: string
    featured?: boolean
    inStock?: boolean
    images?: { url: string; altText: string }[]
  }
  mode: 'create' | 'edit'
}

export default function ProductForm({ categories, initialData, mode }: Props) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    categoryId: initialData?.categoryId || (categories[0]?.id || ''),
    dimensions: initialData?.dimensions || '',
    material: initialData?.material || '',
    price: initialData?.price || '',
    moq: initialData?.moq || '',
    featured: initialData?.featured || false,
    inStock: initialData?.inStock !== undefined ? initialData.inStock : true,
  })

  const [images, setImages] = useState<ProductImage[]>(
    initialData?.images?.map(img => ({ url: img.url, altText: img.altText })) ||
    []
  )

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [dragOver, setDragOver] = useState(false)

  const setField = (k: keyof typeof form, v: any) =>
    setForm(p => ({ ...p, [k]: v }))

  // Handle file selection (both drag-drop and click)
  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return

    const newImages: ProductImage[] = Array.from(files).map(file => ({
      url: '',
      altText: form.name || file.name,
      uploading: true,
      preview: URL.createObjectURL(file),
    }))

    setImages(prev => [...prev, ...newImages])
    const startIndex = images.length

    // Upload each file
    const formData = new FormData()
    Array.from(files).forEach(file => formData.append('files', file))

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Upload failed')
        setImages(prev => prev.filter((_, i) => i < startIndex))
        return
      }

      // Replace uploading placeholders with real URLs
      setImages(prev => {
        const updated = [...prev]
        data.urls.forEach((url: string, i: number) => {
          if (updated[startIndex + i]) {
            updated[startIndex + i] = {
              url,
              altText: updated[startIndex + i].altText,
              uploading: false,
              preview: undefined,
            }
          }
        })
        return updated
      })
    } catch (err) {
      setError('Upload failed. Please try again.')
      setImages(prev => prev.filter((_, i) => i < startIndex))
    }
  }

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index))
  }

  const updateAltText = (index: number, altText: string) => {
    setImages(prev => {
      const updated = [...prev]
      updated[index] = { ...updated[index], altText }
      return updated
    })
  }

  const moveImage = (index: number, direction: 'up' | 'down') => {
    setImages(prev => {
      const updated = [...prev]
      const target = direction === 'up' ? index - 1 : index + 1
      if (target < 0 || target >= updated.length) return prev
      ;[updated[index], updated[target]] = [updated[target], updated[index]]
      return updated
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (images.some(img => img.uploading)) {
      setError('Please wait for all images to finish uploading.')
      return
    }

    if (images.length === 0) {
      setError('Please add at least one product image.')
      return
    }

    setSaving(true)
    setError('')

    try {
      const payload = {
        ...form,
        price: form.price ? parseFloat(form.price) : null,
        moq: form.moq ? parseInt(form.moq) : null,
        images: images.filter(img => img.url).map(img => ({
          url: img.url,
          altText: img.altText,
        })),
      }

      const url = mode === 'create'
        ? '/api/products'
        : `/api/products/${initialData?.id}`
      const method = mode === 'create' ? 'POST' : 'PATCH'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Failed to save product')
      } else {
        router.push('/admin/products')
        router.refresh()
      }
    } catch {
      setError('Something went wrong')
    }
    setSaving(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-7">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-5 py-3 text-sm">
          {error}
        </div>
      )}

      {/* Basic Info */}
      <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-7">
        <h2 className="font-semibold text-charcoal-700 mb-5">Basic Information</h2>
        <div className="space-y-5">
          <div>
            <label className="block text-xs font-medium text-charcoal-600 mb-1.5">
              Product Name *
            </label>
            <input
              type="text" required className="form-input"
              placeholder="e.g. Artisan Oak Sofa"
              value={form.name}
              onChange={e => setField('name', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-charcoal-600 mb-1.5">
              Description *
            </label>
            <textarea
              required rows={4} className="form-input resize-none"
              placeholder="Describe the product..."
              value={form.description}
              onChange={e => setField('description', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-charcoal-600 mb-1.5">
              Category *
            </label>
            <select
              required className="form-input"
              value={form.categoryId}
              onChange={e => setField('categoryId', e.target.value)}
            >
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Specifications */}
      <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-7">
        <h2 className="font-semibold text-charcoal-700 mb-5">Specifications</h2>
        <div className="grid sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-medium text-charcoal-600 mb-1.5">Dimensions</label>
            <input type="text" className="form-input" placeholder="W120 x D60 x H76 cm"
              value={form.dimensions} onChange={e => setField('dimensions', e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-medium text-charcoal-600 mb-1.5">Material</label>
            <input type="text" className="form-input" placeholder="Solid Teak Wood"
              value={form.material} onChange={e => setField('material', e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-medium text-charcoal-600 mb-1.5">Price (₹)</label>
            <input type="number" className="form-input" placeholder="45000"
              value={form.price} onChange={e => setField('price', e.target.value)} />
            <p className="text-xs text-stone-400 mt-1">Leave blank to show "Price on request"</p>
          </div>
          <div>
            <label className="block text-xs font-medium text-charcoal-600 mb-1.5">
              Minimum Order Qty (B2B)
            </label>
            <input type="number" className="form-input" placeholder="10"
              value={form.moq} onChange={e => setField('moq', e.target.value)} />
          </div>
        </div>
        <div className="flex gap-6 mt-5">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox"
              className="w-4 h-4 rounded border-stone-300 text-wood-600 focus:ring-wood-500"
              checked={form.featured}
              onChange={e => setField('featured', e.target.checked)} />
            <span className="text-sm text-charcoal-700">Featured Product</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox"
              className="w-4 h-4 rounded border-stone-300 text-wood-600 focus:ring-wood-500"
              checked={form.inStock}
              onChange={e => setField('inStock', e.target.checked)} />
            <span className="text-sm text-charcoal-700">In Stock</span>
          </label>
        </div>
      </div>

      {/* Image Upload */}
      <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-7">
        <h2 className="font-semibold text-charcoal-700 mb-2">Product Images</h2>
        <p className="text-xs text-stone-400 mb-5">
          JPG, PNG or WEBP · Max 5MB per image · First image is used as thumbnail
        </p>

        {/* Drop Zone */}
        <div
          className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer mb-5 ${
            dragOver
              ? 'border-wood-500 bg-wood-50'
              : 'border-stone-200 hover:border-wood-300 hover:bg-stone-50'
          }`}
          onClick={() => fileInputRef.current?.click()}
          onDragOver={e => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={e => {
            e.preventDefault()
            setDragOver(false)
            handleFiles(e.dataTransfer.files)
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            multiple
            className="hidden"
            onChange={e => handleFiles(e.target.files)}
          />
          <div className="w-12 h-12 bg-stone-100 rounded-xl flex items-center justify-center mx-auto mb-3">
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor"
              className="text-stone-400">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
          </div>
          <p className="text-sm font-medium text-charcoal-600 mb-1">
            Drop images here or click to browse
          </p>
          <p className="text-xs text-stone-400">You can select multiple images at once</p>
        </div>

        {/* Image Previews */}
        {images.length > 0 && (
          <div className="space-y-3">
            {images.map((img, i) => (
              <div key={i}
                className="flex items-center gap-3 p-3 bg-stone-50 rounded-xl border border-stone-100">

                {/* Thumbnail */}
                <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-stone-200 shrink-0">
                  {img.uploading ? (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="w-5 h-5 border-2 border-stone-300 border-t-wood-500 rounded-full animate-spin" />
                    </div>
                  ) : (
                    <Image
                      src={img.preview || img.url}
                      alt={img.altText}
                      fill
                      className="object-cover"
                    />
                  )}
                  {/* Primary badge */}
                  {i === 0 && !img.uploading && (
                    <div className="absolute bottom-0 left-0 right-0 bg-wood-600/80 text-white text-[9px] text-center py-0.5 font-medium">
                      PRIMARY
                    </div>
                  )}
                </div>

                {/* Alt text */}
                <div className="flex-1 min-w-0">
                  {img.uploading ? (
                    <p className="text-sm text-stone-400">Uploading...</p>
                  ) : (
                    <input
                      type="text"
                      className="form-input text-sm py-2"
                      placeholder="Image description (alt text)"
                      value={img.altText}
                      onChange={e => updateAltText(i, e.target.value)}
                    />
                  )}
                </div>

                {/* Controls */}
                {!img.uploading && (
                  <div className="flex items-center gap-1 shrink-0">
                    <button type="button" onClick={() => moveImage(i, 'up')}
                      disabled={i === 0}
                      className="p-1.5 text-stone-400 hover:text-charcoal-700 disabled:opacity-20 rounded-lg hover:bg-stone-200 transition-all"
                      title="Move up">
                      <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7"/>
                      </svg>
                    </button>
                    <button type="button" onClick={() => moveImage(i, 'down')}
                      disabled={i === images.length - 1}
                      className="p-1.5 text-stone-400 hover:text-charcoal-700 disabled:opacity-20 rounded-lg hover:bg-stone-200 transition-all"
                      title="Move down">
                      <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
                      </svg>
                    </button>
                    <button type="button" onClick={() => removeImage(i)}
                      className="p-1.5 text-stone-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-all"
                      title="Remove">
                      <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4 justify-end pb-8">
        <button type="button" onClick={() => router.back()}
          className="px-6 py-2.5 text-stone-600 hover:text-charcoal-800 text-sm font-medium transition-colors">
          Cancel
        </button>
        <button type="submit" disabled={saving || images.some(i => i.uploading)}
          className="px-7 py-2.5 bg-charcoal-800 hover:bg-charcoal-900 text-white text-sm font-medium rounded-xl transition-colors flex items-center gap-2 disabled:opacity-60">
          {saving ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
              {mode === 'create' ? 'Creating...' : 'Saving...'}
            </>
          ) : (
            mode === 'create' ? 'Create Product' : 'Save Changes'
          )}
        </button>
      </div>
    </form>
  )
}