import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getMilestoneById } from '@/lib/repositories/misc'
import { updateMilestoneAction } from '../../../../milestone-actions'
import { MilestoneEditorForm } from '../../MilestoneEditorForm'

export const metadata: Metadata = { title: '연혁 수정' }
export const dynamic = 'force-dynamic'

export default async function EditMilestonePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const numericId = Number(id)
  if (!Number.isInteger(numericId) || numericId <= 0) notFound()

  const milestone = await getMilestoneById(numericId)
  if (!milestone) notFound()

  return (
    <div className="max-w-3xl">
      <Link href="/admin/milestones" className="text-sm text-gray-400 hover:text-primary transition-colors">
        ← 목록으로
      </Link>
      <h1 className="mt-3 mb-6 text-xl font-black text-gray-900">연혁 수정</h1>
      <MilestoneEditorForm action={updateMilestoneAction} milestone={milestone} submitLabel="수정" />
    </div>
  )
}
