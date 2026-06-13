import type { Metadata } from 'next'
import Link from 'next/link'
import { getAllMissionCards } from '@/lib/repositories/missionCards'
import { formatDate } from '@/lib/utils'
import { RowActions } from '@/components/admin/RowActions'
import { deleteMissionCardAction } from '../../mission-card-actions'

export const metadata: Metadata = { title: '소명 카드 관리' }
export const dynamic = 'force-dynamic'

export default async function AdminMissionCardsPage() {
  const cards = await getAllMissionCards()

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-black text-gray-900">소명 카드 관리</h1>
          <p className="text-sm text-gray-400 mt-1">
            홈페이지 "우리가 섬기는 이웃들" 섹션입니다. 총 {cards.length}개
          </p>
        </div>
        <Link
          href="/admin/mission-cards/new"
          className="inline-flex items-center px-4 py-2 rounded-lg bg-primary text-white text-sm font-bold hover:bg-primary-dark transition-colors"
        >
          + 새 카드
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-left text-gray-500">
              <th className="px-4 py-3 font-semibold w-16">번호</th>
              <th className="px-4 py-3 font-semibold w-12">아이콘</th>
              <th className="px-4 py-3 font-semibold w-32">제목</th>
              <th className="px-4 py-3 font-semibold">설명</th>
              <th className="px-4 py-3 font-semibold w-20">노출</th>
              <th className="px-4 py-3 font-semibold w-28">수정일</th>
              <th className="px-4 py-3 font-semibold w-32 text-right">관리</th>
            </tr>
          </thead>
          <tbody>
            {cards.map(card => (
              <tr key={card.id} className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors">
                <td className="px-4 py-3 text-gray-400">{card.id}</td>
                <td className="px-4 py-3 text-2xl">{card.iconEmoji}</td>
                <td className="px-4 py-3 font-semibold text-gray-900">{card.title}</td>
                <td className="px-4 py-3 text-gray-600 max-w-0">
                  <span className="block truncate">{card.description}</span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      card.enabled ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    {card.enabled ? '노출' : '숨김'}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-400">{formatDate(card.updatedAt)}</td>
                <td className="px-4 py-3">
                  <RowActions
                    id={card.id}
                    title={card.title}
                    viewHref="/"
                    editHref={`/admin/mission-cards/${card.id}/edit`}
                    deleteAction={deleteMissionCardAction}
                  />
                </td>
              </tr>
            ))}
            {cards.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-16 text-center text-gray-400">
                  등록된 카드가 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
