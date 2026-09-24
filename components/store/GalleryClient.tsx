'use client'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import type { Metadata } from 'next'

interface GalleryItem {
  id: string
  title: string
  description?: string
  imageUrl: string
  category: string
  featured: boolean
}

export default function GalleryPage() {
  const [items, setItems]           = useState<GalleryItem[]>([])
  const [loading, setLoading]       = useState(true)
  const [activeCategory, setActive] = useState('All')
  const [lightbox, setLightbox]     = useState<GalleryItem | null>(null)
  const [lightboxIdx, setLbIdx]     = useState(0)

  const categories = ['All', ...Array.from(new Set(items.map(i => i.category)))]
  const filtered = activeCategory === 'All'
    ? items
    : items.filter(i => i.category === activeCategory)

  useEffect(() => {
    fetch('/api/gallery')
      .then(r => r.json())
      .then(data => { setItems(data); setLoading(false) })
  }, [])

  // Close lightbox on Escape, navigate with arrow keys
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!lightbox) return
      if (e.key === 'Escape')      closeLightbox()
      if (e.key === 'ArrowRight')  navigateLb(1)
      if (e.key === 'ArrowLeft')   navigateLb(-1)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [lightbox, lightboxIdx, filtered])

  function openLightbox(item: GalleryItem) {
    const idx = filtered.findIndex(i => i.id === item.id)
    setLightbox(item)
    setLbIdx(idx)
    document.body.style.overflow = 'hidden'
  }

  function closeLightbox() {
    setLightbox(null)
    document.body.style.overflow = ''
  }

  function navigateLb(dir: 1 | -1) {
    const next = (lightboxIdx + dir + filtered.length) % filtered.length
    setLightbox(filtered[next])
    setLbIdx(next)
  }

  return (
    <div className="pt-20 min-h-screen" style={{ background: 'var(--bg-base)' }}>

      {/* Header */}
      <div className="py-16 sm:py-20" style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs tracking-[0.3em] uppercase font-medium mb-3" style={{ color: 'var(--accent-text)' }}>
            Our Work
          </p>
          <h1 className="font-display text-4xl sm:text-5xl mb-4" style={{ color: 'var(--text-primary)' }}>
            Project Gallery
          </h1>
          <p className="text-lg max-w-xl mx-auto" style={{ color: 'var(--text-muted)' }}>
            A showcase of our finest craftsmanship — from single statement pieces to complete commercial fit-outs.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* Category Filter */}
        {categories.length > 1 && (
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActive(cat)}
                className="px-5 py-2 rounded-full text-sm font-medium transition-all border"
                style={activeCategory === cat
                  ? { background: 'var(--accent)', color: '#fff', borderColor: 'var(--accent)' }
                  : { background: 'var(--bg-surface)', color: 'var(--text-secondary)', borderColor: 'var(--border-base)' }
                }
              >{cat}</button>
            ))}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array(8).fill(0).map((_, i) => (
              <div key={i} className="aspect-square rounded-xl animate-pulse"
                style={{ background: 'var(--bg-muted)' }} />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && filtered.length === 0 && (
          <div className="text-center py-24">
            <div className="text-6xl mb-4">🖼️</div>
            <h3 className="font-display text-2xl mb-2" style={{ color: 'var(--text-primary)' }}>
              No gallery items yet
            </h3>
            <p style={{ color: 'var(--text-muted)' }}>Check back soon to see our work.</p>
          </div>
        )}

        {/* Masonry-style grid */}
        {!loading && filtered.length > 0 && (
          <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
            {filtered.map((item, i) => (
              <div
                key={item.id}
                className="break-inside-avoid group cursor-pointer rounded-xl overflow-hidden relative img-zoom card-hover"
                style={{ border: '1px solid var(--border-subtle)' }}
                onClick={() => openLightbox(item)}
              >
                {/* Featured badge */}
                {item.featured && (
                  <div className="absolute top-3 left-3 z-10 text-xs font-semibold px-2.5 py-1 rounded-full"
                    style={{ background: 'var(--accent)', color: '#fff' }}>
                    Featured
                  </div>
                )}

                {/* Category badge */}
                <div className="absolute top-3 right-3 z-10 text-xs font-medium px-2.5 py-1 rounded-full"
                  style={{ background: 'rgba(0,0,0,0.5)', color: '#fff', backdropFilter: 'blur(4px)' }}>
                  {item.category}
                </div>

                <Image
                  src={item.imageUrl}
                  alt={item.title}
                  width={600}
                  height={400}
                  className="w-full object-cover"
                  style={{ aspectRatio: i % 5 === 0 ? '4/5' : i % 3 === 0 ? '16/9' : '4/3' }}
                />

                {/* Hover overlay */}
                <div className="absolute inset-0 flex flex-col justify-end p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 60%)' }}>
                  <h3 className="text-white font-display text-sm font-semibold">{item.title}</h3>
                  {item.description && (
                    <p className="text-white/75 text-xs mt-0.5 line-clamp-2">{item.description}</p>
                  )}
                  <div className="flex items-center gap-1 mt-2 text-white/80 text-xs">
                    <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                    </svg>
                    Click to enlarge
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div className="lightbox-overlay" onClick={closeLightbox}>
          <div className="relative max-w-5xl w-full mx-auto" onClick={e => e.stopPropagation()}>

            {/* Close */}
            <button onClick={closeLightbox}
              className="absolute -top-12 right-0 text-white/70 hover:text-white transition-colors p-2 z-10">
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>

            {/* Counter */}
            <div className="absolute -top-10 left-0 text-white/50 text-sm">
              {lightboxIdx + 1} / {filtered.length}
            </div>

            {/* Image */}
            <div className="relative rounded-2xl overflow-hidden"
              style={{ maxHeight: '80vh' }}>
              <Image
                src={lightbox.imageUrl}
                alt={lightbox.title}
                width={1200}
                height={800}
                className="w-full object-contain"
                style={{ maxHeight: '75vh' }}
              />
            </div>

            {/* Caption */}
            <div className="mt-4 text-center">
              <h3 className="text-white font-display text-xl">{lightbox.title}</h3>
              {lightbox.description && (
                <p className="text-white/60 text-sm mt-1">{lightbox.description}</p>
              )}
              <span className="inline-block mt-2 text-xs px-3 py-1 rounded-full"
                style={{ background: 'var(--accent)', color: '#fff' }}>
                {lightbox.category}
              </span>
            </div>

            {/* Prev / Next */}
            {filtered.length > 1 && (
              <>
                <button onClick={() => navigateLb(-1)}
                  className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-14 p-3 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-all">
                  <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
                  </svg>
                </button>
                <button onClick={() => navigateLb(1)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-14 p-3 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-all">
                  <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
                  </svg>
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
