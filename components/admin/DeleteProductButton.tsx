'use client'
import { useRouter } from 'next/navigation'
import { useRef, useState } from 'react'
import { useAdminFeedback } from '@/components/admin/AdminFeedback'
import { t } from '@/lib/translations'

export default function DeleteProductButton({ id, name }: { id: string; name: string }) {
  const router = useRouter()
  const { notify, confirmAction } = useAdminFeedback()
  const [busy, setBusy] = useState(false)
  const pending = useRef(false)
  const handleDelete = async () => {
    if (pending.current) return
    pending.current = true
    try {
      if (!(await confirmAction(t('admin.feedback.deleteNamed').replace('{name}', () => name)))) return
      setBusy(true)
      const response = await fetch(`/api/products/${id}`, { method: 'DELETE' })
      if (!response.ok) throw new Error(t('admin.feedback.error'))
      notify(t('admin.feedback.deleted')); router.refresh()
    } catch { notify(t('admin.feedback.error'), 'error') }
    finally { pending.current = false; setBusy(false) }
  }
  return <button type="button" disabled={busy} onClick={handleDelete} title={t('admin.feedback.delete')} aria-label={t('admin.feedback.delete')} className="inline-flex h-8 w-8 items-center justify-center rounded-md text-stone-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50 disabled:cursor-not-allowed">
    <svg aria-hidden="true" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
  </button>
}
