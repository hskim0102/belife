import type { Metadata } from 'next'
import Link from 'next/link'
import { createMissionCardAction } from '../../../mission-card-actions'
import { MissionCardEditorForm } from '../MissionCardEditorForm'

export const metadata: Metadata = { title: '새 소명 카드' }

export default function NewMissionCardPage() {
  return (
    <div className="max-w-3xl">
      <Link href="/admin/mission-cards" className="text-sm text-gray-400 hover:text-primary transition-colors">
        ← 목록으로
      </Link>
      <h1 className="mt-3 mb-6 text-xl font-black text-gray-900">새 소명 카드 등록</h1>
      <MissionCardEditorForm action={createMissionCardAction} submitLabel="등록" />
    </div>
  )
}
