import { prisma } from '@/lib/prisma'
import MarkReadButton from '@/components/admin/MarkReadButton'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Inquiries | Admin' }

export default async function AdminInquiriesPage() {
  const inquiries = await prisma.inquiry.findMany({
    orderBy: [{ isRead: 'asc' }, { createdAt: 'desc' }],
  })
  const unread = inquiries.filter(i => !i.isRead).length

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-display font-semibold text-charcoal-800">Inquiries</h1>
        <p className="text-stone-400 text-sm mt-1">
          {inquiries.length} total · <span className="text-amber-600 font-medium">{unread} unread</span>
        </p>
      </div>

      <div className="space-y-4">
        {inquiries.length === 0 ? (
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm py-20 text-center text-stone-400">
            <div className="text-4xl mb-3">💬</div>
            <p>No inquiries yet</p>
          </div>
        ) : inquiries.map(inquiry => (
          <div key={inquiry.id}
            className={`bg-white rounded-2xl border shadow-sm p-6 transition-all ${
              !inquiry.isRead ? 'border-amber-200 bg-amber-50/20' : 'border-stone-100'
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4 flex-1 min-w-0">
                <div className="w-10 h-10 rounded-full bg-wood-100 flex items-center justify-center shrink-0 font-display font-semibold text-wood-600">
                  {inquiry.name[0].toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-charcoal-800">{inquiry.name}</span>
                    {!inquiry.isRead && (
                      <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">New</span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-3 text-xs text-stone-400 mb-3">
                    <a href={`mailto:${inquiry.email}`} className="hover:text-charcoal-700 transition-colors">{inquiry.email}</a>
                    <a href={`tel:${inquiry.phone}`} className="hover:text-charcoal-700 transition-colors">{inquiry.phone}</a>
                    <span>{new Date(inquiry.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  {inquiry.subject && (
                    <p className="text-sm font-medium text-charcoal-700 mb-2">{inquiry.subject}</p>
                  )}
                  <p className="text-sm text-stone-600 leading-relaxed whitespace-pre-wrap">{inquiry.message}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <a href={`mailto:${inquiry.email}?subject=Re: ${inquiry.subject || 'Your Inquiry'}`}
                  className="p-2 text-stone-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                  title="Reply by email">
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                </a>
                <a href={`https://wa.me/${inquiry.phone.replace(/\D/g,'')}`} target="_blank" rel="noopener noreferrer"
                  className="p-2 text-stone-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all"
                  title="Reply on WhatsApp">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M8 1C4.134 1 1 4.134 1 8c0 1.16.305 2.25.84 3.2L1 15l3.943-.826A7 7 0 1 0 8 1z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
                  </svg>
                </a>
                {!inquiry.isRead && <MarkReadButton id={inquiry.id} />}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
