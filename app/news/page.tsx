// app/news/page.tsx
import type { Metadata } from 'next'
import Link from 'next/link'
import { getAllPosts } from '@/lib/sanity/queries'
import { formatDate, getCategoryLabel } from '@/lib/utils'
import { SectionLabel } from '@/components/ui/SectionLabel'

export const metadata: Metadata = { title: '소식' }
export const revalidate = 60

const categoryColors: Record<string, string> = {
  notice: 'bg-blue-100 text-blue-700',
  news: 'bg-emerald-100 text-emerald-700',
  event: 'bg-purple-100 text-purple-700',
}

const gradients = [
  'bg-gradient-to-br from-emerald-400 to-teal-500',
  'bg-gradient-to-br from-blue-400 to-indigo-500',
  'bg-gradient-to-br from-purple-400 to-pink-500',
  'bg-gradient-to-br from-amber-400 to-orange-500',
  'bg-gradient-to-br from-rose-400 to-red-500',
  'bg-gradient-to-br from-sky-400 to-cyan-500',
]

export default async function NewsPage() {
  const posts = await getAllPosts()

  return (
    <>
      <div className="bg-gradient-to-br from-primary-darker to-primary-dark px-6 py-16">
        <div className="max-w-6xl mx-auto">
          <SectionLabel>News</SectionLabel>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">소식</h1>
        </div>
      </div>

      <div className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {posts.map((post, i) => (
              <Link key={post._id} href={`/news/${post.slug.current}`}>
                <article className="rounded-2xl overflow-hidden border border-gray-100 hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 bg-white h-full flex flex-col">
                  <div className={`h-48 ${gradients[i % gradients.length]} flex items-center justify-center text-5xl opacity-80`}>
                    📰
                  </div>
                  <div className="p-5 flex flex-col flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${categoryColors[post.category] ?? 'bg-gray-100 text-gray-600'}`}>
                        {getCategoryLabel(post.category)}
                      </span>
                      <span className="text-xs text-gray-400">{formatDate(post.publishedAt)}</span>
                    </div>
                    <h2 className="font-bold text-[15px] text-gray-900 leading-snug line-clamp-2 mb-2">{post.title}</h2>
                    {post.excerpt && (
                      <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed mt-auto">{post.excerpt}</p>
                    )}
                  </div>
                </article>
              </Link>
            ))}
            {posts.length === 0 && (
              <div className="col-span-full text-center py-20">
                <p className="text-gray-400 text-lg mb-2">등록된 소식이 없습니다.</p>
                <p className="text-gray-300 text-sm">곧 새로운 소식이 업데이트될 예정입니다.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}