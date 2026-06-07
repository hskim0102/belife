import type { Metadata } from 'next'
import Link from 'next/link'
import { listBoardPosts } from '@/lib/repositories/board'
import { formatDate, getCategoryLabel } from '@/lib/utils'
import { DeleteButton } from './DeleteButton'

export const metadata: Metadata = { title: '게시판 관리' }
export const dynamic = 'force-dynamic'

const PAGE_SIZE = 20

const categoryColors: Record<string, string> = {
  notice: 'bg-blue-100 text-blue-700',
  general: 'bg-gray-100 text-gray-600',
  faq: 'bg-purple-100 text-purple-700',
}

export default async function AdminBoardPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const sp = await searchParams
  const page = Math.max(1, Number(sp.page) || 1)

  const { items, total, totalPages } = await listBoardPosts({
    page,
    pageSize: PAGE_SIZE,
    includeUnpublished: true,
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-black text-gray-900">게시판 관리</h1>
          <p className="text-sm text-gray-400 mt-1">총 {total}개의 게시물</p>
        </div>
        <Link
          href="/admin/board/new"
          className="inline-flex items-center px-4 py-2 rounded-lg bg-primary text-white text-sm font-bold hover:bg-primary-dark transition-colors"
        >
          + 새 게시물
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-left text-gray-500">
              <th className="px-4 py-3 font-semibold w-16">번호</th>
              <th className="px-4 py-3 font-semibold w-28">분류</th>
              <th className="px-4 py-3 font-semibold">제목</th>
              <th className="px-4 py-3 font-semibold w-20 text-center">공개</th>
              <th className="px-4 py-3 font-semibold w-16 text-right">조회</th>
              <th className="px-4 py-3 font-semibold w-28">작성일</th>
              <th className="px-4 py-3 font-semibold w-28 text-right">관리</th>
            </tr>
          </thead>
          <tbody>
            {items.map(post => (
              <tr key={post.id} className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors">
                <td className="px-4 py-3 text-gray-400">{post.id}</td>
                <td className="px-4 py-3">
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      categoryColors[post.category] ?? 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {getCategoryLabel(post.category)}
                  </span>
                </td>
                <td className="px-4 py-3 max-w-0">
                  <div className="flex items-center gap-1.5">
                    {post.pinned && <span className="text-primary text-xs font-bold shrink-0">[고정]</span>}
                    <Link
                      href={`/admin/board/${post.id}/edit`}
                      className="truncate font-medium text-gray-900 hover:text-primary transition-colors"
                    >
                      {post.title}
                    </Link>
                  </div>
                </td>
                <td className="px-4 py-3 text-center">
                  {post.published ? (
                    <span className="text-xs font-semibold text-emerald-600">공개</span>
                  ) : (
                    <span className="text-xs font-semibold text-gray-400">비공개</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right text-gray-400">{post.views}</td>
                <td className="px-4 py-3 text-gray-400">{formatDate(post.createdAt)}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-3">
                    <Link
                      href={`/admin/board/${post.id}/edit`}
                      className="text-sm text-gray-400 hover:text-primary font-semibold transition-colors"
                    >
                      수정
                    </Link>
                    <DeleteButton id={post.id} title={post.title} />
                  </div>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-16 text-center text-gray-400">
                  등록된 게시물이 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-1 mt-6">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <Link
              key={p}
              href={p > 1 ? `/admin/board?page=${p}` : '/admin/board'}
              className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-semibold transition-colors ${
                p === page ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {p}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
