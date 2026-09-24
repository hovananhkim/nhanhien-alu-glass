import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/auth'

export async function GET() {
  const items = await prisma.galleryItem.findMany({
    orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
  })
  return NextResponse.json(items)
}

export async function POST(req: NextRequest) {
  const admin = await getAdminSession()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json()
    const { title, description, imageUrl, category, featured } = body
    if (!title || !imageUrl) {
      return NextResponse.json({ error: 'Title and image are required' }, { status: 400 })
    }
    const count = await prisma.galleryItem.count()
    const item = await prisma.galleryItem.create({
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        imageUrl,
        category: category?.trim() || 'General',
        featured: featured || false,
        order: count,
      },
    })
    return NextResponse.json(item, { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to create gallery item' }, { status: 500 })
  }
}