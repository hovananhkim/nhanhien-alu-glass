import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/auth'

export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  const { searchParams } = new URL(req.url)
  const isAdmin = searchParams.get('admin') === 'true'

  const post = await prisma.blogPost.findUnique({
    where: { slug: params.slug },
  })

  if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (!isAdmin && !post.published) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Increment views for public reads
  if (!isAdmin) {
    await prisma.blogPost.update({
      where: { id: post.id },
      data:  { views: { increment: 1 } },
    })
  }

  return NextResponse.json(post)
}

export async function PATCH(req: NextRequest, { params }: { params: { slug: string } }) {
  const admin = await getAdminSession()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json()
    const { title, excerpt, content, coverImage, category, tags, published, readTime } = body

    // Find post by slug
    const existing = await prisma.blogPost.findUnique({ where: { slug: params.slug } })
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    // Auto-calc read time if content changed
    let calcReadTime = readTime
    if (content && !readTime) {
      const wordCount = content.split(/\s+/).length
      calcReadTime = Math.max(1, Math.ceil(wordCount / 200))
    }

    const post = await prisma.blogPost.update({
      where: { slug: params.slug },
      data: {
        ...(title       !== undefined && { title }),
        ...(excerpt     !== undefined && { excerpt }),
        ...(content     !== undefined && { content }),
        ...(coverImage  !== undefined && { coverImage }),
        ...(category    !== undefined && { category }),
        ...(tags        !== undefined && { tags }),
        ...(calcReadTime !== undefined && { readTime: calcReadTime }),
        ...(published   !== undefined && {
          published,
          publishedAt: published && !existing.publishedAt ? new Date() : existing.publishedAt,
        }),
      },
    })
    return NextResponse.json(post)
  } catch (err) {
    return NextResponse.json({ error: 'Failed to update post' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { slug: string } }) {
  const admin = await getAdminSession()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  await prisma.blogPost.delete({ where: { slug: params.slug } })
  return NextResponse.json({ success: true })
}
