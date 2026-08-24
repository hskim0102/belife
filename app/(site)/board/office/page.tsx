import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getOfficeAccess } from '@/lib/auth'
import { getPostsPage } from '@/lib/repositories/posts'
import { getBoardCategory } from '@/lib/boardCategories'
import { parseSearchField, parseSearchQuery } from '@/lib/boardSearch'
import { formatDate } from '@/lib/utils'
import { PageHero } from '@/components/ui/PageHero'
import { BoardListFooter } from '@/components/board/BoardListFooter'
import { BoardNav } from '@/components/board/BoardNav'
import { officeLogoutAction } from './office-actions'

export const metadata: Metadata = { title: '사무국' }
// 쿠키로 열람 권한을 확인하므로 요청마다 렌더링한다.
export const dynamic = 'force-dynamic'

const PAGE_SIZE = 12

export default async function OfficeBoardPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string; sf?: string }>
}) {
  const access = await getOfficeAccess()
  if (!access) redirect('/board/office/login')

  const cat = getBoardCategory('office')!
  const sp = await searchParams
  const page = Math.max(1, Number(sp.page) || 1)
  const q = parseSearchQuery(sp.q)
  const searchField = parseSearchField(sp.sf)

  const { posts, total, page: curPage, totalPages } = await getPostsPage({
    category: 'office',
    q,
    searchField,
    page,
    pageSize: PAGE_SIZE,
  })

  const href = (p: number) => {
    const qs = new URLSearchParams()
    if (q) {
      qs.set('q', q)
      if (searchField !== 'all') qs.set('sf', searchField)
    }
    if (p > 1) qs.set('page', String(p))
    const s = qs.toString()
    return s ? `/board/office?${s}` : '/board/office'
  }

  return (
    <>
      <PageHero label="Board" title={cat.label} icon={cat.emoji} maxWidth="max-w-5xl" />

      <div className="py-14 px-6">
        <div className="max-w-5xl mx-auto">
          {/* 게시판 내비게이션(형제 카테고리 이동) — 다른 게시판과 동일 */}
          <div className="flex flex-wrap items-start justify-between gap-3 mb-8">
            <BoardNav current="office" />
            <div className="flex items-center gap-3 shrink-0">
              {access === 'admin' ? (
                // 관리자 세션으로 들어온 경우엔 사무국 로그아웃을 눌러도 계속 보이므로,
                // 로그아웃 버튼 대신 어떤 자격으로 보고 있는지 알려 준다.
                <span className="text-sm text-gray-400">
                  관리자 세션으로 열람 중 ·{' '}
                  <Link href="/admin" className="underline hover:text-primary-darker">
                    관리자
                  </Link>
                </span>
              ) : (
                <>
                  <span className="text-sm text-gray-400">내부 열람 중</span>
                  <form action={officeLogoutAction}>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-full text-sm font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                    >
                      로그아웃
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>

          {q && (
            <div className="flex flex-wrap items-center gap-2 mb-8 text-sm text-gray-500">
              <span>
                <strong className="text-gray-900">&lsquo;{q}&rsquo;</strong> 검색 결과 {total}건
              </span>
              <Link
                href="/board/office"
                className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
              >
                검색 취소
              </Link>
            </div>
          )}

          {posts.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-400 text-lg mb-2">
                {q ? '검색 결과가 없습니다.' : '등록된 게시물이 없습니다.'}
              </p>
            </div>
          ) : (
            <div className="border-t-2 border-gray-900">
              {posts.map(post => (
                <Link
                  key={post.id}
                  href={`/board/office/${post.slug}`}
                  className="flex items-center gap-4 px-2 py-4 border-b border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <span className="flex-1 min-w-0 truncate font-medium text-gray-900">{post.title}</span>
                  <span className="shrink-0 text-sm text-gray-400 w-24 text-right">
                    {formatDate(post.publishedAt)}
                  </span>
                </Link>
              ))}
            </div>
          )}

          <BoardListFooter
            page={curPage}
            totalPages={totalPages}
            total={total}
            hrefFor={href}
            searchAction="/board/office"
            searchField={searchField}
            searchQuery={q}
          />
        </div>
      </div>
    </>
  )
}
