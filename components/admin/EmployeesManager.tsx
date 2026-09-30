'use client'

import { useRef, useState, type FormEvent, type ReactNode, type SelectHTMLAttributes } from 'react'
import { currentBusinessMonth, payrollSummary, type Employee } from '@/lib/employees'
import EmployeesTable from '@/components/admin/EmployeesTable'
import { useAdminFeedback } from '@/components/admin/AdminFeedback'
import { t } from '@/lib/translations'
import AttendanceTable from '@/components/admin/AttendanceTable'

const money = (value: number) => value.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })
const today = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date())
const control = 'admin-field-control rounded-lg border border-stone-300 bg-white text-sm text-charcoal-800 transition-[border-color,box-shadow] duration-200 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50'
const input = `h-10 w-full min-w-0 px-3 py-0 ${control}`
const textarea = `min-h-20 w-full resize-y px-3 py-2 ${control}`
const button = 'rounded-lg bg-charcoal-800 hover:bg-charcoal-900 px-4 py-2 text-sm font-medium text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
const tableIconButton = 'inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md p-0 text-stone-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wood-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'
const secondary = 'rounded-lg border border-stone-300 px-3 py-2 text-sm hover:bg-stone-100 disabled:opacity-50'
const balance = (value: number) => value > 0 ? t('admin.employees.manager.owed').replace('{amount}', () => money(value)) : value < 0 ? t('admin.employees.manager.overpaid').replace('{amount}', () => money(-value)) : t('admin.employees.manager.balanced')
function Field({ label, children, className = '' }: { label: string; children: ReactNode; className?: string }) {
  return <label className={`flex min-w-0 flex-col gap-1 text-sm text-stone-600 ${className}`}><span className="leading-5">{label}</span>{children}</label>
}
function EmployeeSelect({ children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <span className="relative block w-fit max-w-full">
    <select {...props} className={`block h-10 w-auto max-w-full appearance-none py-0 pl-3 pr-9 ${control}`}>{children}</select>
    <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-stone-500">
      <path d="m6 9 6 6 6-6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </span>
}

type Editor = { kind: 'profile' | 'attendance' | 'payment'; employee?: Employee; date?: string }

export default function EmployeesManager({ initialEmployees, view = 'all' }: { initialEmployees: Employee[]; view?: 'all' | 'attendance' | 'payments' }) {
  const [employees, setEmployees] = useState(initialEmployees)
  const [selected, setSelected] = useState(initialEmployees[0]?.id || '')
  const currentMonth = currentBusinessMonth()
  const [month, setMonth] = useState(currentMonth)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState(view === 'attendance' ? 'active' : 'all')
  const [editor, setEditor] = useState<Editor | null>(null)
  const [busy, setBusy] = useState(false)
  const saving = useRef(false)
  const [error, setError] = useState('')
  const { notify, confirmAction } = useAdminFeedback()
  const employee = employees.find(row => row.id === selected)
  const filtered = employees.filter(row => `${row.name} ${row.phone || ''}`.toLocaleLowerCase('vi').includes(search.toLocaleLowerCase('vi')) && (status === 'all' || row.isActive === (status === 'active')))
  const totals = filtered.reduce((sum, row) => {
    const s = payrollSummary(row, month)
    return { wages: sum.wages + s.wages, paid: sum.paid + s.totalPaid, owed: sum.owed + Math.max(s.closing, 0), excess: sum.excess + Math.max(-s.closing, 0) }
  }, { wages: 0, paid: 0, owed: 0, excess: 0 })

  function open(value: Editor) {
    if (value.kind === 'profile' && view !== 'all') return
    setError(''); setEditor(value)
  }
  async function save(payload: Record<string, unknown>) {
    if (saving.current) return
    saving.current = true
    setBusy(true); setError('')
    try {
      const response = await fetch('/api/admin/employees', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || t('admin.employees.manager.saveError'))
      setEmployees(rows => rows.some(row => row.id === data.id) ? rows.map(row => row.id === data.id ? data : row) : [...rows, data])
      setSelected(data.id); setEditor(null); notify(t(payload.action === 'deletePayment' || payload.action === 'deleteAttendance' ? 'admin.feedback.deleted' : 'admin.employees.manager.saved'))
    } catch (err) {
      const message = err instanceof Error ? err.message : t('admin.employees.manager.connectionError')
      if (editor) setError(message)
      else notify(message, 'error')
    }
    finally { saving.current = false; setBusy(false) }
  }
  async function remove(action: string, id: string) {
    if (!employee || !(await confirmAction(t('admin.employees.manager.deleteConfirm')))) return
    await save({ action, id, employeeId: employee.id })
  }

  async function toggleAttendance(row: Employee, date: string, checked: boolean) {
    if (!row.isActive || date.slice(0, 7) !== currentBusinessMonth()) return
    const existing = row.attendance.find(entry => entry.date === date)
    if (!checked) {
      if (!existing) return
      if (!(await confirmAction(t('admin.employees.manager.removeAttendanceConfirm').replace('{date}', () => date).replace('{units}', () => String(existing.units))))) return
      await save({ action: 'deleteAttendance', employeeId: row.id, id: existing.id })
    } else {
      await save({ action: 'attendance', employeeId: row.id, date, units: 1,
        dailyRate: existing?.dailyRate ?? row.dailyRate, notes: existing?.notes ?? null })
    }
  }

  if (view === 'all') return <div className="p-4 md:p-8">
    <EmployeesTable employees={employees} onAdd={() => open({ kind: 'profile' })} onEdit={employee => open({ kind: 'profile', employee })} feedback={<>
    {!editor && error && <p role="alert" className="mb-4 rounded-lg bg-red-50 p-3 text-red-700">{error}</p>}
    </>} />
    {editor && <EmployeeEditor editor={editor} month={month} busy={busy} error={error} onClose={() => setEditor(null)} onSave={save} />}
  </div>

  return <div className="p-4 md:p-8 space-y-6">
    <div className="admin-page-header">
      <div><h1 className="text-2xl font-display font-semibold text-charcoal-800">{view === 'attendance' ? t('admin.nav.employeeAttendance') : view === 'payments' ? t('admin.nav.employeePayments') : t('admin.employees.manager.allEmployees')}</h1><p className="mt-1 text-sm text-stone-500">{view === 'attendance' ? t('admin.employees.manager.attendanceDescription') : view === 'payments' ? t('admin.employees.manager.paymentsDescription') : t('admin.employees.manager.profilesDescription')}</p></div>
    </div>
    {!editor && error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-red-700">{error}</p>}
    <div className="flex flex-nowrap items-end gap-3 overflow-x-auto pb-1">
      <Field label={t('admin.employees.manager.month')} className="w-44 shrink-0"><input type="month" min="1900-01" max={view === 'attendance' ? currentMonth : '2100-12'} className={input} value={month} onChange={e => { if (view === 'attendance' && e.target.value > currentBusinessMonth()) return; if (/^(19|20)\d{2}-(0[1-9]|1[0-2])$/.test(e.target.value) || /^2100-(0[1-9]|1[0-2])$/.test(e.target.value)) setMonth(e.target.value) }} /></Field>
      <Field label={t('admin.employees.manager.search')} className="w-52 shrink-0"><input className={input} placeholder={t('admin.employees.manager.searchPlaceholder')} value={search} onChange={e => setSearch(e.target.value)} /></Field>
      <Field label={t('admin.employees.table.status')} className="w-fit shrink-0"><EmployeeSelect value={status} onChange={e => setStatus(e.target.value)}><option value="all">{t('admin.nav.employeesAll')}</option><option value="active">{t('admin.employees.table.active')}</option><option value="inactive">{t('admin.employees.table.inactive')}</option></EmployeeSelect></Field>
    </div>
    {view !== 'attendance' && <>
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{[[t('admin.employees.manager.monthlyWages'), totals.wages], [t('admin.employees.manager.monthlyPaid'), totals.paid], [t('admin.employees.manager.closingOwed'), totals.owed], [t('admin.employees.manager.closingOverpaid'), totals.excess]].map(([label, value]) => <div key={label} className="rounded-xl border border-stone-200 bg-white p-4"><p className="text-xs text-stone-500">{label}</p><p className="mt-2 text-xl font-semibold">{money(Number(value))}</p></div>)}</div>
    <p className="text-xs text-stone-500">{t('admin.employees.manager.summaryHelp')}</p>
    </>}
    {view === 'attendance' ? <>
      <p className="text-xs text-stone-500" role="status">{month < currentMonth ? t('admin.attendance.pastMonthReadOnly') : busy ? t('admin.employees.manager.savingAttendance') : t('admin.employees.manager.attendanceHelp')}</p>
      <AttendanceTable employees={filtered} month={month} currentMonth={currentMonth} busy={busy} onToggle={toggleAttendance} />
    </> : <>
    <div className="overflow-x-auto rounded-xl border border-stone-200 bg-white">
      <table className="w-full text-left text-sm"><thead className="bg-stone-100 text-stone-500"><tr>{[t('admin.employees.table.title'), t('admin.employees.table.dailyRate'), t('admin.employees.manager.units'), t('admin.employees.manager.monthlySalary'), t('admin.employees.manager.paidThisMonth'), t('admin.employees.manager.closingSummary'), t('admin.employees.table.actions')].map((label, index) => <th key={label} className={`whitespace-nowrap p-4 font-medium ${index === 6 ? 'text-right' : ''}`}>{label}</th>)}</tr></thead>
        <tbody>{filtered.map(row => { const s = payrollSummary(row, month); return <tr key={row.id} className={`border-t border-stone-100 ${row.id === selected ? 'bg-wood-50' : ''}`}>
          <td className="p-4"><button onClick={() => setSelected(row.id)} className="text-left font-semibold text-wood-700">{row.name}</button><p className="text-xs text-stone-500">{row.position || t('admin.employees.table.noPosition')} · {row.isActive ? t('admin.employees.table.active') : t('admin.employees.table.inactive')}</p></td>
          <td className="p-4 whitespace-nowrap">{money(row.dailyRate)}</td><td className="p-4">{s.units}</td><td className="p-4 whitespace-nowrap">{money(s.wages)}</td><td className="p-4 whitespace-nowrap">{money(s.totalPaid)}</td><td className={`p-4 whitespace-nowrap font-medium ${s.closing > 0 ? 'text-green-700' : s.closing < 0 ? 'text-red-600' : 'text-stone-500'}`}>{s.closing.toLocaleString('vi-VN', { style: 'currency', currency: 'VND', signDisplay: 'exceptZero' })}</td><td className="p-4 text-right"><button type="button" className={`${tableIconButton} hover:bg-stone-100 hover:text-charcoal-700`} title={t('admin.employees.manager.details')} aria-label={t('admin.employees.manager.details')} onClick={() => setSelected(row.id)}>
            <svg aria-hidden="true" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M2.458 12C3.732 7.943 7.523 5 12 5s8.268 2.943 9.542 7C20.268 16.057 16.477 19 12 19S3.732 16.057 2.458 12Z" /><circle cx="12" cy="12" r="3" strokeWidth={1.8} /></svg>
          </button></td>
        </tr> })}{!filtered.length && <tr><td colSpan={7} className="p-8 text-center text-stone-500">{employees.length ? t('admin.employees.manager.noMatches') : t('admin.employees.manager.noEmployees')}</td></tr>}</tbody>
      </table>
    </div>
    {employee && (() => { const s = payrollSummary(employee, month); const payments = employee.payments.filter(row => row.date.startsWith(month)); return <section className="rounded-xl border border-stone-200 bg-white p-5 space-y-5">
      <div className="flex flex-wrap justify-between gap-3"><div><h2 className="text-xl font-semibold">{employee.name}</h2><p className="text-sm text-stone-500">{employee.phone || t('admin.employees.manager.noPhone')} · {employee.position || t('admin.employees.table.noPosition')}</p>{employee.notes && <p className="mt-2 text-sm whitespace-pre-wrap">{employee.notes}</p>}</div></div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">{[
        [t('admin.employees.manager.opening'), balance(s.opening)], [t('admin.employees.manager.wages'), money(s.wages)], [t('admin.employees.manager.advances'), money(s.advances)], [t('admin.employees.manager.salaryPaid'), money(s.salaryPaid)], [t('admin.employees.manager.monthlyPaid'), money(s.totalPaid)], [t('admin.employees.manager.closing'), balance(s.closing)], [t('admin.employees.manager.lifetimePaid'), money(s.lifetimePaid)], [t('admin.employees.manager.monthlyUnits'), String(s.units)],
      ].map(([label, value]) => <div key={label}><p className="text-stone-500">{label}</p><p className="mt-1 font-medium">{value}</p></div>)}</div>
      <p className="rounded-lg bg-stone-50 p-3 text-xs text-stone-500">{t('admin.employees.manager.payrollHelp')}</p>
      <div className="flex flex-wrap items-center justify-between gap-3"><h3 className="font-semibold">{t('admin.employees.manager.paymentsHeading').replace('{month}', () => month)}</h3><button className={button} onClick={() => open({ kind: 'payment', employee })}>{t('admin.employees.manager.addPaymentAction')}</button></div>
      <div className="overflow-x-auto"><table className="w-full text-sm text-left"><thead><tr>{[t('admin.employees.manager.date'), t('admin.employees.manager.paymentType'), t('admin.employees.manager.amount'), t('admin.employees.manager.notes'), t('admin.employees.table.actions')].map((label, index) => <th className={`p-2 text-stone-500 font-medium ${index === 4 ? 'text-right' : ''}`} key={label}>{label}</th>)}</tr></thead><tbody>{payments.map(row => <tr key={row.id} className="border-t border-stone-100"><td className="p-2 whitespace-nowrap">{row.date}</td><td className="p-2">{row.type === 'ADVANCE' ? t('admin.employees.manager.advance') : t('admin.employees.manager.salary')}</td><td className="p-2 whitespace-nowrap">{money(row.amount)}</td><td className="p-2">{row.notes}</td><td className="p-2 text-right"><button type="button" disabled={busy} className={`${tableIconButton} hover:bg-red-50 hover:text-red-600`} title={t('admin.employees.manager.delete')} aria-label={t('admin.employees.manager.delete')} onClick={() => remove('deletePayment', row.id)}>
        <svg aria-hidden="true" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 6h18M9 6V4h6v2M5 6l1 14h12l1-14M10 10v6m4-6v6" /></svg>
      </button></td></tr>)}{!payments.length && <tr><td colSpan={5} className="py-4 text-stone-500">{t('admin.employees.manager.noPayments')}</td></tr>}</tbody></table></div>
    </section> })()}
    </>}
    {editor && <EmployeeEditor editor={editor} month={month} busy={busy} error={error} onClose={() => setEditor(null)} onSave={save} />}
  </div>
}

