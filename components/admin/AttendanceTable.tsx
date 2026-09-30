'use client'

import { currentBusinessMonth, type Employee } from '@/lib/employees'

interface Props {
  employees: Employee[]
  month: string
  currentMonth?: string
  busy: boolean
  onToggle: (employee: Employee, date: string, checked: boolean) => void
}

export default function AttendanceTable({ employees, month, currentMonth = currentBusinessMonth(), busy, onToggle }: Props) {
  const [year, monthNumber] = month.split('-').map(Number)
  const days = Array.from({ length: new Date(Date.UTC(year, monthNumber, 0)).getUTCDate() }, (_, i) => i + 1)

  if (month > currentMonth) return null

  return <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
    <div className="overflow-x-auto" tabIndex={0} role="region" aria-label={`Bảng chấm công tháng ${month}`}>
      <table className="w-full min-w-[760px] table-fixed text-xs">
        <caption className="sr-only">Chấm công tháng {month}. Tích chọn tương ứng một công.</caption>
        <colgroup>
          <col className="w-32 xl:w-40" />
          {days.map(day => <col key={day} />)}
          <col className="w-14" />
        </colgroup>
        <thead>
          <tr className="border-b border-stone-100">
            <th scope="col" className="sticky left-0 z-10 bg-white px-3 py-3 text-left text-xs font-semibold text-stone-400 uppercase tracking-wider">Nhân viên</th>
            {days.map(day => <th scope="col" key={day} className="px-0 py-3 text-center text-xs font-semibold text-stone-400">{day}</th>)}
            <th scope="col" className="sticky right-0 z-10 bg-white px-1 py-3 text-center text-xs font-semibold text-stone-400 uppercase tracking-normal">Tổng công</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-50">
          {employees.map(employee => {
            const entries = new Map(employee.attendance.filter(row => row.date.startsWith(`${month}-`)).map(row => [row.date, row]))
            const total = Array.from(entries.values()).reduce((sum, row) => sum + row.units, 0)
            return <tr key={employee.id} className="group hover:bg-stone-50 transition-colors">
              <th scope="row" className="sticky left-0 z-10 bg-white group-hover:bg-stone-50 px-3 py-3 text-left font-medium text-charcoal-800">
                <span className="block truncate" title={employee.name}>{employee.name}</span>
                {!employee.isActive && <span className="block text-xs font-normal text-stone-400 mt-0.5">Đã nghỉ</span>}
              </th>
              {days.map(day => {
                const date = `${month}-${String(day).padStart(2, '0')}`
                const entry = entries.get(date)
                const units = entry?.units || 0
                return <td key={date} className="px-0 py-3 text-center">
                  <label className="inline-flex w-full min-h-6 flex-col items-center justify-center gap-1" title={`${employee.name} · ${day}/${monthNumber}/${year} · ${units} công`}>
                    <input type="checkbox" checked={units > 0} disabled={busy || !employee.isActive || month !== currentMonth} onChange={event => onToggle(employee, date, event.target.checked)} aria-label={`${employee.name}, ngày ${day}/${monthNumber}/${year}, ${units} công`} className="h-3.5 w-3.5 accent-charcoal-800 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50" />
                    {units > 0 && units !== 1 && <span className="text-[10px] text-stone-500">{units}</span>}
                  </label>
                </td>
              })}
              <td className="sticky right-0 z-10 bg-white group-hover:bg-stone-50 px-1 py-3 text-center font-semibold text-charcoal-800">{total.toLocaleString('vi-VN')}</td>
            </tr>
          })}
          {!employees.length && <tr><td colSpan={days.length + 2} className="py-16 px-6 text-center text-stone-400">Không có nhân viên để chấm công.</td></tr>}
        </tbody>
      </table>
    </div>
  </div>
}
