import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getMissionCardById } from '@/lib/repositories/missionCards'
import { updateMissionCardAction } from '../../../../mission-card-actions'
import { MissionCardEditorForm } from '../../MissionCardEditorForm'

export const metadata: Metadata = { title: '소명 카드 수정' }
export const dynamic = 'force-dynamic'

export default async function EditMissionCardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const numericId = Number(id)
  if (!Number.isInteger(numericId) || numericId <= 0) notFound()

  const card = await getMissionCardById(numericId)
  if (!card) notFound()

  return (
    <div className="max-w-3xl">
      <Link href="/admin/mission-cards" className="text-sm text-gray-400 hover:text-primary transition-colors">
        ← 목록으로
      </Link>
      <h1 className="mt-3 mb-6 text-xl font-black text-gray-900">소명 카드 수정</h1>
      <MissionCardEditorForm action={updateMissionCardAction} card={card} submitLabel="수정" />
    </div>
  )
}
