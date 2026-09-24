import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/auth'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await getAdminSession()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { isRead } = await req.json()
  const inquiry = await prisma.inquiry.update({
    where: { id: params.id },
    data: { isRead },
  })
  return NextResponse.json(inquiry)
}
// Marks a specific inquiry read/unread for admin users.
