import type { Metadata } from 'next'
import Link from 'next/link'
import { getPostsPage, getActivityTagCounts } from '@/lib/repositories/posts'
import { formatDate } from '@/lib/utils'
import { parseSearchField, parseSearchQuery } from '@/lib/boardSearch'
import { RowActions } from '@/components/admin/RowActions'
import { BoardSearch } from '@/components/board/BoardSearch'
import { Pagination } from '@/components/ui/Pagination'

export const metadata: Metadata = { title: '활동소식 관리' }
export const dynamic = 'force-dynamic'

const PAGE_SIZE = 20

export default async function AdminNewsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; tag?: string; q?: string; sf?: string }>
}) {
  const sp = await searchParams
  const page = Math.max(1, Number(sp.page) || 1)
  const q = parseSearchQuery(sp.q)
  const searchField = parseSearchField(sp.sf)

  const tagCounts = await getActivityTagCounts()
  const tagSet = new Set(tagCounts.map(t => t.tag))
  const tag = sp.tag && tagSet.has(sp.tag) ? sp.tag : undefined

  const { posts, total, page: curPage, totalPages } = await getPostsPage({
    category: 'activity',
    tag,
    q,
    searchField,
    page,
    pageSize: PAGE_SIZE,
  })

  const buildHref = (p: number, t?: string) => {
    const params = new URLSearchParams()
    if (t) params.set('tag', t)
    // 검색 중이면 페이지를 넘기거나 분류를 바꿔도 검색 조건을 유지한다.
    if (q) {
      params.set('q', q)
      if (searchField !== 'all') params.set('sf', searchField)
    }
    if (p > 1) params.set('page', String(p))
    const qs = params.toString()
    return qs ? `/admin/news?${qs}` : '/admin/news'
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-black text-gray-900">활동소식 관리</h1>
          <p className="text-sm text-gray-400 mt-1">총 {total}개</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/admin/news/categories"
            className="inline-flex items-center px-4 py-2 rounded-lg bg-gray-100 text-gray-700 text-sm font-bold hover:bg-gray-200 transition-colors"
          >
            구분 관리
          </Link>
          <Link
            href="/admin/news/new"
            className="inline-flex items-center px-4 py-2 rounded-lg bg-primary text-white text-sm font-bold hover:bg-primary-dark transition-colors"
          >
            + 새 활동소식
          </Link>
        </div>
      </div>

      {/* 분류 태그 필터 + 검색 */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        {tagCounts.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            <Link
              href={buildHref(1)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                !tag ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              전체
            </Link>
            {tagCounts.map(({ tag: tname, count }) => (
              <Link
                key={tname}
                href={buildHref(1, tname)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                  tag === tname ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {tname} <span className="opacity-60">{count}</span>
              </Link>
            ))}
          </div>
        ) : (
          <div />
        )}
        <BoardSearch action="/admin/news" field={searchField} query={q} keep={{ tag }} />
      </div>

      {q && (
        <p className="text-sm text-gray-500 mb-4">
          <strong className="text-gray-900">&lsquo;{q}&rsquo;</strong> 검색 결과 {total}건 ·{' '}
          <Link
            href={tag ? `/admin/news?tag=${encodeURIComponent(tag)}` : '/admin/news'}
            className="underline hover:text-primary"
          >
            검색 취소
          </Link>
        </p>
      )}

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-left text-gray-500">
              <th className="px-4 py-3 font-semibold w-16">번호</th>
              <th className="px-4 py-3 font-semibold">제목</th>
              <th className="px-4 py-3 font-semibold w-40">분류 태그</th>
              <th className="px-4 py-3 font-semibold w-28">발행일</th>
              <th className="px-4 py-3 font-semibold w-32 text-right">관리</th>
            </tr>
          </thead>
          <tbody>
            {posts.map(post => (
              <tr key={post.id} className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors">
                <td className="px-4 py-3 text-gray-400">{post.id}</td>
                <td className="px-4 py-3 max-w-0">
                  <Link
                    href={`/admin/news/${post.id}/edit`}
                    className="block truncate font-medium text-gray-900 hover:text-primary transition-colors"
                  >
                    {post.title}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {post.tags.slice(0, 3).map(t => (
                      <span key={t} className="text-[11px] font-semibold text-primary bg-primary-light px-2 py-0.5 rounded-full">
                        #{t}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-400">{formatDate(post.publishedAt)}</td>
                <td className="px-4 py-3">
                  <RowActions
                    id={post.id}
                    title={post.title}
                    viewHref={`/news/${post.slug}`}
                    editHref={`/admin/news/${post.id}/edit`}
                  />
                </td>
              </tr>
            ))}
            {posts.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-16 text-center text-gray-400">
                  {q ? '검색 결과가 없습니다.' : '등록된 활동소식이 없습니다.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        page={curPage}
        totalPages={totalPages}
        hrefFor={p => buildHref(p, tag)}
        className="mt-6"
      />
    </div>
  )
}