function EmployeeEditor({ editor, month, busy, error, onClose, onSave }: { editor: Editor; month: string; busy: boolean; error: string; onClose: () => void; onSave: (payload: Record<string, unknown>) => Promise<void> }) {
  const { employee, kind } = editor
  const [date, setDate] = useState(editor.date || (today().startsWith(month) ? today() : `${month}-01`))
  const [paymentId] = useState(() => crypto.randomUUID())
  const existing = employee?.attendance.find(row => row.date === date)
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (busy) return
    const form = new FormData(event.currentTarget)
    const payload: Record<string, unknown> = Object.fromEntries(form)
    payload.employeeId = employee?.id
    payload.action = kind === 'profile' ? (employee ? 'update' : 'create') : kind
    if (kind === 'profile') { payload.dailyRate = Number(form.get('dailyRate')); payload.isActive = form.get('isActive') === 'on' }
    if (kind === 'attendance') { payload.date = date; payload.units = Number(form.get('units')); payload.dailyRate = Number(form.get('dailyRate')) }
    if (kind === 'payment') { payload.date = date; payload.amount = Number(form.get('amount')); payload.id = paymentId }
    await onSave(payload)
  }
  const title = kind === 'profile' ? employee ? t('admin.employees.manager.editEmployee') : t('admin.employees.table.add') : kind === 'attendance' ? t('admin.nav.employeeAttendance') : t('admin.employees.manager.recordPayment')
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"><section role="dialog" aria-modal="true" aria-labelledby="employee-editor-title" className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
    <h2 id="employee-editor-title" className="text-xl font-semibold mb-4">{kind === 'profile' ? title : t('admin.employees.manager.employeeEditorTitle').replace('{title}', () => title).replace('{name}', () => employee?.name || '')}</h2>
    <form onSubmit={submit} className="space-y-4">
      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
      <fieldset disabled={busy} className="space-y-4">
        {kind === 'profile' ? <>
          <Field label={t('admin.employees.manager.fullNameRequired')}><input autoFocus required maxLength={120} name="name" defaultValue={employee?.name} className={input} /></Field>
          <Field label={t('admin.employees.manager.phone')}><input type="tel" maxLength={30} name="phone" defaultValue={employee?.phone || ''} className={input} /></Field>
          <Field label={t('admin.employees.manager.position')}><input maxLength={120} name="position" defaultValue={employee?.position || ''} className={input} /></Field>
          <Field label={t('admin.employees.manager.dailyRateRequired')}><input type="number" required min={0} max={2000000000} step={1} name="dailyRate" defaultValue={employee?.dailyRate} className={input} /></Field>
          {employee && <><label className="flex items-center gap-2 text-sm"><input type="checkbox" name="isActive" defaultChecked={employee.isActive} />{t('admin.employees.manager.currentlyWorking')}</label><p className="text-xs text-stone-500">{t('admin.employees.manager.profileHelp')}</p></>}
        </> : <>
          <Field label={t('admin.employees.manager.dateRequired')}><input autoFocus required type="date" min="1900-01-01" max="2100-12-31" value={date} onChange={e => setDate(e.target.value)} className={input} /></Field>
          {kind === 'attendance' ? <div key={date} className="space-y-4">
            {existing && <p className="text-sm text-amber-700">{t('admin.employees.manager.attendanceExists')}</p>}
            <Field label={t('admin.employees.manager.unitsRequired')}><EmployeeSelect name="units" defaultValue={existing?.units ?? 1}>{[0, 0.5, 1, 1.5, 2].map(value => <option key={value} value={value}>{value === 0 ? t('admin.employees.manager.absent') : t('admin.employees.manager.workdayOption').replace('{units}', () => String(value))}</option>)}</EmployeeSelect></Field>
            <Field label={t('admin.employees.manager.dateRateRequired')}><input type="number" required min={0} max={2000000000} step={1} name="dailyRate" defaultValue={existing?.dailyRate ?? employee?.dailyRate} className={input} /></Field>
            <Field label={t('admin.employees.manager.notes')}><textarea name="notes" maxLength={2000} defaultValue={existing?.notes || ''} className={textarea} /></Field>
          </div> : <>
            <Field label={t('admin.employees.manager.paymentType')}><EmployeeSelect name="type"><option value="ADVANCE">{t('admin.employees.manager.advance')}</option><option value="SALARY">{t('admin.employees.manager.salary')}</option></EmployeeSelect></Field>
            <Field label={t('admin.employees.manager.amountRequired')}><input type="number" name="amount" required min={1} max={2000000000} step={1} className={input} /></Field>
            <p className="text-xs text-stone-500">{t('admin.employees.manager.paymentHelp')}</p>
          </>}
        </>}
        {kind !== 'attendance' && <Field label={t('admin.employees.manager.notes')}><textarea name="notes" maxLength={2000} defaultValue={kind === 'profile' ? employee?.notes || '' : ''} className={textarea} /></Field>}
      </fieldset>
      <div className="flex justify-end gap-3 pt-2"><button type="button" disabled={busy} onClick={onClose} className={secondary}>{t('admin.employees.manager.cancel')}</button><button type="submit" disabled={busy} className={button}>{busy ? t('admin.employees.manager.saving') : t('admin.employees.manager.save')}</button></div>
    </form>
  </section></div>
}
