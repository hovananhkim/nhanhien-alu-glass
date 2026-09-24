import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateOrderNumber } from '@/lib/auth'
import {
  sendEmail,
  adminNewOrderEmail,
  customerOrderConfirmationEmail,
} from '@/lib/email'

export async function GET(req: NextRequest) {
  try {
    const orders = await prisma.order.findMany({
      include: { items: { include: { product: { include: { images: { where: { isPrimary: true } } } } } } },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(orders)
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, email, phone, address, notes, orderType, items } = body

    if (!name || !email || !phone || !address) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'No items provided' }, { status: 400 })
    }

    // Create order with product details included for emails
    const order = await prisma.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        customerName: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        address: address.trim(),
        notes: notes?.trim() || null,
        orderType: orderType || 'B2C',
        status: 'PENDING',
        items: {
          create: items.map((item: { productId: string; quantity: number; notes?: string }) => ({
            productId: item.productId,
            quantity: item.quantity || 1,
            notes: item.notes?.trim() || null,
          })),
        },
      },
      include: {
        items: {
          include: { product: { select: { name: true } } },
        },
      },
    })

    // Build shared item list for emails
    const emailItems = order.items.map(item => ({
      productName: item.product.name,
      quantity: item.quantity,
    }))

    // Send emails — fire both in parallel, never block the response
    const adminEmail = process.env.ADMIN_EMAIL || ''

    Promise.all([
      // 1. Notify admin
      adminEmail
        ? sendEmail({
            to: adminEmail,
            ...adminNewOrderEmail({
              orderNumber: order.orderNumber,
              customerName: order.customerName,
              email: order.email,
              phone: order.phone,
              address: order.address,
              orderType: order.orderType,
              notes: order.notes,
              items: emailItems,
            }),
          })
        : Promise.resolve(),

      // 2. Confirm to customer
      sendEmail({
        to: order.email,
        ...customerOrderConfirmationEmail({
          orderNumber: order.orderNumber,
          customerName: order.customerName,
          orderType: order.orderType,
          items: emailItems,
        }),
      }),
    ]).catch(err => console.error('[Email] Parallel send error:', err))

    return NextResponse.json(
      { success: true, orderNumber: order.orderNumber },
      { status: 201 }
    )
  } catch (err) {
    console.error('Order creation error:', err)
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
  }
}