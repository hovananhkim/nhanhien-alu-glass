import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const admin    = searchParams.get('admin') === 'true'
  const category = searchParams.get('category')
  const take     = parseInt(searchParams.get('take') || '20')

  // Public: only published. Admin: all.
  const posts = await prisma.blogPost.findMany({
    where: {
      ...(!admin ? { published: true } : {}),
      ...(category ? { category } : {}),
    },
    orderBy: { publishedAt: 'desc' },
    take,
    select: {
      id: true, title: true, slug: true, excerpt: true,
      coverImage: true, category: true, tags: true,
      published: true, readTime: true, views: true,
      createdAt: true, publishedAt: true,
    },
  })
  return NextResponse.json(posts)
}

export async function POST(req: NextRequest) {
  const admin = await getAdminSession()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json()
    const { title, excerpt, content, coverImage, category, tags, published, readTime } = body

    if (!title || !excerpt || !content)
      return NextResponse.json({ error: 'Title, excerpt and content are required' }, { status: 400 })

    // Auto-generate slug from title
    const baseSlug = title.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .slice(0, 80)
    const slug = `${baseSlug}-${Date.now().toString(36)}`

    // Auto-calculate read time if not provided (avg 200 words/min)
    const wordCount  = content.split(/\s+/).length
    const calcReadTime = readTime || Math.max(1, Math.ceil(wordCount / 200))

    const post = await prisma.blogPost.create({
      data: {
        title: title.trim(),
        slug,
        excerpt: excerpt.trim(),
        content: content.trim(),
        coverImage: coverImage || null,
        category:   category?.trim() || 'General',
        tags:       tags?.trim() || '',
        published:  published ?? false,
        readTime:   calcReadTime,
        publishedAt: published ? new Date() : null,
      },
    })
    return NextResponse.json(post, { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 })
  }
}
