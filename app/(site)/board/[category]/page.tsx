import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPostsPage } from '@/lib/repositories/posts'
import { getBoardCategory, BOARD_CATEGORIES, isBoardCategory } from '@/lib/boardCategories'
import { formatDate } from '@/lib/utils'
import { SectionLabel } from '@/components/ui/SectionLabel'
import { CommentCount } from '@/components/board/CommentCount'

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

export async function generateStaticParams() {
  return BOARD_CATEGORIES.map(c => ({ category: c.key }))
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

/** 현재 페이지 주변 + 처음/끝을 포함한 페이지 토큰. */
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

export default async function BoardCategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ category: string }>
  searchParams: Promise<{ page?: string }>
}) {
  const { category } = await params
  if (!isBoardCategory(category)) notFound()
  const cat = getBoardCategory(category)!

  const sp = await searchParams
  const page = Math.max(1, Number(sp.page) || 1)

  const { posts, total, page: curPage, totalPages } = await getPostsPage({
    category,
    page,
    pageSize: PAGE_SIZE,
  })

  const buildHref = (p: number) => (p > 1 ? `/board/${category}?page=${p}` : `/board/${category}`)

  return (
    <>
      <div className="bg-gradient-to-br from-primary-darker to-primary-dark px-6 py-16">
        <div className="max-w-5xl mx-auto">
          <SectionLabel>Board</SectionLabel>
          <div className="flex items-center gap-3">
            <span className="text-4xl">{cat.emoji}</span>
            <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">{cat.label}</h1>
          </div>
        </div>
      </div>

      <div className="py-14 px-6">
        <div className="max-w-5xl mx-auto">
          {/* 게시판 내비게이션(형제 카테고리 이동) */}
          <div className="flex flex-wrap gap-2 mb-8">
            <Link
              href="/board"
              className="px-4 py-2 rounded-full text-sm font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
            >
              게시판 홈
            </Link>
            {BOARD_CATEGORIES.map(c => (
              <Link
                key={c.key}
                href={`/board/${c.key}`}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                  c.key === category ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {c.label}
              </Link>
            ))}
          </div>

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
              {posts.map((post, i) => (
                <Link key={post.id} href={`/board/${category}/${post.slug}`}>
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
              ))}
            </div>
          )}

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-1 mt-12">
              {curPage > 1 && (
                <Link
                  href={buildHref(curPage - 1)}
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
                    href={buildHref(p)}
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
                  href={buildHref(curPage + 1)}
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
