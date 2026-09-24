import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/auth'

export async function GET() {
  const items = await prisma.testimonial.findMany({
    orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
  })
  return NextResponse.json(items)
}

export async function POST(req: NextRequest) {
  const admin = await getAdminSession()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const body = await req.json()
    const { name, role, location, quote, rating, featured } = body
    if (!name || !role || !quote)
      return NextResponse.json({ error: 'Name, role and quote are required' }, { status: 400 })
    const count = await prisma.testimonial.count()
    const item  = await prisma.testimonial.create({
      data: {
        name: name.trim(), role: role.trim(),
        location: location?.trim() || '',
        quote: quote.trim(),
        rating: Math.min(5, Math.max(1, parseInt(rating) || 5)),
        featured: featured ?? true, order: count,
      },
    })
    return NextResponse.json(item, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: 'Failed to create testimonial' }, { status: 500 })
  }
}
