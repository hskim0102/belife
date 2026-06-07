// app/news/page.tsx — 소식(활동소식) 목록. 공지사항·사진게시판 등은 /board 소관.
import type { Metadata } from 'next'
import Link from 'next/link'
import { getPostsPage, getActivityTagCounts } from '@/lib/repositories/posts'
import { formatDate } from '@/lib/utils'
import { SectionLabel } from '@/components/ui/SectionLabel'

export const metadata: Metadata = { title: '소식' }
export const revalidate = 60

const PAGE_SIZE = 12

const gradients = [
  'bg-gradient-to-br from-emerald-400 to-teal-500',
  'bg-gradient-to-br from-blue-400 to-indigo-500',
  'bg-gradient-to-br from-purple-400 to-pink-500',
  'bg-gradient-to-br from-amber-400 to-orange-500',
  'bg-gradient-to-br from-rose-400 to-red-500',
  'bg-gradient-to-br from-sky-400 to-cyan-500',
]

/** 현재 보고 있는 페이지 주변 + 처음/끝을 포함한 페이지 토큰(숫자 또는 '…') 생성. */
function pageWindow(current: number, total: number): (number | '…')[] {
  const span = 2
  const pages = new Set<number>([1, total])
  for (let p = current - span; p <= current + span; p++) {
    if (p >= 1 && p <= total) pages.add(p)
  }
  const sorted = [...pages].sort((a, b) => a - b)
  const out: (number | '…')[] = []
  let prev = 0
  for (const p of sorted) {
    if (p - prev > 1) out.push('…')
    out.push(p)
    prev = p
  }
  return out
}

export default async function NewsPage({
  searchParams,
}: {
  searchParams: Promise<{ tag?: string; page?: string }>
}) {
  const sp = await searchParams

  const tagCounts = await getActivityTagCounts()
  const tagSet = new Set(tagCounts.map(t => t.tag))
  const tag = sp.tag && tagSet.has(sp.tag) ? sp.tag : undefined
  const page = Math.max(1, Number(sp.page) || 1)

  const { posts, total, page: curPage, totalPages } = await getPostsPage({
    category: 'activity',
    tag,
    page,
    pageSize: PAGE_SIZE,
  })

  const buildHref = (next: { tag?: string; page?: number }) => {
    const t = next.tag !== undefined ? next.tag : tag
    const p = next.page ?? curPage
    const params = new URLSearchParams()
    if (t) params.set('tag', t)
    if (p > 1) params.set('page', String(p))
    const qs = params.toString()
    return qs ? `/news?${qs}` : '/news'
  }

  return (
    <>
      <div className="bg-gradient-to-br from-primary-darker to-primary-dark px-6 py-16">
        <div className="max-w-6xl mx-auto">
          <SectionLabel>News</SectionLabel>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">활동소식</h1>
        </div>
      </div>

      <div className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          {/* 활동소식 분류 태그 */}
          {tagCounts.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-8 pb-6 border-b border-gray-100">
              <Link
                href={buildHref({ tag: '', page: 1 })}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                  !tag ? 'bg-primary-dark text-white' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                }`}
              >
                전체 분류
              </Link>
              {tagCounts.map(({ tag: tname, count }) => (
                <Link
                  key={tname}
                  href={buildHref({ tag: tname, page: 1 })}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                    tag === tname ? 'bg-primary-dark text-white' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  {tname} <span className="opacity-60">{count}</span>
                </Link>
              ))}
            </div>
          )}

          {/* 카드 그리드 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {posts.map((post, i) => (
              <Link key={post.id} href={`/news/${post.slug}`}>
                <article className="rounded-2xl overflow-hidden border border-gray-100 hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 bg-white h-full flex flex-col">
                  {post.thumbnail ? (
                    // 외부(Blob) 이미지라 next/image 대신 일반 img 사용
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={post.thumbnail}
                      alt={post.title}
                      loading="lazy"
                      className="h-48 w-full object-cover"
                    />
                  ) : (
                    <div className={`h-48 ${gradients[i % gradients.length]} flex items-center justify-center text-5xl opacity-80`}>
                      📰
                    </div>
                  )}
                  <div className="p-5 flex flex-col flex-1">
                    <span className="text-xs text-gray-400 mb-3">{formatDate(post.publishedAt)}</span>
                    <h2 className="font-bold text-[15px] text-gray-900 leading-snug line-clamp-2 mb-2">{post.title}</h2>
                    {post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {post.tags.map(t => (
                          <span key={t} className="text-[11px] font-semibold text-primary bg-primary-light px-2 py-0.5 rounded-full">
                            #{t}
                          </span>
                        ))}
                      </div>
                    )}
                    {post.excerpt && (
                      <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed mt-auto">{post.excerpt}</p>
                    )}
                  </div>
                </article>
              </Link>
            ))}
            {posts.length === 0 && (
              <div className="col-span-full text-center py-20">
                <p className="text-gray-400 text-lg mb-2">해당 조건의 소식이 없습니다.</p>
                <p className="text-gray-300 text-sm">다른 분류를 선택해 보세요.</p>
              </div>
            )}
          </div>

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-1 mt-12">
              {curPage > 1 && (
                <Link
                  href={buildHref({ page: curPage - 1 })}
                  className="h-10 px-3 flex items-center justify-center rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
                  aria-label="이전 페이지"
                >
                  ←
                </Link>
              )}
              {pageWindow(curPage, totalPages).map((p, idx) =>
                p === '…' ? (
                  <span key={`gap-${idx}`} className="w-10 h-10 flex items-center justify-center text-gray-300">
                    …
                  </span>
                ) : (
                  <Link
                    key={p}
                    href={buildHref({ page: p })}
                    className={`w-10 h-10 flex items-center justify-center rounded-lg text-sm font-semibold transition-colors ${
                      p === curPage ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {p}
                  </Link>
                ),
              )}
              {curPage < totalPages && (
                <Link
                  href={buildHref({ page: curPage + 1 })}
                  className="h-10 px-3 flex items-center justify-center rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
                  aria-label="다음 페이지"
                >
                  →
                </Link>
              )}
            </div>
          )}

          <p className="text-center text-xs text-gray-400 mt-6">
            총 {total}개 · {curPage}/{totalPages} 페이지
          </p>
        </div>
      </div>
    </>
  )
}
