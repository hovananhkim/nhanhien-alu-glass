import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Blog | Admin' }

export default async function AdminBlogPage() {
  const posts = await prisma.blogPost.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true, title: true, slug: true, category: true,
      published: true, readTime: true, views: true,
      createdAt: true, publishedAt: true, excerpt: true,
    },
  })

  const published = posts.filter(p => p.published).length
  const drafts    = posts.length - published

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-display font-semibold text-charcoal-800">Blog</h1>
          <p className="text-stone-400 text-sm mt-1">
            {published} published · {drafts} draft{drafts !== 1 ? 's' : ''}
          </p>
        </div>
        <Link href="/admin/blog/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-charcoal-800 hover:bg-charcoal-900 text-white text-sm font-medium rounded-xl transition-colors">
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
          </svg>
          New Post
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
        {posts.length === 0 ? (
          <div className="py-20 text-center">
            <div className="text-5xl mb-3">✍️</div>
            <p className="font-medium text-charcoal-600">No posts yet</p>
            <Link href="/admin/blog/new" className="inline-block mt-4 text-wood-600 text-sm hover:underline">
              Write your first post →
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-stone-50">
            {posts.map(post => (
              <div key={post.id} className="flex items-start gap-4 px-6 py-5 hover:bg-stone-50 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                      post.published ? 'bg-green-100 text-green-700' : 'bg-stone-100 text-stone-500'
                    }`}>
                      {post.published ? 'Published' : 'Draft'}
                    </span>
                    <span className="text-xs bg-stone-100 text-stone-500 px-2.5 py-0.5 rounded-full">
                      {post.category}
                    </span>
                    <span className="text-xs text-stone-400">{post.readTime} min read</span>
                    {post.views > 0 && (
                      <span className="text-xs text-stone-400">{post.views} views</span>
                    )}
                  </div>
                  <h3 className="font-semibold text-charcoal-800 mb-1 truncate">{post.title}</h3>
                  <p className="text-sm text-stone-400 truncate">{post.excerpt}</p>
                  <p className="text-xs text-stone-300 mt-1">
                    {post.published && post.publishedAt
                      ? `Published ${new Date(post.publishedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`
                      : `Created ${new Date(post.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`
                    }
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {post.published && (
                    <Link href={`/blog/${post.slug}`} target="_blank"
                      className="p-1.5 text-stone-400 hover:text-charcoal-700 hover:bg-stone-100 rounded-lg transition-all"
                      title="View post">
                      <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
                      </svg>
                    </Link>
                  )}
                  <Link href={`/admin/blog/${post.slug}/edit`}
                    className="p-1.5 text-stone-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                    title="Edit post">
                    <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                    </svg>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
