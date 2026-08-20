import type { Metadata } from 'next'
import Link from 'next/link'
import { getCategoryCounts } from '@/lib/repositories/posts'
import { BOARD_CATEGORIES } from '@/lib/boardCategories'
import { PageHero } from '@/components/ui/PageHero'

export const metadata: Metadata = { title: '게시판' }
export const revalidate = 60

export default async function BoardLandingPage() {
  // 로그인이 필요한 게시판(사무국)의 글 수는 조회하지 않는다.
  const counts = await getCategoryCounts(
    BOARD_CATEGORIES.filter(c => !c.requiresLogin).map(c => c.key),
  )

  const Card = ({ cat }: { cat: (typeof BOARD_CATEGORIES)[number] }) => (
    <Link
      href={`/board/${cat.key}`}
      className="group rounded-2xl border border-gray-100 bg-white p-6 flex items-center gap-4 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
    >
      <span className="text-3xl shrink-0">{cat.emoji}</span>
      <span className="flex-1 min-w-0">
        <span className="block font-bold text-gray-900 group-hover:text-primary-darker transition-colors">
          {cat.label}
        </span>
        <span className="block text-sm text-gray-400 mt-0.5">
          {/* 로그인이 필요한 게시판은 글 수도 감춘다(내용을 짐작할 수 있으므로) */}
          {cat.requiresLogin ? '🔒 로그인 후 열람' : `${counts[cat.key] ?? 0}개의 게시물`}
        </span>
      </span>
      <span className="text-gray-300 group-hover:text-primary-darker transition-colors" aria-hidden="true">
        →
      </span>
    </Link>
  )

  return (
    <>
      <PageHero label="Board" title="게시판" icon="📋" maxWidth="max-w-5xl" />

      <div className="py-16 px-6">
        <div className="max-w-5xl mx-auto">
          {/* 메뉴와 같은 순서(BOARD_CATEGORIES)로 한 줄에 펼친다. */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {BOARD_CATEGORIES.map(cat => (
              <Card key={cat.key} cat={cat} />
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
