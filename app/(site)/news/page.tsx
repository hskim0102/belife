// app/news/page.tsx — 소식(활동소식) 목록. 공지사항·사진게시판 등은 /board 소관.
import type { Metadata } from 'next'
import Link from 'next/link'
import { getPostsPage, getActivityTagCounts } from '@/lib/repositories/posts'
import { formatDate } from '@/lib/utils'
import { parseSearchField, parseSearchQuery } from '@/lib/boardSearch'
import { PageHero } from '@/components/ui/PageHero'
import { BoardListFooter } from '@/components/board/BoardListFooter'

export const metadata: Metadata = { title: '활동소식' }
export const revalidate = 60

const PAGE_SIZE = 12

const gradients = [
  'bg-gradient-to-br from-emerald-100 to-teal-200',
  'bg-gradient-to-br from-lime-100 to-green-200',
  'bg-gradient-to-br from-purple-100 to-pink-200',
  'bg-gradient-to-br from-amber-100 to-orange-200',
  'bg-gradient-to-br from-rose-100 to-red-200',
  'bg-gradient-to-br from-teal-100 to-cyan-200',
]

export default async function NewsPage({
  searchParams,
}: {
  searchParams: Promise<{ tag?: string; page?: string; q?: string; sf?: string }>
}) {
  const sp = await searchParams

  const tagCounts = await getActivityTagCounts()
  const tagSet = new Set(tagCounts.map(t => t.tag))
  const tag = sp.tag && tagSet.has(sp.tag) ? sp.tag : undefined
  const page = Math.max(1, Number(sp.page) || 1)
  const q = parseSearchQuery(sp.q)
  const searchField = parseSearchField(sp.sf)

  const { posts, total, page: curPage, totalPages } = await getPostsPage({
    category: 'activity',
    tag,
    q,
    searchField,
    page,
    pageSize: PAGE_SIZE,
  })

  const buildHref = (next: { tag?: string; page?: number }) => {
    const t = next.tag !== undefined ? next.tag : tag
    const p = next.page ?? curPage
    const params = new URLSearchParams()
    if (t) params.set('tag', t)
    // 검색 중이면 페이지·분류를 바꿔도 검색 조건을 유지한다.
    if (q) {
      params.set('q', q)
      if (searchField !== 'all') params.set('sf', searchField)
    }
    if (p > 1) params.set('page', String(p))
    const qs = params.toString()
    return qs ? `/news?${qs}` : '/news'
  }

  return (
    <>
      <PageHero label="News" title="활동소식" icon="📰" maxWidth="max-w-6xl" />

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

          {q && (
            <div className="flex flex-wrap items-center gap-2 mb-8 text-sm text-gray-500">
              <span>
                <strong className="text-gray-900">&lsquo;{q}&rsquo;</strong> 검색 결과 {total}건
              </span>
              <Link
                href={tag ? `/news?tag=${encodeURIComponent(tag)}` : '/news'}
                className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
              >
                검색 취소
              </Link>
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
                <p className="text-gray-400 text-lg mb-2">
                  {q ? '검색 결과가 없습니다.' : '해당 조건의 활동소식이 없습니다.'}
                </p>
                <p className="text-gray-300 text-sm">
                  {q ? '다른 검색어나 검색 범위로 찾아보세요.' : '다른 분류를 선택해 보세요.'}
                </p>
              </div>
            )}
          </div>

          <BoardListFooter
            page={curPage}
            totalPages={totalPages}
            total={total}
            hrefFor={p => buildHref({ page: p })}
            searchAction="/news"
            searchField={searchField}
            searchQuery={q}
            searchKeep={{ tag }}
          />
        </div>
      </div>
    </>
  )
}
