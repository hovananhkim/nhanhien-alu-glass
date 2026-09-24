import { redirect } from 'next/navigation'
import { getAdminSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import UsersManager from '@/components/admin/UsersManager'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Team | Admin' }

export default async function AdminUsersPage() {
  const session = await getAdminSession()
  // Double guard — middleware handles token, this handles role
  if (!session?.isSuperAdmin) redirect('/admin')

  const admins = await prisma.admin.findMany({
    orderBy: [{ isSuperAdmin: 'desc' }, { isActive: 'desc' }, { createdAt: 'asc' }],
    select: {
      id: true, name: true, email: true,
      role: true, isActive: true, isSuperAdmin: true,
      createdAt: true,
    },
  })

  const pending  = admins.filter(a => !a.isActive).length
  const active   = admins.filter(a => a.isActive).length

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-display font-semibold text-charcoal-800">Team</h1>
        <p className="text-stone-400 text-sm mt-1">
          {active} active · {pending > 0
            ? <span className="text-amber-600 font-semibold">{pending} pending approval</span>
            : '0 pending'
          }
        </p>
      </div>
      <UsersManager
        initialAdmins={JSON.parse(JSON.stringify(admins))}
        currentAdminId={session.id}
      />
    </div>
  )
}
