import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getAdminSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import EmployeesManager from '@/components/admin/EmployeesManager'

export const metadata: Metadata = { title: 'Nhân viên | Admin' }
export default async function EmployeesPage() {
  if (!await getAdminSession()) redirect('/admin/login')
  const employees = await prisma.employee.findMany({
    orderBy: [{ isActive: 'desc' }, { name: 'asc' }],
    include: { attendance: { orderBy: { date: 'desc' } }, payments: { orderBy: { date: 'desc' } } },
  })
  return <EmployeesManager initialEmployees={JSON.parse(JSON.stringify(employees))} />
}
