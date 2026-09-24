import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/auth'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  // Include ordered images and category so product detail/edit views are fully hydrated.
  const product = await prisma.product.findUnique({
    where: { id: params.id },
    include: { images: { orderBy: { order: 'asc' } }, category: true },
  })
  if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(product)
}
// Returns one product by id with related category and images.

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await getAdminSession()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json()
    const { name, description, categoryId, dimensions, material, price, moq, featured, inStock, images } = body

    // Conditionally apply only supplied fields to avoid overwriting existing values.
    const product = await prisma.product.update({
      where: { id: params.id },
      data: {
        ...(name && { name }),
        ...(description && { description }),
        ...(categoryId && { categoryId }),
        ...(dimensions !== undefined && { dimensions }),
        ...(material !== undefined && { material }),
        ...(price !== undefined && { price: price ? parseFloat(price) : null }),
        ...(moq !== undefined && { moq: moq ? parseInt(moq) : null }),
        ...(featured !== undefined && { featured }),
        ...(inStock !== undefined && { inStock }),
      },
      include: { images: true, category: true },
    })

    // Handle image updates if provided
    if (images && Array.isArray(images)) {
      await prisma.productImage.deleteMany({ where: { productId: params.id } })
      // Recreate image ordering from client payload to keep display order deterministic.
      await prisma.productImage.createMany({
        data: images.map((img: { url: string; altText?: string }, i: number) => ({
          productId: params.id,
          url: img.url,
          altText: img.altText || product.name,
          isPrimary: i === 0,
          order: i,
        })),
      })
    }

    return NextResponse.json(product)
  } catch (err) {
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 })
  }
}
// Updates product fields and optionally replaces its images.

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await getAdminSession()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    await prisma.product.delete({ where: { id: params.id } })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 })
  }
}
// Deletes a product record for an authenticated admin.
