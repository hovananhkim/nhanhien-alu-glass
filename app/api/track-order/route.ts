import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q')?.trim()

  if (!q || q.length < 3) {
    return NextResponse.json(
      { error: 'Please enter your order number or email address.' },
      { status: 400 }
    )
  }

  try {
    // Search by order number (exact, case-insensitive) OR email
    const orders = await prisma.order.findMany({
      where: {
        OR: [
          { orderNumber: { equals: q.toUpperCase() } },
          { email: { equals: q.toLowerCase() } },
        ],
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                name: true,
                slug: true,
                images: { where: { isPrimary: true }, select: { url: true } },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      // Never expose more than 10 orders for one email
      take: 10,
    })

    if (orders.length === 0) {
      return NextResponse.json(
        { error: 'No orders found. Please check your order number or email.' },
        { status: 404 }
      )
    }

    // Strip sensitive fields before sending to client
    const safe = orders.map(order => ({
      id:           order.id,
      orderNumber:  order.orderNumber,
      customerName: order.customerName,
      // Show only first 3 chars + masked email for privacy
      email:        maskEmail(order.email),
      phone:        maskPhone(order.phone),
      address:      order.address,
      notes:        order.notes,
      orderType:    order.orderType,
      status:       order.status,
      createdAt:    order.createdAt,
      updatedAt:    order.updatedAt,
      items:        order.items.map(item => ({
        id:          item.id,
        quantity:    item.quantity,
        notes:       item.notes,
        productName: item.product.name,
        productSlug: item.product.slug,
        imageUrl:    item.product.images[0]?.url || '',
      })),
    }))

    return NextResponse.json({ orders: safe })
  } catch (err) {
    console.error('[Track Order]', err)
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    )
  }
}

// ── Privacy helpers ──────────────────────────────────────────
function maskEmail(email: string): string {
  const [local, domain] = email.split('@')
  if (!domain) return email
  const visible = local.slice(0, 3)
  const masked  = '*'.repeat(Math.max(0, local.length - 3))
  return `${visible}${masked}@${domain}`
}

function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  return phone.replace(digits.slice(2, -2), '*'.repeat(digits.length - 4))
}
