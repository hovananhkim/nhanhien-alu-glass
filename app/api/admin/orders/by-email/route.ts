import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const admin = await getAdminSession()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const email = searchParams.get('email')?.trim()
  if (!email) return NextResponse.json({ error: 'Email is required' }, { status: 400 })

  const orders = await prisma.order.findMany({
    where: { email },
    include: {
      items: {
        include: {
          product: { select: { name: true, price: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({
    email,
    count: orders.length,
    orders: orders.map(order => ({
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      orderType: order.orderType,
      createdAt: order.createdAt,
      estimatedValue: order.items.reduce((sum, item) => sum + ((item.product.price || 0) * item.quantity), 0),
    })),
  })
}
