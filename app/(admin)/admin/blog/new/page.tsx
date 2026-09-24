import BlogEditor from '@/components/admin/BlogEditor'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'New Post | Admin' }

export default function NewBlogPostPage() {
  return (
    <div className="p-8">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/admin/blog" className="text-stone-400 hover:text-charcoal-700 transition-colors">
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
          </svg>
        </Link>
        <div>
          <h1 className="text-2xl font-display font-semibold text-charcoal-800">New Post</h1>
          <p className="text-stone-400 text-sm mt-0.5">Write a new craft story or buying guide</p>
        </div>
      </div>
      <BlogEditor mode="create" />
    </div>
  )
}
