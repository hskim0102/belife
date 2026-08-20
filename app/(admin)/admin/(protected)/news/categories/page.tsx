import type { Metadata } from 'next'
import Link from 'next/link'
import { getNewsCategories } from '@/lib/repositories/newsCategories'
import { NewsCategoryManager } from './NewsCategoryManager'

export const metadata: Metadata = { title: '활동소식 구분 관리' }
export const dynamic = 'force-dynamic'

export default async function AdminNewsCategoriesPage() {
  const categories = await getNewsCategories()

  return (
    <div>
      <div className="mb-6">
        <Link href="/admin/news" className="text-sm text-gray-400 hover:text-primary transition-colors">
          ← 활동소식 관리
        </Link>
        <h1 className="text-xl font-black text-gray-900 mt-2">활동소식 구분 관리</h1>
        <p className="text-sm text-gray-400 mt-1">
          활동소식을 분류하는 구분입니다. 활동소식 작성 화면의 분류 선택과 활동소식 페이지의 필터에
          사용됩니다.
          정렬 순서가 작을수록 목록에서 위에 나옵니다.
        </p>
      </div>

      <NewsCategoryManager categories={categories} />
    </div>
  )
}
