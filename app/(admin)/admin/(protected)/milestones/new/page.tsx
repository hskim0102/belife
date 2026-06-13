import type { Metadata } from 'next'
import Link from 'next/link'
import { createMilestoneAction } from '../../../milestone-actions'
import { MilestoneEditorForm } from '../MilestoneEditorForm'

export const metadata: Metadata = { title: '새 연혁' }

export default function NewMilestonePage() {
  return (
    <div className="max-w-3xl">
      <Link href="/admin/milestones" className="text-sm text-gray-400 hover:text-primary transition-colors">
        ← 목록으로
      </Link>
      <h1 className="mt-3 mb-6 text-xl font-black text-gray-900">새 연혁 등록</h1>
      <MilestoneEditorForm action={createMilestoneAction} submitLabel="등록" />
    </div>
  )
}
