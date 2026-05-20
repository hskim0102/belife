import Link from 'next/link'
import { Post } from '@/lib/sanity/types'
import { formatDate, getCategoryLabel } from '@/lib/utils'
import { SectionLabel } from '@/components/ui/SectionLabel'

const categoryColors: Record<string, string> = {
  notice: 'bg-blue-100 text-blue-700',
  news: 'bg-emerald-100 text-emerald-700',
  event: 'bg-purple-100 text-purple-700',
}

export function NewsSection({ posts }: { posts: Post[] }) {
  return (
    <section className="bg-white py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-end justify-between mb-12">
          <div>
            <SectionLabel>News</SectionLabel>
            <h2 className="text-4xl font-black text-gray-900">최근 소식</h2>
          </div>
          <Link href="/news" className="text-primary text-sm font-bold hover:text-primary-dark transition-colors flex items-center gap-1">
            전체 보기 <span>→</span>
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {posts.map((post, i) => (
            <Link key={post._id} href={`/news/${post.slug.current}`}>
              <article className="rounded-2xl overflow-hidden border border-gray-100 hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 bg-white h-full flex flex-col">
                <div className={`h-44 flex items-center justify-center text-5xl ${i % 3 === 0 ? 'bg-gradient-to-br from-emerald-400 to-teal-500' : i % 3 === 1 ? 'bg-gradient-to-br from-blue-400 to-indigo-500' : 'bg-gradient-to-br from-purple-400 to-pink-500'}`}>
                  <span className="opacity-70">📰</span>
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${categoryColors[post.category] ?? 'bg-gray-100 text-gray-600'}`}>
                      {getCategoryLabel(post.category)}
                    </span>
                    <span className="text-xs text-gray-400">{formatDate(post.publishedAt)}</span>
                  </div>
                  <h4 className="font-bold text-[15px] text-gray-900 leading-snug line-clamp-2">{post.title}</h4>
                  {post.excerpt && (
                    <p className="text-sm text-gray-500 mt-2 line-clamp-2 leading-relaxed">{post.excerpt}</p>
                  )}
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