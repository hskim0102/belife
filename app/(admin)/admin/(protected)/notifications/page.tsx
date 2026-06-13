import type { Metadata } from 'next'
import Link from 'next/link'
import { getAllNotifications } from '@/lib/repositories/notifications'
import { formatDate } from '@/lib/utils'
import { RowActions } from '@/components/admin/RowActions'
import { deleteNotificationAction } from '../../notification-actions'

export const metadata: Metadata = { title: '팝업 알림 관리' }
export const dynamic = 'force-dynamic'

const TYPES = [
  { key: 'info', label: '정보', color: 'bg-blue-50 text-blue-600' },
  { key: 'success', label: '성공', color: 'bg-emerald-50 text-emerald-600' },
  { key: 'warning', label: '경고', color: 'bg-amber-50 text-amber-600' },
  { key: 'error', label: '오류', color: 'bg-red-50 text-red-600' },
]

export default async function AdminNotificationsPage() {
  const notifications = await getAllNotifications()

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-black text-gray-900">팝업 알림 관리</h1>
          <p className="text-sm text-gray-400 mt-1">
            사이트 방문 시 표시할 팝업 알림입니다. 활성화된 첫 번째 알림이 표시됩니다. 총 {notifications.length}개
          </p>
        </div>
        <Link
          href="/admin/notifications/new"
          className="inline-flex items-center px-4 py-2 rounded-lg bg-primary text-white text-sm font-bold hover:bg-primary-dark transition-colors"
        >
          + 새 알림
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-left text-gray-500">
              <th className="px-4 py-3 font-semibold w-16">번호</th>
              <th className="px-4 py-3 font-semibold w-20">상태</th>
              <th className="px-4 py-3 font-semibold w-20">타입</th>
              <th className="px-4 py-3 font-semibold w-28">노출 빈도</th>
              <th className="px-4 py-3 font-semibold">제목</th>
              <th className="px-4 py-3 font-semibold w-28">수정일</th>
              <th className="px-4 py-3 font-semibold w-32 text-right">관리</th>
            </tr>
          </thead>
          <tbody>
            {notifications.map(notification => {
              const typeInfo = TYPES.find(t => t.key === notification.type)
              return (
                <tr key={notification.id} className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors">
                  <td className="px-4 py-3 text-gray-400">{notification.id}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        notification.enabled ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      {notification.enabled ? '활성' : '비활성'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${typeInfo?.color ?? ''}`}>
                      {typeInfo?.label}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">
                      {notification.showFrequency === 'always' ? '매번' : '일 1회'}
                    </span>
                  </td>
                  <td className="px-4 py-3 max-w-0">
                    <Link
                      href={`/admin/notifications/${notification.id}/edit`}
                      className="block truncate font-medium text-gray-900 hover:text-primary transition-colors"
                    >
                      {notification.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-400">{formatDate(notification.updatedAt)}</td>
                  <td className="px-4 py-3">
                    <RowActions
                      id={notification.id}
                      title={notification.title}
                      viewHref="/"
                      editHref={`/admin/notifications/${notification.id}/edit`}
                      deleteAction={deleteNotificationAction}
                    />
                  </td>
                </tr>
              )
            })}
            {notifications.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-16 text-center text-gray-400">
                  등록된 알림이 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
