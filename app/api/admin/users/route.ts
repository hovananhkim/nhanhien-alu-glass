import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/auth'

export async function GET() {
  const session = await getAdminSession()
  if (!session?.isSuperAdmin) {
    return NextResponse.json({ error: 'Super admin access required.' }, { status: 403 })
  }

  const admins = await prisma.admin.findMany({
    orderBy: [{ isSuperAdmin: 'desc' }, { isActive: 'desc' }, { createdAt: 'asc' }],
    select: {
      id: true, name: true, email: true,
      role: true, isActive: true, isSuperAdmin: true,
      createdAt: true, updatedAt: true,
    },
  })

  return NextResponse.json(admins)
}
