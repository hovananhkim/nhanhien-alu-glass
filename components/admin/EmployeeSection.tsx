import { redirect } from 'next/navigation'
import { getAdminSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import EmployeesManager from '@/components/admin/EmployeesManager'

export default async function EmployeeSection({ view = 'all' }: { view?: 'all' | 'attendance' | 'payments' }) {
  if (!await getAdminSession()) redirect('/admin/login')
  const employees = await prisma.employee.findMany({
    orderBy: [{ isActive: 'desc' }, { name: 'asc' }],
    include: { attendance: { orderBy: { date: 'desc' } }, payments: { orderBy: { date: 'desc' } } },
  })
  return <EmployeesManager view={view} initialEmployees={JSON.parse(JSON.stringify(employees))} />
}
