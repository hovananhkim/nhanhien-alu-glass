import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/auth'

export async function PUT(req: NextRequest) {
  const admin = await getAdminSession()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const content: Record<string, string> = await req.json()
    // Convert key/value payload into upsert operations for bulk content persistence.
    const updates = Object.entries(content).map(([key, value]) =>
      prisma.siteContent.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      })
    )
    await Promise.all(updates)
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: 'Failed to update content' }, { status: 500 })
  }
}
// Upserts site-content entries for authenticated admins.

export async function GET() {
  const content = await prisma.siteContent.findMany()
  // Transform row-based content into a dictionary keyed by content key.
  return NextResponse.json(Object.fromEntries(content.map(c => [c.key, c.value])))
}
// Returns site-content records as a key-value object.
