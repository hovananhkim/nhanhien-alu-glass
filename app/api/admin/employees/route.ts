import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { getAdminSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { validBusinessDate } from '@/lib/employees'

export const dynamic = 'force-dynamic'
const include = { attendance: { orderBy: { date: 'desc' as const } }, payments: { orderBy: { date: 'desc' as const } } }
const fail = (error: string, status = 400) => NextResponse.json({ error }, { status })
const money = (value: unknown) => typeof value === 'number' && Number.isInteger(value) && value >= 0 && value <= 2_000_000_000
const optionalText = (value: unknown, max: number) => value === undefined || value === null || (typeof value === 'string' && value.length <= max)

export async function GET() {
  if (!await getAdminSession()) return fail('Vui lòng đăng nhập bằng tài khoản quản trị.', 401)
  return NextResponse.json(await prisma.employee.findMany({ include, orderBy: [{ isActive: 'desc' }, { name: 'asc' }] }))
}

export async function POST(req: NextRequest) {
  if (!await getAdminSession()) return fail('Vui lòng đăng nhập bằng tài khoản quản trị.', 401)
  try {
    const body = await req.json()
    if (!body || typeof body !== 'object' || Array.isArray(body)) return fail('Dữ liệu không hợp lệ.')
    const { action, employeeId } = body
    if (action === 'create' || action === 'update') {
      if (typeof body.name !== 'string' || !body.name.trim() || body.name.length > 120 || !money(body.dailyRate)
        || !optionalText(body.phone, 30) || !optionalText(body.position, 120) || !optionalText(body.notes, 2000)
        || (action === 'update' && (typeof employeeId !== 'string' || typeof body.isActive !== 'boolean'))) return fail('Kiểm tra họ tên, đơn giá và thông tin nhân viên.')
      const data = { name: body.name.trim(), dailyRate: body.dailyRate as number, phone: body.phone?.trim() || null,
        position: body.position?.trim() || null, notes: body.notes?.trim() || null }
      const employee = action === 'create'
        ? await prisma.employee.create({ data, include })
        : await prisma.employee.update({ where: { id: employeeId }, data: { ...data, isActive: body.isActive }, include })
      return NextResponse.json(employee)
    }
    if (typeof employeeId !== 'string') return fail('Thiếu nhân viên.')
    if (!await prisma.employee.findUnique({ where: { id: employeeId } })) return fail('Không tìm thấy nhân viên.', 404)
    if (action === 'attendance') {
      if (!validBusinessDate(body.date) || !money(body.dailyRate) || typeof body.units !== 'number'
        || ![0, 0.5, 1, 1.5, 2].includes(body.units) || !optionalText(body.notes, 2000)) return fail('Ngày, số công hoặc đơn giá không hợp lệ.')
      const data = { units: body.units as number, dailyRate: body.dailyRate as number, notes: body.notes?.trim() || null }
      await prisma.employeeAttendance.upsert({ where: { employeeId_date: { employeeId, date: body.date } },
        create: { employeeId, date: body.date, ...data }, update: data })
    } else if (action === 'payment') {
      if (!validBusinessDate(body.date) || !money(body.amount) || body.amount === 0 || !['ADVANCE', 'SALARY'].includes(body.type)
        || typeof body.id !== 'string' || !/^[0-9a-f-]{36}$/i.test(body.id) || !optionalText(body.notes, 2000)) return fail('Ngày, loại chi hoặc số tiền không hợp lệ.')
      const data = { id: body.id as string, employeeId, date: body.date, type: body.type as string, amount: body.amount as number, notes: body.notes?.trim() || null }
      const existing = await prisma.employeePayment.findUnique({ where: { id: body.id } })
      if (existing && (existing.employeeId !== employeeId || existing.date !== data.date || existing.amount !== data.amount || existing.type !== data.type || existing.notes !== data.notes)) return fail('Mã giao dịch đã được sử dụng.', 409)
      if (!existing) await prisma.employeePayment.create({ data })
    } else if (action === 'deleteAttendance' || action === 'deletePayment') {
      if (typeof body.id !== 'string') return fail('Thiếu bản ghi.')
      if (action === 'deleteAttendance') await prisma.employeeAttendance.deleteMany({ where: { id: body.id, employeeId } })
      else await prisma.employeePayment.deleteMany({ where: { id: body.id, employeeId } })
    } else return fail('Thao tác không hợp lệ.')
    return NextResponse.json(await prisma.employee.findUnique({ where: { id: employeeId }, include }))
  } catch (error) {
    if (error instanceof SyntaxError) return fail('Dữ liệu JSON không hợp lệ.')
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') return fail('Không tìm thấy nhân viên.', 404)
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') return fail('Bản ghi đã tồn tại. Vui lòng tải lại dữ liệu.', 409)
    console.error('Employee operation failed', error)
    return fail('Không thể lưu dữ liệu. Vui lòng thử lại.', 500)
  }
}
