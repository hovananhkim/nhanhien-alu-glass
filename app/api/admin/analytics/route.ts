import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const admin = await getAdminSession()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const months = parseInt(searchParams.get('months') || '12')

  const since = new Date()
  since.setMonth(since.getMonth() - months)
  since.setDate(1)
  since.setHours(0, 0, 0, 0)

  const [
    allOrders,
    allInquiries,
    ordersByStatus,
    topProducts,
    totalRevenue,
  ] = await Promise.all([
    // All orders in range with created date
    prisma.order.findMany({
      where: { createdAt: { gte: since } },
      select: {
        id: true,
        orderType: true,
        status: true,
        createdAt: true,
        items: {
          select: {
            quantity: true,
            product: { select: { price: true } },
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    }),

    // All inquiries in range
    prisma.inquiry.findMany({
      where: { createdAt: { gte: since } },
      select: { id: true, createdAt: true, isRead: true },
      orderBy: { createdAt: 'asc' },
    }),

    // Orders grouped by status
    prisma.order.groupBy({
      by: ['status'],
      _count: { status: true },
    }),

    // Top 10 products by order items count
    prisma.orderItem.groupBy({
      by: ['productId'],
      _count: { productId: true },
      _sum: { quantity: true },
      orderBy: { _count: { productId: 'desc' } },
      take: 10,
    }),

    // Total delivered revenue
    prisma.order.findMany({
      where: { status: 'DELIVERED' },
      include: {
        items: {
          include: { product: { select: { price: true } } },
        },
      },
    }),
  ])

  // ── Build monthly buckets ─────────────────────────────────
  const monthBuckets: Record<string, {
    label: string
    orders: number
    b2b: number
    b2c: number
    inquiries: number
    revenue: number
  }> = {}

  for (let i = months - 1; i >= 0; i--) {
    const d = new Date()
    d.setMonth(d.getMonth() - i)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const label = d.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' })
    monthBuckets[key] = { label, orders: 0, b2b: 0, b2c: 0, inquiries: 0, revenue: 0 }
  }

  // Fill orders into buckets
  for (const order of allOrders) {
    const d   = new Date(order.createdAt)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    if (monthBuckets[key]) {
      monthBuckets[key].orders++
      if (order.orderType === 'B2B') monthBuckets[key].b2b++
      else monthBuckets[key].b2c++

      // Estimate revenue from item prices
      const orderRevenue = order.items.reduce((sum, item) => {
        return sum + (item.product.price || 0) * item.quantity
      }, 0)
      monthBuckets[key].revenue += orderRevenue
    }
  }

  // Fill inquiries into buckets
  for (const inq of allInquiries) {
    const d   = new Date(inq.createdAt)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    if (monthBuckets[key]) monthBuckets[key].inquiries++
  }

  const monthlyData = Object.values(monthBuckets)

  // ── B2B vs B2C totals ─────────────────────────────────────
  const b2bTotal = allOrders.filter(o => o.orderType === 'B2B').length
  const b2cTotal = allOrders.filter(o => o.orderType === 'B2C').length

  // ── Status breakdown ──────────────────────────────────────
  const statusData = ordersByStatus.map(s => ({
    status: s.status,
    count:  s._count.status,
  }))

  // ── Top products with names ───────────────────────────────
  const productIds = topProducts.map(p => p.productId)
  const products   = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: { id: true, name: true, price: true },
  })
  const productMap = Object.fromEntries(products.map(p => [p.id, p]))

  const topProductsData = topProducts.map(tp => ({
    productId:   tp.productId,
    productName: productMap[tp.productId]?.name || 'Unknown',
    orderCount:  tp._count.productId,
    totalQty:    tp._sum.quantity || 0,
    price:       productMap[tp.productId]?.price || null,
  }))

  // ── Summary stats ─────────────────────────────────────────
  const totalOrdersInRange    = allOrders.length
  const totalInquiriesInRange = allInquiries.length
  const cancelledOrders       = allOrders.filter(o => o.status === 'CANCELLED').length
  const deliveredOrders       = allOrders.filter(o => o.status === 'DELIVERED').length

  const estimatedRevenue = totalRevenue.reduce((sum, order) => {
    return sum + order.items.reduce((s, item) => s + (item.product.price || 0) * item.quantity, 0)
  }, 0)

  return NextResponse.json({
    monthlyData,
    b2bTotal,
    b2cTotal,
    statusData,
    topProductsData,
    summary: {
      totalOrders:      totalOrdersInRange,
      totalInquiries:   totalInquiriesInRange,
      deliveredOrders,
      cancelledOrders,
      estimatedRevenue,
      conversionRate:   totalInquiriesInRange > 0
        ? Math.round((totalOrdersInRange / totalInquiriesInRange) * 100)
        : 0,
    },
  })
}
