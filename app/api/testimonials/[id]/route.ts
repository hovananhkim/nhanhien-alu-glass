import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/auth'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await getAdminSession()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  const item = await prisma.testimonial.update({
    where: { id: params.id },
    data: {
      ...(body.name     !== undefined && { name:     body.name }),
      ...(body.role     !== undefined && { role:     body.role }),
      ...(body.location !== undefined && { location: body.location }),
      ...(body.quote    !== undefined && { quote:    body.quote }),
      ...(body.rating   !== undefined && { rating:   body.rating }),
      ...(body.featured !== undefined && { featured: body.featured }),
      ...(body.order    !== undefined && { order:    body.order }),
    },
  })
  return NextResponse.json(item)
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await getAdminSession()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  await prisma.testimonial.delete({ where: { id: params.id } })
  return NextResponse.json({ success: true })
}
