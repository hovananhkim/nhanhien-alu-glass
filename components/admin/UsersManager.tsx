'use client'
import { useState } from 'react'

interface Admin {
  id: string; name: string; email: string
  role: string; isActive: boolean; isSuperAdmin: boolean; createdAt: string
}

interface Props {
  initialAdmins: Admin[]
  currentAdminId: string
}

type Action = 'approve' | 'deactivate' | 'promote' | 'demote'

function timeAgo(date: string) {
  const diff = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (diff < 60)    return 'just now'
  if (diff < 3600)  return `${Math.floor(diff/60)}m ago`
  if (diff < 86400) return `${Math.floor(diff/3600)}h ago`
  if (diff < 86400 * 30) return `${Math.floor(diff/86400)}d ago`
  return new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function UsersManager({ initialAdmins, currentAdminId }: Props) {
  const [admins, setAdmins]   = useState(initialAdmins)
  const [busy, setBusy]       = useState<string | null>(null) // id of admin being actioned
  const [confirm, setConfirm] = useState<{ id: string; action: Action; name: string } | null>(null)
  const [toast, setToast]     = useState<{ msg: string; type: 'success' | 'error' } | null>(null)

  const pending = admins.filter(a => !a.isActive)
  const active  = admins.filter(a =>  a.isActive)

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  const doAction = async (id: string, action: Action) => {
    setBusy(id); setConfirm(null)
    try {
      const res  = await fetch(`/api/admin/users/${id}`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ action }),
      })
      const data = await res.json()
      if (!res.ok) { showToast(data.error || 'Action failed', 'error'); return }

      setAdmins(prev => prev.map(a => a.id === id ? {
        ...a,
        isActive:    data.isActive,
        isSuperAdmin: data.isSuperAdmin,
        role:        data.role,
      } : a))

      const labels: Record<Action, string> = {
        approve:    'Account approved — email sent.',
        deactivate: 'Account deactivated — email sent.',
        promote:    'Promoted to Super Admin — email sent.',
        demote:     'Super Admin role removed.',
      }
      showToast(labels[action])
    } catch { showToast('Something went wrong.', 'error') }
    setBusy(null)
  }

  const doDelete = async (id: string) => {
    setBusy(id); setConfirm(null)
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' })
      if (!res.ok) { const d = await res.json(); showToast(d.error || 'Delete failed', 'error'); return }
      setAdmins(prev => prev.filter(a => a.id !== id))
      showToast('Account deleted.')
    } catch { showToast('Something went wrong.', 'error') }
    setBusy(null)
  }

  const ActionBtn = ({ id, action, label, cls }: { id: string; action: Action; label: string; cls: string }) => (
    <button
      disabled={busy === id}
      onClick={() => setConfirm({ id, action, name: admins.find(a => a.id === id)?.name || '' })}
      className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-all disabled:opacity-40 ${cls}`}
    >
      {busy === id ? '…' : label}
    </button>
  )

  return (
    <div className="space-y-8">

      {/* Toast notification */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 px-5 py-3 rounded-xl shadow-lg text-sm font-medium transition-all ${
          toast.type === 'success'
            ? 'bg-green-600 text-white'
            : 'bg-red-600 text-white'
        }`}>
          {toast.type === 'success'
            ? <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg>
            : <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
          }
          {toast.msg}
        </div>
      )}

      {/* Confirm dialog */}
      {confirm && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-7">
            <h3 className="font-semibold text-charcoal-800 text-lg mb-2">Confirm Action</h3>
            <p className="text-stone-500 text-sm mb-6">
              {confirm.action === 'approve'    && <>Approve <strong>{confirm.name}</strong>? They will receive an email and can log in immediately.</>}
              {confirm.action === 'deactivate' && <>Deactivate <strong>{confirm.name}</strong>? They will lose access immediately and receive an email.</>}
              {confirm.action === 'promote'    && <>Promote <strong>{confirm.name}</strong> to Super Admin? They will be able to manage other admin accounts.</>}
              {confirm.action === 'demote'     && <>Remove Super Admin from <strong>{confirm.name}</strong>? Their account stays active but loses admin management access.</>}
            </p>
            <div className="flex gap-3">
              <button onClick={() => doAction(confirm.id, confirm.action)}
                className={`flex-1 py-2.5 text-sm font-semibold text-white rounded-xl transition-all ${
                  confirm.action === 'deactivate' ? 'bg-red-600 hover:bg-red-700' :
                  confirm.action === 'approve'    ? 'bg-green-600 hover:bg-green-700' :
                  'bg-charcoal-800 hover:bg-charcoal-900'
                }`}>
                Confirm
              </button>
              <button onClick={() => setConfirm(null)}
                className="flex-1 py-2.5 text-sm font-medium text-stone-600 border border-stone-200 rounded-xl hover:bg-stone-50 transition-all">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Pending approvals ── */}
      {pending.length > 0 && (
        <div>
          <div className="flex items-center gap-3 mb-4">
            <h2 className="font-semibold text-charcoal-700">Pending Approval</h2>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-100 text-amber-700">
              {pending.length} waiting
            </span>
          </div>
          <div className="space-y-3">
            {pending.map(admin => (
              <div key={admin.id}
                className="bg-white rounded-2xl border-2 border-amber-200 shadow-sm p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                {/* Pulsing badge */}
                <div className="relative shrink-0">
                  <div className="w-11 h-11 rounded-full flex items-center justify-center font-display font-bold text-lg"
                    style={{ background: '#fef3c7', color: '#92400e' }}>
                    {admin.name[0].toUpperCase()}
                  </div>
                  <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-amber-400 border-2 border-white">
                    <span className="absolute inset-0 rounded-full bg-amber-400 animate-ping opacity-75"/>
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-charcoal-800">{admin.name}</div>
                  <div className="text-sm text-stone-400 truncate">{admin.email}</div>
                  <div className="text-xs text-stone-300 mt-0.5">Registered {timeAgo(admin.createdAt)}</div>
                </div>
                <div className="flex items-center gap-2 flex-wrap shrink-0">
                  <ActionBtn id={admin.id} action="approve" label="✓ Approve"
                    cls="bg-green-100 text-green-700 hover:bg-green-200 border border-green-200" />
                  <button
                    disabled={busy === admin.id}
                    onClick={() => setConfirm({ id: admin.id, action: 'deactivate', name: admin.name })}
                    className="text-xs font-medium px-3 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 border border-red-100 transition-all disabled:opacity-40">
                    ✕ Reject
                  </button>
                  <button
                    disabled={busy === admin.id}
                    onClick={() => setConfirm({ id: admin.id, action: 'deactivate', name: admin.name })}
                    className="text-xs text-stone-400 hover:text-red-500 transition-colors px-2 py-1.5"
                    title="Delete account">
                    <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Active admins ── */}
      <div>
        <h2 className="font-semibold text-charcoal-700 mb-4">
          Active Admins <span className="text-stone-400 font-normal text-sm">({active.length})</span>
        </h2>
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
          {active.length === 0 ? (
            <div className="py-12 text-center text-stone-400 text-sm">No active admins</div>
          ) : (
            <div className="divide-y divide-stone-50">
              {active.map(admin => {
                const isMe = admin.id === currentAdminId
                return (
                  <div key={admin.id} className="flex items-center gap-4 px-6 py-4 hover:bg-stone-50 transition-colors">
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full flex items-center justify-center font-display font-bold shrink-0"
                      style={{
                        background: admin.isSuperAdmin ? 'rgba(168,94,46,0.15)' : '#f5f3ef',
                        color:      admin.isSuperAdmin ? '#a85e2e'              : '#78716c',
                      }}>
                      {admin.name[0].toUpperCase()}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm text-charcoal-800">{admin.name}</span>
                        {isMe && (
                          <span className="text-xs bg-stone-100 text-stone-500 px-2 py-0.5 rounded-full">You</span>
                        )}
                        {admin.isSuperAdmin && (
                          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full"
                            style={{ background: 'rgba(168,94,46,0.12)', color: '#a85e2e' }}>
                            ⭐ Super Admin
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-stone-400 truncate mt-0.5">{admin.email}</div>
                      <div className="text-xs text-stone-300">Joined {timeAgo(admin.createdAt)}</div>
                    </div>

                    {/* Actions — hidden for self */}
                    {!isMe && (
                      <div className="flex items-center gap-2 shrink-0">
                        {admin.isSuperAdmin ? (
                          <ActionBtn id={admin.id} action="demote" label="Remove Super Admin"
                            cls="bg-stone-100 text-stone-600 hover:bg-stone-200" />
                        ) : (
                          <ActionBtn id={admin.id} action="promote" label="Make Super Admin"
                            cls="bg-stone-100 text-stone-600 hover:bg-stone-200" />
                        )}
                        <ActionBtn id={admin.id} action="deactivate" label="Deactivate"
                          cls="bg-red-50 text-red-600 hover:bg-red-100 border border-red-100" />
                        <button
                          disabled={busy === admin.id}
                          onClick={() => {
                            if (confirm(`Delete ${admin.name}'s account permanently? This cannot be undone.`)) {
                              doDelete(admin.id)
                            }
                          }}
                          className="p-1.5 text-stone-300 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50 disabled:opacity-40"
                          title="Delete account permanently">
                          <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Tip */}
      <div className="bg-stone-50 rounded-xl border border-stone-100 p-5 flex items-start gap-3">
        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#a8a29e" className="shrink-0 mt-0.5">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        <div className="text-xs text-stone-400 leading-relaxed">
          <strong className="text-stone-500">Approval workflow:</strong> New admins register at{' '}
          <code className="bg-stone-200 px-1.5 py-0.5 rounded text-xs">/admin/register</code> and
          cannot log in until approved here. Approved admins receive an email notification.
          You cannot deactivate or delete your own account.
        </div>
      </div>
    </div>
  )
}
