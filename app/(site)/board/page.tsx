import type { Metadata } from 'next'
import Link from 'next/link'
import { listBoardPosts } from '@/lib/repositories/board'
import type { BoardCategory } from '@/lib/types'
import { formatDate, getCategoryLabel } from '@/lib/utils'
import { SectionLabel } from '@/components/ui/SectionLabel'

export const metadata: Metadata = { title: '게시판' }
export const revalidate = 30

const PAGE_SIZE = 10

const categoryColors: Record<string, string> = {
  notice: 'bg-blue-100 text-blue-700',
  general: 'bg-gray-100 text-gray-600',
  faq: 'bg-purple-100 text-purple-700',
}

const filters: { key: BoardCategory | 'all'; label: string }[] = [
  { key: 'all', label: '전체' },
  { key: 'notice', label: '공지사항' },
  { key: 'general', label: '일반' },
  { key: 'faq', label: '자주 묻는 질문' },
]

function parseCategory(value: string | undefined): BoardCategory | undefined {
  return value === 'notice' || value === 'general' || value === 'faq' ? value : undefined
}

export default async function BoardPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; category?: string }>
}) {
  const sp = await searchParams
  const page = Math.max(1, Number(sp.page) || 1)
  const category = parseCategory(sp.category)

  const { items, total, totalPages } = await listBoardPosts({ page, pageSize: PAGE_SIZE, category })

  const buildHref = (p: number, c?: BoardCategory) => {
    const params = new URLSearchParams()
    if (c) params.set('category', c)
    if (p > 1) params.set('page', String(p))
    const qs = params.toString()
    return qs ? `/board?${qs}` : '/board'
  }

  return (
    <>
      <div className="bg-gradient-to-br from-primary-darker to-primary-dark px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <SectionLabel>Board</SectionLabel>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">게시판</h1>
        </div>
      </div>

      <div className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Category filters */}
          <div className="flex flex-wrap gap-2 mb-8">
            {filters.map(f => {
              const active = (f.key === 'all' && !category) || f.key === category
              return (
                <Link
                  key={f.key}
                  href={buildHref(1, f.key === 'all' ? undefined : f.key)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                    active ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {f.label}
                </Link>
              )
            })}
          </div>

          {/* List */}
          <div className="border-t-2 border-gray-900">
            {items.map(post => (
              <Link
                key={post.id}
                href={`/board/${post.id}`}
                className="flex items-center gap-4 px-2 py-4 border-b border-gray-100 hover:bg-gray-50 transition-colors"
              >
                <span
                  className={`shrink-0 text-xs font-bold px-2.5 py-1 rounded-full ${
                    categoryColors[post.category] ?? 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {getCategoryLabel(post.category)}
                </span>
                <span className="flex-1 min-w-0 flex items-center gap-2">
                  {post.pinned && <span className="text-primary text-xs font-bold">[고정]</span>}
                  <span className="truncate font-medium text-gray-900">{post.title}</span>
                </span>
                <span className="shrink-0 hidden sm:block text-sm text-gray-400">{post.author}</span>
                <span className="shrink-0 text-sm text-gray-400 w-24 text-right">{formatDate(post.createdAt)}</span>
              </Link>
            ))}

            {items.length === 0 && (
              <div className="text-center py-20">
                <p className="text-gray-400 text-lg mb-2">등록된 게시물이 없습니다.</p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-1 mt-10">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <Link
                  key={p}
                  href={buildHref(p, category)}
                  className={`w-10 h-10 flex items-center justify-center rounded-lg text-sm font-semibold transition-colors ${
                    p === page ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {p}
                </Link>
              ))}
            </div>
          )}

          <p className="text-center text-xs text-gray-400 mt-6">총 {total}개의 게시물</p>
        </div>
      </div>
    </>
  )
}
