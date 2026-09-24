import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const category = searchParams.get('category')
  const search = searchParams.get('search')
  const featured = searchParams.get('featured')

  // Build optional filters so one endpoint can support category, featured, and text search.
  const products = await prisma.product.findMany({
    where: {
      ...(category ? { category: { slug: category } } : {}),
      ...(featured ? { featured: featured === 'true' } : {}),
      ...(search ? {
        OR: [
          { name: { contains: search } },
          { description: { contains: search } },
          { material: { contains: search } },
        ]
      } : {}),
    },
    include: {
      images: { orderBy: { order: 'asc' } },
      category: true,
    },
    orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
  })
  return NextResponse.json(products)
}
// Returns products with optional query-based filtering and related data.

export async function POST(req: NextRequest) {
  const admin = await getAdminSession()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json()
    const { name, description, categoryId, dimensions, material, price, moq, featured, images } = body

    // Generate a URL-safe unique slug from product name and timestamp.
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + Date.now()

    // Persist product and create ordered image rows in the same mutation.
    const product = await prisma.product.create({
      data: {
        name, description, slug, categoryId,
        dimensions: dimensions || null,
        material: material || null,
        price: price ? parseFloat(price) : null,
        moq: moq ? parseInt(moq) : null,
        featured: featured || false,
        images: {
          create: (images || []).map((img: { url: string; altText?: string; isPrimary?: boolean }, i: number) => ({
            url: img.url,
            altText: img.altText || name,
            isPrimary: i === 0,
            order: i,
          })),
        },
      },
      include: { images: true, category: true },
    })
    return NextResponse.json(product, { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 })
  }
}
// Creates a product and nested image records for admin users.
