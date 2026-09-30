export interface Attendance {
  id: string; date: string; units: number; dailyRate: number; notes: string | null
}
export interface Payment {
  id: string; date: string; type: string; amount: number; notes: string | null
}
export interface Employee {
  id: string; name: string; phone: string | null; position: string | null
  notes: string | null; dailyRate: number; isActive: boolean
  attendance: Attendance[]; payments: Payment[]
}

export function payrollSummary(employee: Pick<Employee, 'attendance' | 'payments'>, month: string) {
  const before = (date: string) => date.slice(0, 7) < month
  const within = (date: string) => date.slice(0, 7) === month
  const earned = (rows: Attendance[]) => rows.reduce((sum, row) => sum + Math.round(row.units * row.dailyRate), 0)
  const paid = (rows: Payment[]) => rows.reduce((sum, row) => sum + row.amount, 0)
  const attendance = employee.attendance.filter(row => within(row.date))
  const payments = employee.payments.filter(row => within(row.date))
  const opening = earned(employee.attendance.filter(row => before(row.date))) - paid(employee.payments.filter(row => before(row.date)))
  const wages = earned(attendance)
  const advances = paid(payments.filter(row => row.type === 'ADVANCE'))
  const salaryPaid = paid(payments.filter(row => row.type === 'SALARY'))
  return { opening, units: attendance.reduce((sum, row) => sum + row.units, 0), wages, advances, salaryPaid,
    totalPaid: advances + salaryPaid, closing: opening + wages - advances - salaryPaid,
    lifetimePaid: paid(employee.payments) }
}

export function validBusinessDate(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const date = new Date(`${value}T00:00:00Z`)
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value && value >= '1900-01-01' && value <= '2100-12-31'
}

// Business month is based on Vietnam time on both client and server.
export function currentBusinessMonth(now = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Ho_Chi_Minh', year: 'numeric', month: '2-digit',
  }).formatToParts(now)
  return `${parts.find(part => part.type === 'year')!.value}-${parts.find(part => part.type === 'month')!.value}`
}
