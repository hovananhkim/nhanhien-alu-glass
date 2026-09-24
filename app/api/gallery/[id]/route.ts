import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/auth'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await getAdminSession()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const item = await prisma.galleryItem.update({
    where: { id: params.id },
    data: {
      ...(body.title       !== undefined && { title: body.title }),
      ...(body.description !== undefined && { description: body.description }),
      ...(body.imageUrl    !== undefined && { imageUrl: body.imageUrl }),
      ...(body.category    !== undefined && { category: body.category }),
      ...(body.featured    !== undefined && { featured: body.featured }),
      ...(body.order       !== undefined && { order: body.order }),
    },
  })
  return NextResponse.json(item)
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await getAdminSession()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await prisma.galleryItem.delete({ where: { id: params.id } })
  return NextResponse.json({ success: true })
}