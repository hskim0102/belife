import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPostsPage, getBoardTagCounts } from '@/lib/repositories/posts'
import { getBoardCategory, BOARD_CATEGORIES, isBoardCategory } from '@/lib/boardCategories'
import { extractYouTubeId, youTubeThumbnailUrl } from '@/lib/youtube'
import { formatDate } from '@/lib/utils'
import { PageHero } from '@/components/ui/PageHero'
import { Pagination } from '@/components/ui/Pagination'
import { CommentCount } from '@/components/board/CommentCount'
import { BoardNav } from '@/components/board/BoardNav'

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

export async function generateStaticParams() {
  // 사무국(office)은 로그인 확인이 필요해 app/(site)/board/office 전용 라우트가 담당한다.
  return BOARD_CATEGORIES.filter(c => c.key !== 'office').map(c => ({ category: c.key }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>
}): Promise<Metadata> {
  const { category } = await params
  const cat = getBoardCategory(category)
  return { title: cat ? cat.label : '게시판' }
}

export default async function BoardCategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ category: string }>
  searchParams: Promise<{ page?: string; tag?: string }>
}) {
  const { category } = await params
  if (!isBoardCategory(category)) notFound()
  const cat = getBoardCategory(category)!

  const sp = await searchParams
  const page = Math.max(1, Number(sp.page) || 1)

  // 분류(태그)가 붙은 게시판(자료실 등)은 태그 필터를 함께 보여준다.
  const tagCounts = await getBoardTagCounts(category)
  const tag = sp.tag && tagCounts.some(t => t.tag === sp.tag) ? sp.tag : undefined

  const { posts, total, page: curPage, totalPages } = await getPostsPage({
    category,
    tag,
    page,
    pageSize: PAGE_SIZE,
    // 동영상 목록은 본문의 유튜브 링크로 썸네일을 파생하기 위해 본문까지 조회한다.
    includeBody: category === 'video',
  })

  const hrefWith = (next: { tag?: string; page?: number }) => {
    const t = next.tag !== undefined ? next.tag : tag
    const p = next.page ?? curPage
    const qs = new URLSearchParams()
    if (t) qs.set('tag', t)
    if (p > 1) qs.set('page', String(p))
    const s = qs.toString()
    return s ? `/board/${category}?${s}` : `/board/${category}`
  }
  const buildHref = (p: number) => hrefWith({ page: p })

  return (
    <>
      <PageHero label="Board" title={cat.label} icon={cat.emoji} maxWidth="max-w-5xl" />

      <div className="py-14 px-6">
        <div className="max-w-5xl mx-auto">
          {/* 게시판 내비게이션(형제 카테고리 이동) */}
          <div className="mb-8">
            <BoardNav current={category} />
          </div>

          {/* 분류 필터 (자료실처럼 분류가 있는 게시판에만 표시) */}
          {tagCounts.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-8 pb-6 border-b border-gray-100">
              <Link
                href={hrefWith({ tag: '', page: 1 })}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                  !tag ? 'bg-primary-dark text-white' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                }`}
              >
                전체 분류
              </Link>
              {tagCounts.map(({ tag: tname, count }) => (
                <Link
                  key={tname}
                  href={hrefWith({ tag: tname, page: 1 })}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                    tag === tname ? 'bg-primary-dark text-white' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  {tname} <span className="opacity-60">{count}</span>
                </Link>
              ))}
            </div>
          )}

          {posts.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-400 text-lg mb-2">등록된 게시물이 없습니다.</p>
            </div>
          ) : cat.layout === 'list' ? (
            /* ── 리스트(공지사항) ── */
            <div className="border-t-2 border-gray-900">
              {posts.map(post => (
                <Link
                  key={post.id}
                  href={`/board/${category}/${post.slug}`}
                  className="flex items-center gap-4 px-2 py-4 border-b border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <span className="flex-1 min-w-0 truncate font-medium text-gray-900">{post.title}</span>
                  <div className="shrink-0 flex items-center gap-3">
                    <CommentCount postId={post.id} className="text-xs font-semibold text-primary-darker bg-primary-light px-2 py-0.5 rounded" />
                    <span className="text-sm text-gray-400 w-24 text-right">
                      {formatDate(post.publishedAt)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            /* ── 카드 그리드(사진게시판·홍보자료) ── */
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {posts.map((post, i) => {
                // 동영상 글은 본문의 유튜브 링크에서 썸네일을 우선 사용한다.
                const ytId = category === 'video' ? extractYouTubeId(post.body) : null
                const thumbnail = ytId ? youTubeThumbnailUrl(ytId) : post.thumbnail
                return (
                <Link key={post.id} href={`/board/${category}/${post.slug}`}>
                  <article className="rounded-2xl overflow-hidden border border-gray-100 hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 bg-white h-full flex flex-col">
                    {thumbnail ? (
                      // 외부(Blob/YouTube) 이미지라 next/image 대신 일반 img 사용
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={thumbnail}
                        alt={post.title}
                        loading="lazy"
                        className="h-48 w-full object-cover"
                      />
                    ) : (
                      <div className={`h-48 ${gradients[i % gradients.length]} flex items-center justify-center text-5xl opacity-80`}>
                        {cat.emoji}
                      </div>
                    )}
                    <div className="p-5 flex flex-col flex-1">
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-xs text-gray-400">{formatDate(post.publishedAt)}</span>
                        <CommentCount postId={post.id} className="text-xs font-semibold text-primary-darker bg-primary-light px-2 py-0.5 rounded whitespace-nowrap" />
                      </div>
                      <h2 className="font-bold text-[15px] text-gray-900 leading-snug line-clamp-2">{post.title}</h2>
                      {post.excerpt && (
                        <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed mt-2">{post.excerpt}</p>
                      )}
                    </div>
                  </article>
                </Link>
                )
              })}
            </div>
          )}

          <Pagination page={curPage} totalPages={totalPages} hrefFor={buildHref} />

          <p className="text-center text-xs text-gray-400 mt-6">
            총 {total}개 · {curPage}/{totalPages} 페이지
          </p>
        </div>
      </div>
    </>
  )
}
