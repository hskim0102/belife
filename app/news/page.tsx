// app/news/page.tsx
import type { Metadata } from 'next'
import Link from 'next/link'
import { getAllPosts } from '@/lib/sanity/queries'
import { formatDate, getCategoryLabel } from '@/lib/utils'

export const metadata: Metadata = { title: '소식' }
export const revalidate = 60

export default async function NewsPage() {
  const posts = await getAllPosts()

  return (
    <div className="py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-black mb-12">소식</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {posts.map(post => (
            <Link key={post._id} href={`/news/${post.slug.current}`}>
              <article className="rounded-card overflow-hidden border border-gray-200 hover:shadow-md transition-shadow">
                <div className="h-44 bg-primary-light flex items-center justify-center text-4xl">📋</div>
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-semibold text-primary">{getCategoryLabel(post.category)}</span>
                    <span className="text-xs text-text-subtle">{formatDate(post.publishedAt)}</span>
                  </div>
                  <h2 className="font-bold text-sm leading-relaxed line-clamp-2">{post.title}</h2>
                  {post.excerpt && <p className="text-xs text-text-subtle mt-2 line-clamp-2">{post.excerpt}</p>}
                </div>
              </article>
            </Link>
          ))}
          {posts.length === 0 && (
            <p className="col-span-full text-center text-text-subtle py-10">등록된 소식이 없습니다.</p>
          )}
        </div>
      </div>
    </div>
  )
}
