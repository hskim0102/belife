import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getProgramById } from '@/lib/repositories/programs'
import { updateProgramAction } from '../../../../program-actions'
import { ProgramEditorForm } from '../../ProgramEditorForm'

export const metadata: Metadata = { title: '사업 수정' }
export const dynamic = 'force-dynamic'

export default async function EditProgramPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const numericId = Number(id)
  if (!Number.isInteger(numericId) || numericId <= 0) notFound()

  const program = await getProgramById(numericId)
  if (!program) notFound()

  return (
    <div className="max-w-3xl">
      <Link href="/admin/programs" className="text-sm text-gray-400 hover:text-primary transition-colors">
        ← 목록으로
      </Link>
      <h1 className="mt-3 mb-6 text-xl font-black text-gray-900">사업 수정</h1>
      <ProgramEditorForm action={updateProgramAction} program={program} submitLabel="수정" />
    </div>
  )
}
