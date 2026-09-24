import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/auth'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await getAdminSession()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { status, expectedDeliveryAt } = await req.json()
    const validStatuses = ['PENDING', 'CONFIRMED', 'IN_PRODUCTION', 'DELIVERED', 'CANCELLED']
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }
    let parsedExpectedDelivery: Date | null = null
    if (expectedDeliveryAt) {
      const parsed = new Date(expectedDeliveryAt)
      if (Number.isNaN(parsed.getTime())) {
        return NextResponse.json({ error: 'Invalid expected delivery date' }, { status: 400 })
      }
      parsedExpectedDelivery = parsed
    }

    const order = await prisma.order.update({
      where: { id: params.id },
      data: {
        status,
        expectedDeliveryAt: parsedExpectedDelivery,
      },
    })
    return NextResponse.json(order)
  } catch {
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 })
  }
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await getAdminSession()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: { items: { include: { product: { include: { images: { where: { isPrimary: true } } } } } } },
  })
  if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(order)
}
