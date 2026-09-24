import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/auth'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await getAdminSession()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  // Patch only provided fields and regenerate slug when name changes.
  const category = await prisma.category.update({
    where: { id: params.id },
    data: {
      ...(body.name && { name: body.name, slug: body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') }),
      ...(body.description !== undefined && { description: body.description }),
      ...(body.imageUrl !== undefined && { imageUrl: body.imageUrl }),
    },
  })
  return NextResponse.json(category)
}
// Updates a category by id for authenticated admins.

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await getAdminSession()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    await prisma.category.delete({ where: { id: params.id } })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Category may have products. Remove products first.' }, { status: 400 })
  }
}
// Deletes a category when no relational constraints block removal.
