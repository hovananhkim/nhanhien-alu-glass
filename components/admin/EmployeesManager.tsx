'use client'

import { useState, type FormEvent, type ReactNode } from 'react'
import { payrollSummary, type Employee } from '@/lib/employees'

const money = (value: number) => value.toLocaleString('vi-VN') + ' ₫'
const today = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date())
const input = 'w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-charcoal-800'
const button = 'rounded-lg bg-charcoal-800 hover:bg-charcoal-900 px-4 py-2 text-sm font-medium text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
const secondary = 'rounded-lg border border-stone-300 px-3 py-2 text-sm hover:bg-stone-100 disabled:opacity-50'
const balance = (value: number) => value > 0 ? `Còn phải trả ${money(value)}` : value < 0 ? `Đã trả dư ${money(-value)}` : 'Đã cân đối'
function Field({ label, children }: { label: string; children: ReactNode }) {
  return <label className="block space-y-1 text-sm text-stone-600"><span>{label}</span>{children}</label>
}
type Editor = { kind: 'profile' | 'attendance' | 'payment'; employee?: Employee; date?: string }

export default function EmployeesManager({ initialEmployees }: { initialEmployees: Employee[] }) {
  const [employees, setEmployees] = useState(initialEmployees)
  const [selected, setSelected] = useState(initialEmployees[0]?.id || '')
  const [month, setMonth] = useState(today().slice(0, 7))
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [editor, setEditor] = useState<Editor | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const employee = employees.find(row => row.id === selected)
  const filtered = employees.filter(row => `${row.name} ${row.phone || ''}`.toLocaleLowerCase('vi').includes(search.toLocaleLowerCase('vi')) && (status === 'all' || row.isActive === (status === 'active')))
  const totals = filtered.reduce((sum, row) => {
    const s = payrollSummary(row, month)
    return { wages: sum.wages + s.wages, paid: sum.paid + s.totalPaid, owed: sum.owed + Math.max(s.closing, 0), excess: sum.excess + Math.max(-s.closing, 0) }
  }, { wages: 0, paid: 0, owed: 0, excess: 0 })

  function open(value: Editor) { setError(''); setNotice(''); setEditor(value) }
  async function save(payload: Record<string, unknown>) {
    setBusy(true); setError(''); setNotice('')
    try {
      const response = await fetch('/api/admin/employees', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Không thể lưu dữ liệu.')
      setEmployees(rows => rows.some(row => row.id === data.id) ? rows.map(row => row.id === data.id ? data : row) : [...rows, data])
      setSelected(data.id); setEditor(null); setNotice('Đã lưu dữ liệu.')
    } catch (err) { setError(err instanceof Error ? err.message : 'Không thể kết nối. Vui lòng thử lại.') }
    finally { setBusy(false) }
  }
  async function remove(action: string, id: string) {
    if (!employee || !window.confirm('Xóa bản ghi này? Tổng kết tiền lương sẽ được tính lại.')) return
    await save({ action, id, employeeId: employee.id })
  }

  return <div className="p-4 md:p-8 space-y-6">
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div><h1 className="text-2xl font-display font-semibold text-charcoal-800">Nhân viên</h1><p className="mt-1 text-sm text-stone-500">Hồ sơ, chấm công và tiền lương. Nhân viên không có tài khoản đăng nhập.</p></div>
      <button className={button} onClick={() => open({ kind: 'profile' })}>+ Thêm nhân viên</button>
    </div>
    {!editor && error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-red-700">{error}</p>}
    {notice && <p role="status" className="rounded-lg bg-green-50 p-3 text-green-700">{notice}</p>}
    <div className="flex flex-wrap gap-3">
      <Field label="Tháng tổng kết"><input type="month" min="1900-01" max="2100-12" className={input} value={month} onChange={e => { if (/^\d{4}-\d{2}$/.test(e.target.value)) setMonth(e.target.value) }} /></Field>
      <Field label="Tìm nhân viên"><input className={input} placeholder="Tên hoặc số điện thoại" value={search} onChange={e => setSearch(e.target.value)} /></Field>
      <Field label="Trạng thái"><select className={input} value={status} onChange={e => setStatus(e.target.value)}><option value="all">Tất cả</option><option value="active">Đang làm</option><option value="inactive">Đã nghỉ</option></select></Field>
    </div>
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{[['Lương phát sinh trong tháng', totals.wages], ['Tổng đã trả trong tháng', totals.paid], ['Còn phải trả cuối tháng', totals.owed], ['Đã trả dư cuối tháng', totals.excess]].map(([label, value]) => <div key={label} className="rounded-xl border border-stone-200 bg-white p-4"><p className="text-xs text-stone-500">{label}</p><p className="mt-2 text-xl font-semibold">{money(Number(value))}</p></div>)}</div>
    <p className="text-xs text-stone-500">Tổng hợp theo danh sách đang lọc. Số dư cuối tháng đã bao gồm các tháng trước. Tổng đã trả = tiền ứng + tiền lương đã thanh toán.</p>
    <div className="overflow-x-auto rounded-xl border border-stone-200 bg-white">
      <table className="w-full text-left text-sm"><thead className="bg-stone-100 text-stone-500"><tr>{['Nhân viên', 'Đơn giá / công', 'Số công', 'Lương tháng', 'Đã trả tháng', 'Tổng kết cuối tháng', ''].map(label => <th key={label} className="whitespace-nowrap p-4 font-medium">{label}</th>)}</tr></thead>
        <tbody>{filtered.map(row => { const s = payrollSummary(row, month); return <tr key={row.id} className={`border-t border-stone-100 ${row.id === selected ? 'bg-wood-50' : ''}`}>
          <td className="p-4"><button onClick={() => setSelected(row.id)} className="text-left font-semibold text-wood-700">{row.name}</button><p className="text-xs text-stone-500">{row.position || 'Chưa có chức vụ'} · {row.isActive ? 'Đang làm' : 'Đã nghỉ'}</p></td>
          <td className="p-4 whitespace-nowrap">{money(row.dailyRate)}</td><td className="p-4">{s.units}</td><td className="p-4 whitespace-nowrap">{money(s.wages)}</td><td className="p-4 whitespace-nowrap">{money(s.totalPaid)}</td><td className="p-4 whitespace-nowrap">{balance(s.closing)}</td><td className="p-4"><button className={secondary} onClick={() => setSelected(row.id)}>Chi tiết</button></td>
        </tr> })}{!filtered.length && <tr><td colSpan={7} className="p-8 text-center text-stone-500">{employees.length ? 'Không có nhân viên phù hợp.' : 'Chưa có nhân viên. Thêm nhân viên để bắt đầu chấm công.'}</td></tr>}</tbody>
      </table>
    </div>
    {employee && (() => { const s = payrollSummary(employee, month); const attendance = employee.attendance.filter(row => row.date.startsWith(month)); const payments = employee.payments.filter(row => row.date.startsWith(month)); return <section className="rounded-xl border border-stone-200 bg-white p-5 space-y-5">
      <div className="flex flex-wrap justify-between gap-3"><div><h2 className="text-xl font-semibold">{employee.name}</h2><p className="text-sm text-stone-500">{employee.phone || 'Chưa có số điện thoại'} · {employee.position || 'Chưa có chức vụ'}</p>{employee.notes && <p className="mt-2 text-sm whitespace-pre-wrap">{employee.notes}</p>}</div><button className={secondary} onClick={() => open({ kind: 'profile', employee })}>Sửa hồ sơ</button></div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">{[
        ['Đầu tháng', balance(s.opening)], ['Lương phát sinh', money(s.wages)], ['Tiền ứng trong tháng', money(s.advances)], ['Lương đã thanh toán', money(s.salaryPaid)], ['Tổng đã trả trong tháng', money(s.totalPaid)], ['Cuối tháng', balance(s.closing)], ['Tổng đã trả từ trước đến nay', money(s.lifetimePaid)], ['Số công trong tháng', String(s.units)],
      ].map(([label, value]) => <div key={label}><p className="text-stone-500">{label}</p><p className="mt-1 font-medium">{value}</p></div>)}</div>
      <p className="rounded-lg bg-stone-50 p-3 text-xs text-stone-500">Lương = số công × đơn giá từng ngày (làm tròn đến đồng). Còn phải trả = số dư đầu tháng + lương − tiền ứng − lương đã thanh toán. Nếu âm, nhân viên đã nhận dư/ứng trước số tiền đó.</p>
      <div className="flex flex-wrap items-center justify-between gap-3"><h3 className="font-semibold">Chấm công · {month}</h3><button className={button} onClick={() => open({ kind: 'attendance', employee })}>+ Chấm công</button></div>
      <div className="overflow-x-auto"><table className="w-full text-sm text-left"><thead><tr>{['Ngày', 'Số công', 'Đơn giá', 'Thành tiền', 'Ghi chú', 'Thao tác'].map(label => <th className="p-2 text-stone-500 font-medium" key={label}>{label}</th>)}</tr></thead><tbody>{attendance.map(row => <tr key={row.id} className="border-t border-stone-100"><td className="p-2 whitespace-nowrap">{row.date}</td><td className="p-2">{row.units}</td><td className="p-2 whitespace-nowrap">{money(row.dailyRate)}</td><td className="p-2 whitespace-nowrap">{money(Math.round(row.units * row.dailyRate))}</td><td className="p-2">{row.notes}</td><td className="p-2 whitespace-nowrap"><button className="text-wood-700 mr-3" onClick={() => open({ kind: 'attendance', employee, date: row.date })}>Sửa</button><button disabled={busy} className="text-red-600" onClick={() => remove('deleteAttendance', row.id)}>Xóa</button></td></tr>)}{!attendance.length && <tr><td colSpan={6} className="py-4 text-stone-500">Chưa có chấm công trong tháng này.</td></tr>}</tbody></table></div>
      <div className="flex flex-wrap items-center justify-between gap-3"><h3 className="font-semibold">Tiền ứng & thanh toán · {month}</h3><button className={button} onClick={() => open({ kind: 'payment', employee })}>+ Ghi nhận chi tiền</button></div>
      <div className="overflow-x-auto"><table className="w-full text-sm text-left"><thead><tr>{['Ngày', 'Loại chi', 'Số tiền', 'Ghi chú', 'Thao tác'].map(label => <th className="p-2 text-stone-500 font-medium" key={label}>{label}</th>)}</tr></thead><tbody>{payments.map(row => <tr key={row.id} className="border-t border-stone-100"><td className="p-2 whitespace-nowrap">{row.date}</td><td className="p-2">{row.type === 'ADVANCE' ? 'Ứng lương' : 'Trả lương'}</td><td className="p-2 whitespace-nowrap">{money(row.amount)}</td><td className="p-2">{row.notes}</td><td className="p-2"><button disabled={busy} className="text-red-600" onClick={() => remove('deletePayment', row.id)}>Xóa</button></td></tr>)}{!payments.length && <tr><td colSpan={5} className="py-4 text-stone-500">Chưa có khoản chi trong tháng này.</td></tr>}</tbody></table></div>
    </section> })()}
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
  const title = kind === 'profile' ? employee ? 'Sửa hồ sơ nhân viên' : 'Thêm nhân viên' : kind === 'attendance' ? 'Chấm công' : 'Ghi nhận chi tiền'
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"><section role="dialog" aria-modal="true" aria-labelledby="employee-editor-title" className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
    <h2 id="employee-editor-title" className="text-xl font-semibold mb-4">{title}{kind !== 'profile' ? ` — ${employee?.name}` : ''}</h2>
    <form onSubmit={submit} className="space-y-4">
      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
      <fieldset disabled={busy} className="space-y-4">
        {kind === 'profile' ? <>
          <Field label="Họ tên *"><input autoFocus required maxLength={120} name="name" defaultValue={employee?.name} className={input} /></Field>
          <Field label="Số điện thoại"><input type="tel" maxLength={30} name="phone" defaultValue={employee?.phone || ''} className={input} /></Field>
          <Field label="Chức vụ / công việc"><input maxLength={120} name="position" defaultValue={employee?.position || ''} className={input} /></Field>
          <Field label="Đơn giá mỗi công (VNĐ) *"><input type="number" required min={0} max={2000000000} step={1} name="dailyRate" defaultValue={employee?.dailyRate} className={input} /></Field>
          {employee && <><label className="flex items-center gap-2 text-sm"><input type="checkbox" name="isActive" defaultChecked={employee.isActive} />Đang làm việc</label><p className="text-xs text-stone-500">Bỏ chọn khi nhân viên nghỉ việc. Lịch sử công và thanh toán vẫn được giữ lại. Đổi đơn giá chỉ áp dụng cho các ngày chấm công mới.</p></>}
        </> : <>
          <Field label="Ngày *"><input autoFocus required type="date" min="1900-01-01" max="2100-12-31" value={date} onChange={e => setDate(e.target.value)} className={input} /></Field>
          {kind === 'attendance' ? <div key={date} className="space-y-4">
            {existing && <p className="text-sm text-amber-700">Ngày này đã có chấm công. Lưu sẽ cập nhật bản ghi hiện tại.</p>}
            <Field label="Số công *"><select name="units" defaultValue={existing?.units ?? 1} className={input}>{[0, 0.5, 1, 1.5, 2].map(value => <option key={value} value={value}>{value === 0 ? '0 — Nghỉ' : `${value} công`}</option>)}</select></Field>
            <Field label="Đơn giá ngày này (VNĐ) *"><input type="number" required min={0} max={2000000000} step={1} name="dailyRate" defaultValue={existing?.dailyRate ?? employee?.dailyRate} className={input} /></Field>
            <Field label="Ghi chú"><textarea name="notes" maxLength={2000} defaultValue={existing?.notes || ''} className={input} /></Field>
          </div> : <>
            <Field label="Loại chi"><select name="type" className={input}><option value="ADVANCE">Ứng lương</option><option value="SALARY">Trả lương</option></select></Field>
            <Field label="Số tiền đã chi (VNĐ) *"><input type="number" name="amount" required min={1} max={2000000000} step={1} className={input} /></Field>
            <p className="text-xs text-stone-500">Chỉ nhập khoản thực tế vừa chi. Tiền ứng đã ghi nhận được trừ riêng, không cộng lại vào khoản trả lương.</p>
          </>}
        </>}
        {kind !== 'attendance' && <Field label="Ghi chú"><textarea name="notes" maxLength={2000} defaultValue={kind === 'profile' ? employee?.notes || '' : ''} className={input} /></Field>}
      </fieldset>
      <div className="flex justify-end gap-3 pt-2"><button type="button" disabled={busy} onClick={onClose} className={secondary}>Hủy</button><button type="submit" disabled={busy} className={button}>{busy ? 'Đang lưu…' : 'Lưu'}</button></div>
    </form>
  </section></div>
}
