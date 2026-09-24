'use client'
import { useState } from 'react'
import Link from 'next/link'

// Password strength checker
function getStrength(password: string): { score: number; label: string; color: string } {
  let score = 0
  if (password.length >= 8)               score++
  if (/[A-Z]/.test(password))             score++
  if (/[a-z]/.test(password))             score++
  if (/[0-9]/.test(password))             score++
  if (/[^A-Za-z0-9]/.test(password))     score++

  if (score <= 1) return { score, label: 'Too weak',   color: '#ef4444' }
  if (score === 2) return { score, label: 'Weak',       color: '#f97316' }
  if (score === 3) return { score, label: 'Fair',       color: '#eab308' }
  if (score === 4) return { score, label: 'Good',       color: '#22c55e' }
  return              { score, label: 'Strong',      color: '#10b981' }
}

type Step = 'form' | 'success'

export default function AdminRegisterPage() {
  const [step, setStep]   = useState<Step>('form')
  const [form, setForm]   = useState({
    name: '', email: '', password: '', confirmPassword: '', reason: '',
  })
  const [showPass, setShowPass]     = useState(false)
  const [showConf, setShowConf]     = useState(false)
  const [loading, setLoading]       = useState(false)
  const [errors, setErrors]         = useState<Record<string, string>>({})
  const [serverError, setServerError] = useState('')

  const strength = getStrength(form.password)

  // Client-side field validation
  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.name.trim())
      e.name = 'Full name is required.'
    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = 'Enter a valid email address.'
    if (strength.score < 3)
      e.password = 'Password is too weak. Add uppercase, numbers, or symbols.'
    if (form.password !== form.confirmPassword)
      e.confirmPassword = 'Passwords do not match.'
    if (!form.reason.trim() || form.reason.trim().length < 20)
      e.reason = 'Please write at least 20 characters explaining why you need access.'
    return e
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const e2 = validate()
    setErrors(e2)
    if (Object.keys(e2).length) return

    setLoading(true)
    setServerError('')
    try {
      const res  = await fetch('/api/auth/register', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) { setServerError(data.error || 'Registration failed.'); return }
      setStep('success')
    } catch { setServerError('Connection error. Please try again.') }
    setLoading(false)
  }

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm(p => ({ ...p, [field]: e.target.value }))
    if (errors[field]) setErrors(p => { const n = { ...p }; delete n[field]; return n })
  }

  // ── Success screen ────────────────────────────────────────────
  if (step === 'success') {
    return (
      <div className="min-h-screen bg-charcoal-900 flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ background: 'rgba(168,94,46,0.15)', border: '2px solid rgba(168,94,46,0.4)' }}>
            <svg width="36" height="36" fill="none" viewBox="0 0 24 24" stroke="#a85e2e">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <h1 className="font-display text-3xl text-white mb-3">Request Submitted</h1>
          <p className="text-stone-400 text-sm leading-relaxed mb-2">
            Your registration is pending approval from the super admin.
          </p>
          <p className="text-stone-500 text-sm leading-relaxed mb-8">
            You will receive an email at <span className="text-stone-300 font-medium">{form.email}</span> once your account has been approved. This usually takes 1 business day.
          </p>
          <div className="bg-charcoal-800 rounded-2xl border border-white/8 p-6 text-left mb-6">
            <h3 className="text-sm font-semibold text-stone-300 mb-3">What happens next?</h3>
            <ul className="space-y-3">
              {[
                'The super admin receives an email notification about your request.',
                'They review your details and reason for access.',
                'Once approved, you\'ll get an email with a login link.',
                'You can then sign in with your email and password.',
              ].map((step, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5"
                    style={{ background: 'rgba(168,94,46,0.2)', color: '#a85e2e' }}>
                    {i + 1}
                  </span>
                  <span className="text-stone-400 text-sm">{step}</span>
                </li>
              ))}
            </ul>
          </div>
          <Link href="/admin/login"
            className="inline-flex items-center gap-2 text-stone-400 text-sm hover:text-stone-200 transition-colors">
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
            </svg>
            Back to Login
          </Link>
        </div>
      </div>
    )
  }

  // ── Registration form ─────────────────────────────────────────
  return (
    <div className="min-h-screen bg-charcoal-900 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4"
            style={{ background: '#a85e2e' }}>
            <svg width="28" height="28" viewBox="0 0 20 20" fill="none">
              <rect x="3" y="14" width="14" height="2" rx="1" fill="white"/>
              <rect x="5" y="6" width="10" height="8" rx="1" fill="white" opacity="0.7"/>
              <rect x="7" y="3" width="6" height="3" rx="1" fill="white" opacity="0.5"/>
            </svg>
          </div>
          <h1 className="font-display text-2xl text-white">Request Admin Access</h1>
          <p className="text-stone-400 text-sm mt-1">
            Your account will be inactive until a super admin approves it.
          </p>
        </div>

        {/* Card */}
        <div className="bg-charcoal-800 rounded-2xl border border-white/8 p-8">

          {serverError && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm mb-6 flex items-start gap-2">
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="shrink-0 mt-0.5">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>

            {/* Full name */}
            <div>
              <label className="block text-xs font-medium text-stone-300 mb-2">Full Name</label>
              <input type="text" className={`admin-input ${errors.name ? 'border-red-500/50' : ''}`}
                placeholder="Kathan Patel"
                value={form.name} onChange={set('name')} />
              {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-medium text-stone-300 mb-2">Email Address</label>
              <input type="email" className={`admin-input ${errors.email ? 'border-red-500/50' : ''}`}
                placeholder="you@example.com"
                value={form.email} onChange={set('email')} />
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-medium text-stone-300 mb-2">Password</label>
              <div className="relative">
                <input type={showPass ? 'text' : 'password'}
                  className={`admin-input pr-10 ${errors.password ? 'border-red-500/50' : ''}`}
                  placeholder="Min. 8 characters"
                  value={form.password} onChange={set('password')} />
                <button type="button" onClick={() => setShowPass(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300 transition-colors">
                  {showPass
                    ? <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/></svg>
                    : <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                  }
                </button>
              </div>
              {/* Strength meter */}
              {form.password && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4, 5].map(i => (
                      <div key={i} className="h-1 flex-1 rounded-full transition-all duration-300"
                        style={{ background: i <= strength.score ? strength.color : '#374151' }}/>
                    ))}
                  </div>
                  <p className="text-xs" style={{ color: strength.color }}>{strength.label}</p>
                </div>
              )}
              {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
              {!errors.password && (
                <div className="mt-2 flex flex-wrap gap-x-3 gap-y-0.5">
                  {[
                    { test: form.password.length >= 8,       label: '8+ chars' },
                    { test: /[A-Z]/.test(form.password),     label: 'Uppercase' },
                    { test: /[a-z]/.test(form.password),     label: 'Lowercase' },
                    { test: /[0-9]/.test(form.password),     label: 'Number' },
                  ].map(rule => (
                    <span key={rule.label} className="text-xs flex items-center gap-1"
                      style={{ color: rule.test ? '#6ee7b7' : '#6b7280' }}>
                      {rule.test ? '✓' : '○'} {rule.label}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Confirm password */}
            <div>
              <label className="block text-xs font-medium text-stone-300 mb-2">Confirm Password</label>
              <div className="relative">
                <input type={showConf ? 'text' : 'password'}
                  className={`admin-input pr-10 ${errors.confirmPassword ? 'border-red-500/50' : ''}`}
                  placeholder="Re-enter password"
                  value={form.confirmPassword} onChange={set('confirmPassword')} />
                <button type="button" onClick={() => setShowConf(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300 transition-colors">
                  {showConf
                    ? <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/></svg>
                    : <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                  }
                </button>
              </div>
              {form.confirmPassword && form.password === form.confirmPassword && !errors.confirmPassword && (
                <p className="text-green-400 text-xs mt-1 flex items-center gap-1">
                  <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg>
                  Passwords match
                </p>
              )}
              {errors.confirmPassword && <p className="text-red-400 text-xs mt-1">{errors.confirmPassword}</p>}
            </div>

            {/* Reason */}
            <div>
              <label className="block text-xs font-medium text-stone-300 mb-2">
                Reason for Access
                <span className="text-stone-500 font-normal ml-1">(min. 20 characters)</span>
              </label>
              <textarea rows={3}
                className={`admin-input resize-none text-sm ${errors.reason ? 'border-red-500/50' : ''}`}
                placeholder="e.g. I am the new marketing manager and need to manage products and blog posts…"
                value={form.reason} onChange={set('reason')} />
              <div className="flex items-start justify-between mt-1">
                {errors.reason
                  ? <p className="text-red-400 text-xs">{errors.reason}</p>
                  : <span/>
                }
                <span className={`text-xs shrink-0 ml-auto ${form.reason.length >= 20 ? 'text-green-400' : 'text-stone-500'}`}>
                  {form.reason.length} / 20+
                </span>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-3 text-white font-medium rounded-xl transition-all text-sm flex items-center justify-center gap-2 disabled:opacity-60"
              style={{ background: '#a85e2e' }}>
              {loading
                ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>Submitting…</>
                : 'Submit Registration Request'
              }
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-white/5 text-center">
            <p className="text-stone-500 text-xs">
              Already have an account?{' '}
              <Link href="/admin/login" className="text-stone-300 hover:text-white transition-colors">Sign in</Link>
            </p>
          </div>
        </div>

        <div className="text-center mt-5">
          <Link href="/" className="text-stone-600 text-xs hover:text-stone-400 transition-colors">← Back to website</Link>
        </div>
      </div>
    </div>
  )
}
