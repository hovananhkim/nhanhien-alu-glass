import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/auth'

export async function GET() {
  // Include product counts so category usage can be displayed without extra queries.
  const categories = await prisma.category.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: { name: 'asc' },
  })
  return NextResponse.json(categories)
}
// Returns categories sorted by name with product totals.

export async function POST(req: NextRequest) {
  const admin = await getAdminSession()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { name, description, imageUrl } = await req.json()
    if (!name) return NextResponse.json({ error: 'Name required' }, { status: 400 })

    // Normalize category name into a stable URL slug.
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    const category = await prisma.category.create({
      data: { name, slug, description: description || null, imageUrl: imageUrl || null },
    })
    return NextResponse.json(category, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 })
  }
}
// Creates a category after admin authorization and basic validation.
