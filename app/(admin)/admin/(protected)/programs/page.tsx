import type { Metadata } from 'next'
import Link from 'next/link'
import { getAllPrograms } from '@/lib/repositories/programs'
import { formatDate, getCategoryLabel } from '@/lib/utils'
import type { Program } from '@/lib/types'
import { RowActions } from '@/components/admin/RowActions'
import { deleteProgramAction } from '../../program-actions'

export const metadata: Metadata = { title: '사업 관리' }
export const dynamic = 'force-dynamic'

const CATEGORIES = ['domestic', 'overseas', 'education'] as const

export default async function AdminProgramsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>
}) {
  const sp = await searchParams
  const category = sp.category as Program['category'] | undefined
  const all = await getAllPrograms()
  const programs = category ? all.filter(p => p.category === category) : all

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-black text-gray-900">사업 관리</h1>
          <p className="text-sm text-gray-400 mt-1">
            사업 소개 페이지의 프로그램 목록입니다. 총 {programs.length}개
          </p>
        </div>
        <Link
          href="/admin/programs/new"
          className="inline-flex items-center px-4 py-2 rounded-lg bg-primary text-white text-sm font-bold hover:bg-primary-dark transition-colors"
        >
          + 새 사업
        </Link>
      </div>

      {/* 분류 필터 */}
      <div className="flex flex-wrap gap-1.5 mb-5">
        <Link
          href="/admin/programs"
          className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
            !category ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          전체
        </Link>
        {CATEGORIES.map(c => (
          <Link
            key={c}
            href={`/admin/programs?category=${c}`}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
              category === c ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {getCategoryLabel(c)}
          </Link>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-left text-gray-500">
              <th className="px-4 py-3 font-semibold w-16">번호</th>
              <th className="px-4 py-3 font-semibold w-32">분류</th>
              <th className="px-4 py-3 font-semibold">사업명</th>
              <th className="px-4 py-3 font-semibold w-16">순서</th>
              <th className="px-4 py-3 font-semibold w-32 text-right">관리</th>
            </tr>
          </thead>
          <tbody>
            {programs.map(program => (
              <tr key={program.id} className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors">
                <td className="px-4 py-3 text-gray-400">{program.id}</td>
                <td className="px-4 py-3">
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                    {getCategoryLabel(program.category)}
                  </span>
                </td>
                <td className="px-4 py-3 max-w-0">
                  <Link
                    href={`/admin/programs/${program.id}/edit`}
                    className="block truncate font-medium text-gray-900 hover:text-primary transition-colors"
                  >
                    {program.name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-gray-400">{program.order}</td>
                <td className="px-4 py-3">
                  <RowActions
                    id={program.id}
                    title={program.name}
                    viewHref={`/programs/${program.slug}`}
                    editHref={`/admin/programs/${program.id}/edit`}
                    deleteAction={deleteProgramAction}
                  />
                </td>
              </tr>
            ))}
            {programs.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-16 text-center text-gray-400">
                  등록된 사업이 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
