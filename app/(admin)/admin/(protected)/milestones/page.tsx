import type { Metadata } from 'next'
import Link from 'next/link'
import { getMilestones } from '@/lib/repositories/misc'
import { RowActions } from '@/components/admin/RowActions'
import { deleteMilestoneAction } from '../../milestone-actions'

export const metadata: Metadata = { title: '발자취 관리' }
export const dynamic = 'force-dynamic'

export default async function AdminMilestonesPage() {
  const milestones = await getMilestones()

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-black text-gray-900">발자취 관리</h1>
          <p className="text-sm text-gray-400 mt-1">
            소개 &gt; 발자취 페이지의 연혁입니다. 총 {milestones.length}건
          </p>
        </div>
        <Link
          href="/admin/milestones/new"
          className="inline-flex items-center px-4 py-2 rounded-lg bg-primary text-white text-sm font-bold hover:bg-primary-dark transition-colors"
        >
          + 새 연혁
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-left text-gray-500">
              <th className="px-4 py-3 font-semibold w-16">번호</th>
              <th className="px-4 py-3 font-semibold w-24">연도</th>
              <th className="px-4 py-3 font-semibold w-16">월</th>
              <th className="px-4 py-3 font-semibold">내용</th>
              <th className="px-4 py-3 font-semibold w-32 text-right">관리</th>
            </tr>
          </thead>
          <tbody>
            {milestones.map(m => (
              <tr key={m.id} className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors">
                <td className="px-4 py-3 text-gray-400">{m.id}</td>
                <td className="px-4 py-3 font-semibold text-gray-700">{m.year}</td>
                <td className="px-4 py-3 text-gray-500">{m.month}월</td>
                <td className="px-4 py-3 max-w-0">
                  <Link
                    href={`/admin/milestones/${m.id}/edit`}
                    className="block truncate font-medium text-gray-900 hover:text-primary transition-colors"
                  >
                    {m.content}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <RowActions
                    id={m.id}
                    title={`${m.year}년 ${m.month}월 — ${m.content.slice(0, 30)}`}
                    viewHref="/intro/history"
                    editHref={`/admin/milestones/${m.id}/edit`}
                    deleteAction={deleteMilestoneAction}
                  />
                </td>
              </tr>
            ))}
            {milestones.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-16 text-center text-gray-400">
                  등록된 연혁이 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
