'use client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function DeleteProductButton({ id, name }: { id: string; name: string }) {
  const router = useRouter()
  const [confirming, setConfirming] = useState(false)

  const handleDelete = async () => {
    if (!confirming) { setConfirming(true); return }
    const res = await fetch(`/api/products/${id}`, { method: 'DELETE' })
    if (res.ok) router.refresh()
    setConfirming(false)
  }

  return (
    <button
      onClick={handleDelete}
      onBlur={() => setConfirming(false)}
      className={`p-1.5 rounded-md transition-colors text-sm ${
        confirming
          ? 'bg-red-500 text-white hover:bg-red-600 px-2.5'
          : 'text-stone-400 hover:text-red-600 hover:bg-red-50'
      }`}
      title={confirming ? 'Click again to confirm' : `Delete ${name}`}
    >
      {confirming ? 'Confirm?' : (
        <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
        </svg>
      )}
    </button>
  )
}
