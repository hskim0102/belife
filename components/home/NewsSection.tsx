import Link from 'next/link'
import { Post } from '@/lib/sanity/types'
import { formatDate, getCategoryLabel } from '@/lib/utils'

export function NewsSection({ posts }: { posts: Post[] }) {
  return (
    <section className="bg-white py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-black">최근 소식</h2>
          <Link href="/news" className="text-primary text-sm font-semibold hover:underline">전체 보기 →</Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {posts.map(post => (
            <Link key={post._id} href={`/news/${post.slug.current}`}>
              <article className="rounded-card overflow-hidden border border-gray-200 hover:shadow-md transition-shadow">
                <div className="h-40 bg-primary-light flex items-center justify-center text-4xl">📋</div>
                <div className="p-4">
                  <span className="text-xs text-primary-dark font-semibold">{getCategoryLabel(post.category)}</span>
                  <p className="text-xs text-text-subtle mt-1 mb-2">{formatDate(post.publishedAt)}</p>
                  <h4 className="font-bold text-sm leading-relaxed line-clamp-2">{post.title}</h4>
                </div>
              </article>
            </Link>
          ))}
          {posts.length === 0 && (
            <p className="col-span-3 text-center text-text-subtle py-10">등록된 소식이 없습니다.</p>
          )}
        </div>
      </div>
    </section>
  )
}
