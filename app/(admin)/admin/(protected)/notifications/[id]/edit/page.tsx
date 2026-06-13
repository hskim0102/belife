import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getNotificationById } from '@/lib/repositories/notifications'
import { updateNotificationAction } from '../../../../notification-actions'
import { NotificationEditorForm } from '../../NotificationEditorForm'

export const metadata: Metadata = { title: '알림 수정' }
export const dynamic = 'force-dynamic'

export default async function EditNotificationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const numericId = Number(id)
  if (!Number.isInteger(numericId) || numericId <= 0) notFound()

  const notification = await getNotificationById(numericId)
  if (!notification) notFound()

  return (
    <div className="max-w-3xl">
      <Link href="/admin/notifications" className="text-sm text-gray-400 hover:text-primary transition-colors">
        ← 목록으로
      </Link>
      <h1 className="mt-3 mb-6 text-xl font-black text-gray-900">팝업 알림 수정</h1>
      <NotificationEditorForm action={updateNotificationAction} notification={notification} submitLabel="수정" />
    </div>
  )
}
