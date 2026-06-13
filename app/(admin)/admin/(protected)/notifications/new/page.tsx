import type { Metadata } from 'next'
import Link from 'next/link'
import { createNotificationAction } from '../../../notification-actions'
import { NotificationEditorForm } from '../NotificationEditorForm'

export const metadata: Metadata = { title: '새 알림' }

export default function NewNotificationPage() {
  return (
    <div className="max-w-3xl">
      <Link href="/admin/notifications" className="text-sm text-gray-400 hover:text-primary transition-colors">
        ← 목록으로
      </Link>
      <h1 className="mt-3 mb-6 text-xl font-black text-gray-900">새 팝업 알림 등록</h1>
      <NotificationEditorForm action={createNotificationAction} submitLabel="등록" />
    </div>
  )
}
