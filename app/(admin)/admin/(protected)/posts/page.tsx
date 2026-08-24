import type { Metadata } from 'next'
import Link from 'next/link'
import { getPostsPage } from '@/lib/repositories/posts'
import { formatDate, getCategoryLabel } from '@/lib/utils'
import { BOARD_CATEGORIES, BOARD_CATEGORY_KEYS, isBoardCategory } from '@/lib/boardCategories'
import { parseSearchField, parseSearchQuery } from '@/lib/boardSearch'
import type { Post } from '@/lib/types'
import { RowActions } from '@/components/admin/RowActions'
import { BoardSearch } from '@/components/board/BoardSearch'
import { Pagination } from '@/components/ui/Pagination'

export const metadata: Metadata = { title: '게시판 글 관리' }
export const dynamic = 'force-dynamic'

const PAGE_SIZE = 20

// 게시판 글 관리는 게시판 8종만 다룬다(활동소식은 /admin/news 에서 관리).
const filters: { key: 'all' | Post['category']; label: string }[] = [
  { key: 'all', label: '전체' },
  ...BOARD_CATEGORIES.map(c => ({ key: c.key, label: c.label })),
]

function parseFilter(value: string | undefined): Post['category'] | undefined {
  return isBoardCategory(value ?? '') ? (value as Post['category']) : undefined
}

/** 게시판 글 공개 보기 경로(/board/<category>). */
function viewHref(post: Post): string {
  return `/board/${post.category}/${post.slug}`
}

export default async function AdminPostsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; category?: string; q?: string; sf?: string }>
}) {
  const sp = await searchParams
  const page = Math.max(1, Number(sp.page) || 1)
  const category = parseFilter(sp.category)
  const q = parseSearchQuery(sp.q)
  const searchField = parseSearchField(sp.sf)

  const { posts, total, page: curPage, totalPages } = await getPostsPage({
    category,
    categories: category ? undefined : BOARD_CATEGORY_KEYS,
    q,
    searchField,
    page,
    pageSize: PAGE_SIZE,
  })

  const buildHref = (p: number, c?: string) => {
    const params = new URLSearchParams()
    if (c && c !== 'all') params.set('category', c)
    // 검색 중이면 페이지를 넘기거나 분류를 바꿔도 검색 조건을 유지한다.
    if (q) {
      params.set('q', q)
      if (searchField !== 'all') params.set('sf', searchField)
    }
    if (p > 1) params.set('page', String(p))
    const qs = params.toString()
    return qs ? `/admin/posts?${qs}` : '/admin/posts'
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-black text-gray-900">게시판 글 관리</h1>
          <p className="text-sm text-gray-400 mt-1">총 {total}개의 게시물</p>
        </div>
        <Link
          href="/admin/posts/new"
          className="inline-flex items-center px-4 py-2 rounded-lg bg-primary text-white text-sm font-bold hover:bg-primary-dark transition-colors"
        >
          + 새 게시물
        </Link>
      </div>

      {/* 카테고리 필터 + 검색 */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="flex flex-wrap gap-1.5">
          {filters.map(f => {
            const active = (f.key === 'all' && !category) || f.key === category
            return (
              <Link
                key={f.key}
                href={buildHref(1, f.key)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                  active ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {f.label}
              </Link>
            )
          })}
        </div>
        <BoardSearch
          action="/admin/posts"
          field={searchField}
          query={q}
          keep={{ category: category ?? undefined }}
        />
      </div>

      {q && (
        <p className="text-sm text-gray-500 mb-4">
          <strong className="text-gray-900">&lsquo;{q}&rsquo;</strong> 검색 결과 {total}건 ·{' '}
          <Link href={category ? `/admin/posts?category=${category}` : '/admin/posts'} className="underline hover:text-primary">
            검색 취소
          </Link>
        </p>
      )}

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-left text-gray-500">
              <th className="px-4 py-3 font-semibold w-16">번호</th>
              <th className="px-4 py-3 font-semibold w-32">분류</th>
              <th className="px-4 py-3 font-semibold">제목</th>
              <th className="px-4 py-3 font-semibold w-28">발행일</th>
              <th className="px-4 py-3 font-semibold w-32 text-right">관리</th>
            </tr>
          </thead>
          <tbody>
            {posts.map(post => (
              <tr key={post.id} className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors">
                <td className="px-4 py-3 text-gray-400">{post.id}</td>
                <td className="px-4 py-3">
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                    {getCategoryLabel(post.category)}
                  </span>
                </td>
                <td className="px-4 py-3 max-w-0">
                  <Link
                    href={`/admin/posts/${post.id}/edit`}
                    className="block truncate font-medium text-gray-900 hover:text-primary transition-colors"
                  >
                    {post.title}
                  </Link>
                </td>
                <td className="px-4 py-3 text-gray-400">{formatDate(post.publishedAt)}</td>
                <td className="px-4 py-3">
                  <RowActions
                    id={post.id}
                    title={post.title}
                    viewHref={viewHref(post)}
                    editHref={`/admin/posts/${post.id}/edit`}
                  />
                </td>
              </tr>
            ))}
            {posts.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-16 text-center text-gray-400">
                  {q ? '검색 결과가 없습니다.' : '등록된 게시물이 없습니다.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        page={curPage}
        totalPages={totalPages}
        hrefFor={p => buildHref(p, category)}
        className="mt-6"
      />
    </div>
  )
}
