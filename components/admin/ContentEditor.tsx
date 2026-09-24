'use client'
import { useState } from 'react'

const TEXT_FIELDS = [
  { section: 'Hero Section', fields: [
    { key: 'hero_title',    label: 'Hero Title',    type: 'text',     placeholder: 'Crafted for Generations' },
    { key: 'hero_subtitle', label: 'Hero Subtitle', type: 'textarea', placeholder: 'Premium furniture handcrafted...' },
  ]},
  { section: 'About Section', fields: [
    { key: 'about_title', label: 'About Title', type: 'text',     placeholder: 'Three Decades of Craftsmanship' },
    { key: 'about_text',  label: 'About Text',  type: 'textarea', placeholder: 'Since 1994...' },
  ]},
  { section: 'Contact Information', fields: [
    { key: 'phone',     label: 'Phone Number',    type: 'text',     placeholder: '+91 98765 43210' },
    { key: 'email',     label: 'Email Address',   type: 'text',     placeholder: 'info@craftura.com' },
    { key: 'address',   label: 'Address',         type: 'textarea', placeholder: 'Plot 42, GIDC...' },
    { key: 'whatsapp',  label: 'WhatsApp Number', type: 'text',     placeholder: '+919876543210' },
  ]},
]

// Nav tabs that admin can toggle on/off.
// Each entry controls a PAGE menu item — not a parent.
// The "Order Details" parent auto-hides when all its children are hidden.
const NAV_TABS = [
  {
    key: 'nav_show_gallery',
    label: 'Gallery',
    description: 'Shows / hides the Gallery page link in navigation',
    icon: '🖼️',
    parent: null,
  },
  {
    key: 'nav_show_bulk_orders',
    label: 'Bulk Orders',
    description: 'Shows / hides the Bulk Orders page link inside "Order Details"',
    icon: '📦',
    parent: 'Order Details',  // belongs to this parent dropdown
  },
  {
    key: 'nav_show_blog',
    label: 'Blog',
    description: 'Shows / hides the Blog page link in navigation',
    icon: '✍️',
    parent: null,
  },
  {
    key: 'nav_show_about',
    label: 'About Us',
    description: 'Shows / hides the About Us page link in navigation',
    icon: '🏭',
    parent: null,
  },
  {
    key: 'nav_show_contact',
    label: 'Contact',
    description: 'Shows / hides the Contact page link in navigation',
    icon: '📞',
    parent: null,
  },
]

export default function ContentEditor({ initialContent }: { initialContent: Record<string, string> }) {
  const [content, setContent] = useState(initialContent)
  const [saving, setSaving]   = useState(false)
  const [saved, setSaved]     = useState(false)
  const [error, setError]     = useState('')

  const handleSave = async () => {
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/admin/content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(content),
      })
      if (res.ok) {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      } else {
        setError('Failed to save. Please try again.')
      }
    } catch {
      setError('Connection error.')
    }
    setSaving(false)
  }

  const toggleNav = (key: string) => {
    setContent(p => ({ ...p, [key]: p[key] === 'false' ? 'true' : 'false' }))
  }

  const isNavEnabled = (key: string) => content[key] !== 'false'

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-5 py-3 text-sm">
          {error}
        </div>
      )}

      {/* ── Navigation Visibility ── */}
      <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
        <div className="px-7 py-5 border-b border-stone-100 flex items-center gap-3">
          <div className="w-9 h-9 bg-wood-50 rounded-xl flex items-center justify-center text-lg">🧭</div>
          <div>
            <h2 className="font-semibold text-charcoal-700">Navigation Visibility</h2>
            <p className="text-xs text-stone-400 mt-0.5">
              Toggle which menu items are visible to all site visitors. Changes take effect immediately.
            </p>
          </div>
        </div>

        <div className="divide-y divide-stone-50">
          {/* Always-on notice */}
          <div className="px-7 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-lg">🏠</span>
              <div>
                <p className="text-sm font-medium text-charcoal-700">Home &amp; Products</p>
                <p className="text-xs text-stone-400">Core pages — always visible, cannot be hidden</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-stone-400 bg-stone-100 px-3 py-1.5 rounded-full">
              <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
              </svg>
              Always on
            </div>
          </div>

          {NAV_TABS.map(tab => {
            const enabled = isNavEnabled(tab.key)
            return (
              <div key={tab.key} className="px-7 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-lg">{tab.icon}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-charcoal-700">{tab.label}</p>
                      {tab.parent && (
                        <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full"
                          style={{ background: '#f0ece7', color: '#78716c' }}>
                          inside "{tab.parent}"
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-stone-400 mt-0.5">{tab.description}</p>
                  </div>
                </div>

                {/* Toggle switch */}
                <button
                  type="button"
                  onClick={() => toggleNav(tab.key)}
                  className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-wood-500 focus:ring-offset-2"
                  style={{ background: enabled ? 'var(--color-wood-600, #a85e2e)' : '#d1d5db' }}
                  role="switch"
                  aria-checked={enabled}
                  aria-label={`Toggle ${tab.label}`}
                >
                  <span
                    className="inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200"
                    style={{ transform: enabled ? 'translateX(22px)' : 'translateX(2px)' }}
                  />
                </button>
              </div>
            )
          })}
        </div>

        <div className="px-7 py-4 border-t border-stone-100 flex items-center gap-2"
          style={{ background: '#fdf8f1' }}>
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor"
            className="text-wood-600 shrink-0">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <p className="text-xs text-stone-500">
            You control individual <strong>page</strong> visibility — not parent menus. 
            The <strong>"Order Details"</strong> parent menu hides automatically when all its child pages are hidden.
            Hidden pages are still accessible via direct URL.
          </p>
        </div>
      </div>

      {/* ── Text / CMS Fields ── */}
      {TEXT_FIELDS.map(section => (
        <div key={section.section} className="bg-white rounded-2xl border border-stone-100 shadow-sm p-7">
          <h2 className="font-semibold text-charcoal-700 mb-5 pb-4 border-b border-stone-100">
            {section.section}
          </h2>
          <div className="space-y-5">
            {section.fields.map(field => (
              <div key={field.key}>
                <label className="block text-xs font-medium text-charcoal-600 mb-1.5">
                  {field.label}
                </label>
                {field.type === 'textarea' ? (
                  <textarea
                    rows={3}
                    className="form-input resize-none"
                    placeholder={field.placeholder}
                    value={content[field.key] || ''}
                    onChange={e => setContent(p => ({ ...p, [field.key]: e.target.value }))}
                  />
                ) : (
                  <input
                    type="text"
                    className="form-input"
                    placeholder={field.placeholder}
                    value={content[field.key] || ''}
                    onChange={e => setContent(p => ({ ...p, [field.key]: e.target.value }))}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Save button */}
      <div className="flex items-center gap-4 justify-end pb-8">
        {saved && (
          <span className="flex items-center gap-2 text-green-600 text-sm font-medium">
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
            </svg>
            Saved — changes are live!
          </span>
        )}
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-7 py-2.5 bg-charcoal-800 hover:bg-charcoal-900 text-white text-sm font-medium rounded-xl transition-colors flex items-center gap-2 disabled:opacity-60"
        >
          {saving
            ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>Saving...</>
            : 'Save All Changes'
          }
        </button>
      </div>
    </div>
  )
}
