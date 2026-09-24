'use client'
import { useRouter } from 'next/navigation'

export default function MarkReadButton({ id }: { id: string }) {
  const router = useRouter()
  const handle = async () => {
    await fetch(`/api/inquiries/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isRead: true }),
    })
    router.refresh()
  }
  return (
    <button onClick={handle}
      className="p-2 text-stone-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all"
      title="Mark as read">
      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg>
    </button>
  )
}
