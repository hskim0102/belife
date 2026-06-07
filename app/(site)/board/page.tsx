import type { Metadata } from 'next'
import Link from 'next/link'
import { getCategoryCounts } from '@/lib/repositories/posts'
import { BOARD_CATEGORIES, BOARD_CATEGORY_KEYS } from '@/lib/boardCategories'
import { SectionLabel } from '@/components/ui/SectionLabel'

export const metadata: Metadata = { title: '게시판' }
export const revalidate = 60

export default async function BoardLandingPage() {
  const counts = await getCategoryCounts(BOARD_CATEGORY_KEYS)

  // 단독 게시판(공지사항·사진게시판)과 홍보자료 묶음을 구분해 보여준다.
  const standalone = BOARD_CATEGORIES.filter(c => !c.group)
  const promo = BOARD_CATEGORIES.filter(c => c.group === '홍보자료')

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
        <span className="block text-sm text-gray-400 mt-0.5">{counts[cat.key] ?? 0}개의 게시물</span>
      </span>
      <span className="text-gray-300 group-hover:text-primary-darker transition-colors" aria-hidden="true">
        →
      </span>
    </Link>
  )

  return (
    <>
      <div className="bg-gradient-to-br from-primary-darker to-primary-dark px-6 py-16">
        <div className="max-w-5xl mx-auto">
          <SectionLabel>Board</SectionLabel>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">게시판</h1>
        </div>
      </div>

      <div className="py-16 px-6">
        <div className="max-w-5xl mx-auto space-y-12">
          <section>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {standalone.map(cat => (
                <Card key={cat.key} cat={cat} />
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-lg font-black text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-1.5 h-5 bg-primary rounded-full" />
              홍보자료
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {promo.map(cat => (
                <Card key={cat.key} cat={cat} />
              ))}
            </div>
          </section>
        </div>
      </div>
    </>
  )
}
