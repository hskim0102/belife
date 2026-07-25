import Link from 'next/link'
import Image from 'next/image'
import { Post } from '@/lib/types'
import { formatDate, getCategoryLabel } from '@/lib/utils'
import { NoticePanel } from './NoticePanel'
import { SectionDivider } from '@/components/ui/SectionDivider'

const cardGradients = [
  'from-emerald-50 to-emerald-100',
  'from-green-50 to-green-100',
  'from-amber-50 to-amber-100',
  'from-teal-50 to-teal-100',
]

export function NewsSection({
  posts,
  noticePost,
  newsPost,
  pressPost,
}: {
  posts: Post[]
  noticePost: Post[]
  newsPost: Post[]
  pressPost: Post[]
}) {
  return (
    <section className="bg-gradient-to-b from-cream to-cream-deep pt-14">
      <SectionDivider className="px-6" />
      <div className="max-w-6xl mx-auto mt-10 grid grid-cols-1 lg:grid-cols-[3fr_2fr]">
        {/* Left: Story cards */}
        <div className="p-8 border-r border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-black text-primary-darker flex items-center gap-3">
              현장 이야기
              <span className="inline-block w-7 h-0.5 bg-primary-darker" />
            </h2>
            <Link href="/news" className="text-xs text-gray-400 font-semibold hover:text-primary-darker transition-colors">
              전체 보기 →
            </Link>
          </div>
          {posts.length === 0 ? (
            <p className="col-span-2 text-center text-text-subtle py-10">등록된 소식이 없습니다.</p>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {posts.map((post, i) => (
                <Link key={post.id} href={`/news/${post.slug}`}>
                  <article className="bg-white rounded-lg overflow-hidden border border-gray-100 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">
                    <div className={`relative h-32 bg-gradient-to-br ${cardGradients[i % cardGradients.length]} flex items-center justify-center text-4xl overflow-hidden`}>
                      {post.thumbnail ? (
                        <Image
                          src={post.thumbnail}
                          alt={post.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        '📰'
                      )}
                    </div>
                    <div className="p-4">
                      <span className="text-[10px] font-bold bg-primary-light text-primary px-2 py-0.5 rounded-full">
                        {getCategoryLabel(post.category)}
                      </span>
                      <h4 className="font-bold text-sm text-gray-900 mt-2 leading-snug line-clamp-2">{post.title}</h4>
                      <p className="text-xs text-gray-400 mt-1">{formatDate(post.publishedAt)}</p>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Right: Tabbed notices */}
        <NoticePanel noticePost={noticePost} newsPost={newsPost} pressPost={pressPost} />
      </div>
    </section>
  )
}
