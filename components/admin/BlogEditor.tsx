'use client'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

const CATEGORIES = ['General', 'Craft & Materials', 'Buying Guide', 'Behind the Scenes', 'Company News', 'Design Tips']

interface BlogPost {
  slug: string; title: string; excerpt: string; content: string
  coverImage?: string; category: string; tags: string
  published: boolean; readTime: number
}

interface Props {
  initialData?: BlogPost
  mode: 'create' | 'edit'
}

export default function BlogEditor({ initialData, mode }: Props) {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const [form, setForm] = useState({
    title:      initialData?.title     || '',
    excerpt:    initialData?.excerpt   || '',
    content:    initialData?.content   || '',
    coverImage: initialData?.coverImage || '',
    category:   initialData?.category  || 'General',
    tags:       initialData?.tags      || '',
    published:  initialData?.published || false,
  })
  const [preview, setPreview]   = useState(initialData?.coverImage || '')
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving]     = useState(false)
  const [activeTab, setActiveTab] = useState<'write' | 'preview'>('write')
  const [error, setError]       = useState('')

  // Auto-calculate read time
  const wordCount  = form.content.trim().split(/\s+/).filter(Boolean).length
  const readTime   = Math.max(1, Math.ceil(wordCount / 200))

  const handleUpload = async (files: FileList | null) => {
    if (!files?.length) return
    setUploading(true)
    setPreview(URL.createObjectURL(files[0]))
    const fd = new FormData(); fd.append('files', files[0])
    try {
      const res  = await fetch('/api/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) { setError(data.error); setPreview(''); return }
      setForm(p => ({ ...p, coverImage: data.urls[0] }))
      setPreview(data.urls[0])
    } catch { setError('Upload failed') }
    setUploading(false)
  }

  const handleSubmit = async (publish?: boolean) => {
    const shouldPublish = publish ?? form.published
    if (!form.title.trim() || !form.excerpt.trim() || !form.content.trim()) {
      setError('Title, excerpt, and content are required.')
      return
    }
    setSaving(true); setError('')
    try {
      const payload = { ...form, published: shouldPublish, readTime }
      const url    = mode === 'edit' ? `/api/blog/${initialData?.slug}` : '/api/blog'
      const method = mode === 'edit' ? 'PATCH' : 'POST'
      const res    = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      if (!res.ok) { setError((await res.json()).error || 'Failed to save'); return }
      router.push('/admin/blog'); router.refresh()
    } catch { setError('Something went wrong') }
    setSaving(false)
  }

  // Simple markdown-to-HTML renderer for preview
  const renderMarkdown = (text: string) => {
    return text
      .replace(/^# (.+)$/gm, '<h1 class="font-display text-3xl text-charcoal-800 mt-8 mb-4">$1</h1>')
      .replace(/^## (.+)$/gm, '<h2 class="font-display text-2xl text-charcoal-800 mt-6 mb-3">$1</h2>')
      .replace(/^### (.+)$/gm, '<h3 class="font-semibold text-xl text-charcoal-700 mt-5 mb-2">$1</h3>')
      .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-charcoal-800">$1</strong>')
      .replace(/\*(.+?)\*/g, '<em class="italic">$1</em>')
      .replace(/^- (.+)$/gm, '<li class="ml-4 text-stone-600 mb-1">• $1</li>')
      .replace(/\n\n/g, '</p><p class="text-stone-600 leading-relaxed mb-4">')
      .replace(/^(?!<[h|l])(.+)$/gm, '<p class="text-stone-600 leading-relaxed mb-4">$1</p>')
      .replace(/<p><\/p>/g, '')
  }

  return (
    <div className="max-w-5xl">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-5 py-3 text-sm mb-6">{error}</div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">

        {/* ── Main editor ── */}
        <div className="lg:col-span-2 space-y-5">

          {/* Title */}
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6">
            <input
              type="text"
              className="w-full font-display text-2xl text-charcoal-800 placeholder-stone-300 outline-none bg-transparent"
              placeholder="Post title…"
              value={form.title}
              onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
            />
          </div>

          {/* Excerpt */}
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6">
            <label className="block text-xs font-medium text-charcoal-600 mb-2 uppercase tracking-wider">
              Excerpt — shown on blog listing and in Google search
            </label>
            <textarea rows={2} className="form-input resize-none text-sm"
              placeholder="A short summary of this post (1-2 sentences)…"
              value={form.excerpt}
              onChange={e => setForm(p => ({ ...p, excerpt: e.target.value }))} />
          </div>

          {/* Content editor with preview toggle */}
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
            {/* Tab bar */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-stone-100 bg-stone-50">
              <div className="flex gap-1">
                {(['write', 'preview'] as const).map(tab => (
                  <button key={tab} onClick={() => setActiveTab(tab)}
                    className={`px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition-all ${
                      activeTab === tab ? 'bg-white shadow-sm text-charcoal-800' : 'text-stone-400 hover:text-charcoal-600'
                    }`}>
                    {tab === 'write' ? '✏️ Write' : '👁 Preview'}
                  </button>
                ))}
              </div>
              <div className="text-xs text-stone-400">
                {wordCount} words · {readTime} min read · Markdown supported
              </div>
            </div>

            {activeTab === 'write' ? (
              <textarea
                className="w-full p-6 text-sm text-charcoal-700 leading-relaxed outline-none resize-none font-mono"
                style={{ minHeight: '420px', background: 'transparent' }}
                placeholder={`Start writing…\n\nUse Markdown:\n# Heading 1\n## Heading 2\n**bold** *italic*\n- bullet point`}
                value={form.content}
                onChange={e => setForm(p => ({ ...p, content: e.target.value }))}
              />
            ) : (
              <div className="p-6 prose max-w-none" style={{ minHeight: '420px' }}
                dangerouslySetInnerHTML={{ __html: renderMarkdown(form.content) || '<p class="text-stone-300 italic">Nothing to preview yet…</p>' }}
              />
            )}
          </div>
        </div>

        {/* ── Sidebar: settings ── */}
        <div className="space-y-5">

          {/* Publish controls */}
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
            <h3 className="font-semibold text-charcoal-700 mb-4 text-sm">Publish</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-stone-500">Status</span>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                  form.published ? 'bg-green-100 text-green-700' : 'bg-stone-100 text-stone-500'
                }`}>
                  {form.published ? 'Published' : 'Draft'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-stone-500">Read time</span>
                <span className="text-sm font-medium text-charcoal-700">{readTime} min</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-stone-500">Word count</span>
                <span className="text-sm font-medium text-charcoal-700">{wordCount}</span>
              </div>
            </div>
            <div className="flex flex-col gap-2 mt-5">
              <button onClick={() => handleSubmit(true)} disabled={saving}
                className="w-full py-2.5 text-sm font-semibold text-white rounded-xl transition-colors disabled:opacity-60"
                style={{ background: 'var(--accent)' }}>
                {saving ? 'Saving…' : form.published ? 'Update Post' : '🚀 Publish Now'}
              </button>
              <button onClick={() => handleSubmit(false)} disabled={saving}
                className="w-full py-2.5 text-sm font-medium text-stone-600 border border-stone-200 rounded-xl hover:bg-stone-50 transition-colors disabled:opacity-60">
                {form.published ? 'Unpublish (Save as Draft)' : 'Save as Draft'}
              </button>
              <button onClick={() => router.back()}
                className="w-full py-2 text-xs text-stone-400 hover:text-stone-600 transition-colors">
                Cancel
              </button>
            </div>
          </div>

          {/* Cover image */}
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
            <h3 className="font-semibold text-charcoal-700 mb-3 text-sm">Cover Image</h3>
            <div
              className={`relative border-2 border-dashed rounded-xl cursor-pointer transition-all ${
                preview ? 'border-stone-200 p-1' : 'border-stone-200 hover:border-wood-300 p-6 text-center'
              }`}
              onClick={() => !uploading && fileRef.current?.click()}
            >
              <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp"
                className="hidden" onChange={e => handleUpload(e.target.files)} />
              {preview ? (
                <div className="relative aspect-video rounded-lg overflow-hidden">
                  <Image src={preview} alt="Cover" fill className="object-cover" />
                  {uploading && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <span className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
                    </div>
                  )}
                  <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                    Click to change
                  </div>
                </div>
              ) : (
                <>
                  <div className="text-2xl mb-2">🖼️</div>
                  <p className="text-sm text-stone-500">Click to upload</p>
                  <p className="text-xs text-stone-400 mt-0.5">JPG, PNG, WEBP · Max 5MB</p>
                </>
              )}
            </div>
          </div>

          {/* Category & Tags */}
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5 space-y-4">
            <h3 className="font-semibold text-charcoal-700 text-sm">Organisation</h3>
            <div>
              <label className="block text-xs font-medium text-charcoal-600 mb-1.5">Category</label>
              <select className="form-input text-sm" value={form.category}
                onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-charcoal-600 mb-1.5">
                Tags <span className="text-stone-400 font-normal">(comma separated)</span>
              </label>
              <input type="text" className="form-input text-sm" placeholder="teak, sourcing, craftsmanship"
                value={form.tags} onChange={e => setForm(p => ({ ...p, tags: e.target.value }))} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
