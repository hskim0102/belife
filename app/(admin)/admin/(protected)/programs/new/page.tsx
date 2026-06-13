import type { Metadata } from 'next'
import Link from 'next/link'
import { createProgramAction } from '../../../program-actions'
import { ProgramEditorForm } from '../ProgramEditorForm'

export const metadata: Metadata = { title: '새 사업' }

export default function NewProgramPage() {
  return (
    <div className="max-w-3xl">
      <Link href="/admin/programs" className="text-sm text-gray-400 hover:text-primary transition-colors">
        ← 목록으로
      </Link>
      <h1 className="mt-3 mb-6 text-xl font-black text-gray-900">새 사업 등록</h1>
      <ProgramEditorForm action={createProgramAction} submitLabel="등록" />
    </div>
  )
}
