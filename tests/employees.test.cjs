const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const os = require('node:os')
const { execFileSync } = require('node:child_process')
const ts = require('typescript')
const { PrismaClient } = require('@prisma/client')
const { NextRequest } = require('next/server')

function loadTS(file, overrides = {}) {
  const source = ts.transpileModule(fs.readFileSync(path.join(__dirname, '..', file), 'utf8'), {
    compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText
  const module = { exports: {} }
  new Function('require', 'module', 'exports', source)(name => overrides[name] || require(name), module, module.exports)
  return module.exports
}
const { payrollSummary, validBusinessDate } = loadTS('lib/employees.ts')

test('payroll carries prior debt/overpayment and counts advances only once', () => {
  const employee = {
    attendance: [{ date: '2026-08-31', units: 1, dailyRate: 500000 }, { date: '2026-09-01', units: 0.5, dailyRate: 600001 }],
    payments: [{ date: '2026-08-31', type: 'ADVANCE', amount: 700000 }, { date: '2026-09-02', type: 'SALARY', amount: 50000 }, { date: '2026-10-01', type: 'SALARY', amount: 123 }],
  }
  assert.deepEqual(payrollSummary(employee, '2026-09'), {
    opening: -200000, units: 0.5, wages: 300001, advances: 0, salaryPaid: 50000,
    totalPaid: 50000, closing: 50001, lifetimePaid: 750123,
  })
  assert.equal(payrollSummary(employee, '2026-10').opening, 50001)
  assert.equal(payrollSummary({ attendance: [], payments: [] }, '2026-09').closing, 0)
})

test('business dates reject normalized invalid dates', () => {
  for (const value of ['2026-02-29', '2026-04-31', '2026-13-01', '', null, '2026-1-01']) assert.equal(validBusinessDate(value), false)
  assert.equal(validBusinessDate('2028-02-29'), true)
})

test('employee API: authorization, independent profiles, attendance history, payments and validation', async () => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'employee-test-'))
  fs.writeFileSync(path.join(temp, 'test.db'), '')
  const url = `file:${path.join(temp, 'test.db')}`
  execFileSync(process.execPath, ['node_modules/prisma/build/index.js', 'db', 'push', '--skip-generate'], {
    cwd: path.join(__dirname, '..'), env: { ...process.env, DATABASE_URL: url }, stdio: 'pipe',
  })
  const prisma = new PrismaClient({ datasources: { db: { url } } })
  let authenticated = false
  const api = loadTS('app/api/admin/employees/route.ts', {
    '@/lib/auth': { getAdminSession: async () => authenticated ? { id: 'admin' } : null },
    '@/lib/prisma': { prisma }, '@/lib/employees': { validBusinessDate },
  })
  const post = body => api.POST(new NextRequest('http://localhost/api/admin/employees', { method: 'POST', body: JSON.stringify(body) }))
  try {
    assert.equal((await api.GET()).status, 401)
    assert.equal((await post({ action: 'create' })).status, 401)
    authenticated = true
    let response = await post({ action: 'create', name: 'Nguyễn Văn A', dailyRate: 500000 })
    assert.equal(response.status, 200)
    const employee = await response.json()
    assert.equal(await prisma.admin.count(), 0, 'No login account is created')
    const employeeId = employee.id
    assert.equal((await post({ action: 'attendance', employeeId, date: '2026-09-01', units: 1, dailyRate: 500000 })).status, 200)
    await post({ action: 'attendance', employeeId, date: '2026-09-01', units: 0.5, dailyRate: 500000 })
    assert.equal(await prisma.employeeAttendance.count(), 1)
    await post({ action: 'update', employeeId, name: employee.name, dailyRate: 600000, isActive: false })
    assert.equal((await prisma.employeeAttendance.findFirst()).dailyRate, 500000)
    const payment = { action: 'payment', employeeId, id: '12345678-1234-1234-1234-123456789012', date: '2026-09-02', type: 'ADVANCE', amount: 100000 }
    assert.equal((await post(payment)).status, 200)
    assert.equal((await post(payment)).status, 200)
    assert.equal(await prisma.employeePayment.count(), 1)
    assert.equal((await post({ ...payment, amount: 200000 })).status, 409)
    for (const bad of [
      { action: 'create', name: '', dailyRate: 100 },
      { action: 'create', name: 'A', dailyRate: -1 },
      { ...payment, amount: 0 }, { ...payment, amount: 1.5 }, { ...payment, type: 'OTHER' },
      { action: 'attendance', employeeId, date: '2026-02-30', units: 1, dailyRate: 500000 },
      { action: 'attendance', employeeId, date: '2026-09-02', units: -1, dailyRate: 500000 },
      { action: 'attendance', employeeId, date: '2026-09-02', units: 0.3, dailyRate: 500000 },
    ]) assert.equal((await post(bad)).status, 400)
    assert.equal((await post({ ...payment, employeeId: 'missing' })).status, 404)
    const rows = await (await api.GET()).json()
    assert.equal(rows[0].isActive, false)
    assert.equal(payrollSummary(rows[0], '2026-09').closing, 150000)
    const other = await (await post({ action: 'create', name: 'B', dailyRate: 100 })).json()
    await post({ action: 'deletePayment', employeeId: other.id, id: payment.id })
    assert.equal(await prisma.employeePayment.count(), 1, 'Cannot delete another employee payment')
    await post({ action: 'deletePayment', employeeId, id: payment.id })
    await post({ action: 'deleteAttendance', employeeId, id: rows[0].attendance[0].id })
    assert.equal(await prisma.employeePayment.count(), 0)
    assert.equal(await prisma.employeeAttendance.count(), 0)
  } finally {
    await prisma.$disconnect()
    fs.rmSync(temp, { recursive: true, force: true })
  }
})


test('attendance grid follows month length, leap years and existing fractional work', () => {
  const React = require('react')
  const { renderToStaticMarkup } = require('react-dom/server')
  const Table = loadTS('components/admin/AttendanceTable.tsx').default
  const employee = { id: 'e1', name: 'Nhân viên A', isActive: true, attendance: [
    { date: '2026-09-01', units: 1 }, { date: '2026-09-02', units: 0.5 }, { date: '2026-08-01', units: 2 },
  ] }
  for (const [month, days] of [['2026-02', 28], ['2028-02', 29], ['2026-09', 30], ['2026-12', 31], ['2100-02', 28]]) {
    const html = renderToStaticMarkup(React.createElement(Table, { employees: [employee], month, busy: false, onToggle() {} }))
    assert.equal((html.match(/type="checkbox"/g) || []).length, days)
    assert.equal((html.match(/scope="col"/g) || []).length, days + 2)
    if (month === '2026-09') {
      assert.equal((html.match(/checked=""/g) || []).length, 2)
      assert.match(html, />1,5<\/td>/)
    }
  }
  const empty = renderToStaticMarkup(React.createElement(Table, { employees: [], month: '2026-09', busy: false, onToggle() {} }))
  assert.match(empty, /colSpan="32"/i)
  const busy = renderToStaticMarkup(React.createElement(Table, { employees: [employee], month: '2026-09', busy: true, onToggle() {} }))
  assert.equal((busy.match(/disabled=""/g) || []).length, 30)
})
