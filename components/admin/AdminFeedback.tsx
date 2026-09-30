'use client'

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { t } from '@/lib/translations'

type Feedback = {
  notify: (message?: string, type?: 'success' | 'error') => void
  confirmAction: (message?: string) => Promise<boolean>
}
const Context = createContext<Feedback | null>(null)

export function useAdminFeedback() {
  const value = useContext(Context)
  if (!value) throw new Error('AdminFeedbackProvider is required')
  return value
}

export default function AdminFeedbackProvider({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [question, setQuestion] = useState<string | null>(null)
  const resolver = useRef<((answer: boolean) => void) | null>(null)
  const dialog = useRef<HTMLDialogElement>(null)
  const trigger = useRef<HTMLElement | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => {
    setMounted(true)
    return () => { clearTimeout(timer.current); resolver.current?.(false); resolver.current = null }
  }, [])
  useEffect(() => { if (question !== null) dialog.current?.showModal() }, [question])

  const notify = useCallback((message = t('admin.feedback.saved'), type: 'success' | 'error' = 'success') => {
    clearTimeout(timer.current)
    setToast({ message, type })
    timer.current = setTimeout(() => setToast(null), type === 'error' ? 7000 : 4000)
  }, [])
  const confirmAction = useCallback((message = t('admin.feedback.deleteMessage')) => {
    if (resolver.current) return Promise.resolve(false)
    trigger.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
    setQuestion(message)
    return new Promise<boolean>(resolve => { resolver.current = resolve })
  }, [])
  const finish = (answer: boolean) => {
    const resolve = resolver.current
    resolver.current = null
    dialog.current?.close()
    setQuestion(null)
    trigger.current?.focus()
    resolve?.(answer)
  }

  return <Context.Provider value={{ notify, confirmAction }}>
    {children}
    {mounted && createPortal(<>
      <div className="pointer-events-none fixed right-4 top-4 z-[100] w-max max-w-[calc(100vw-2rem)] sm:max-w-sm">
        {toast && <div role={toast.type === 'error' ? 'alert' : 'status'} className={`pointer-events-auto flex items-center gap-2 rounded-xl border px-3 py-2.5 shadow-lg ${toast.type === 'error' ? 'border-red-200 bg-red-50 text-red-700' : 'border-green-200 bg-green-50 text-green-700'}`}>
          <p className="min-w-0 flex-1 break-words text-sm leading-5">{toast.message}</p>
          <button type="button" onClick={() => setToast(null)} aria-label={t('admin.feedback.close')} className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md hover:bg-black/5">×</button>
        </div>}
      </div>
      <dialog ref={dialog} aria-labelledby="admin-confirm-title" aria-describedby="admin-confirm-message" onCancel={event => { event.preventDefault(); finish(false) }} className="w-[calc(100%-2rem)] max-w-md rounded-2xl bg-white p-6 text-charcoal-800 shadow-xl backdrop:bg-black/40">
        <h2 id="admin-confirm-title" className="text-lg font-semibold">{t('admin.feedback.confirmTitle')}</h2>
        <p id="admin-confirm-message" className="mt-3 whitespace-pre-wrap text-sm text-stone-600">{question}</p>
        <div className="mt-6 flex justify-end gap-3">
          <button autoFocus type="button" onClick={() => finish(false)} className="h-10 rounded-xl border border-stone-300 px-5 text-sm hover:bg-stone-100">{t('admin.feedback.cancel')}</button>
          <button type="button" onClick={() => finish(true)} className="h-10 rounded-xl bg-red-600 px-5 text-sm font-medium text-white hover:bg-red-700">{t('admin.feedback.confirm')}</button>
        </div>
      </dialog>
    </>, document.body)}
  </Context.Provider>
}
