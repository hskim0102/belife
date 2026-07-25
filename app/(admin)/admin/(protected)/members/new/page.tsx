import type { Metadata } from 'next'
import Link from 'next/link'
import { getMemberGroups } from '@/lib/repositories/memberGroups'
import { createMemberAction } from '../../../member-actions'
import { MemberEditorForm } from '../MemberEditorForm'

export const metadata: Metadata = { title: '새 멤버' }
export const dynamic = 'force-dynamic'

export default async function NewMemberPage() {
  const groups = await getMemberGroups()

  return (
    <div className="max-w-3xl">
      <Link href="/admin/members" className="text-sm text-gray-400 hover:text-primary transition-colors">
        ← 목록으로
      </Link>
      <h1 className="mt-3 mb-6 text-xl font-black text-gray-900">새 멤버 등록</h1>
      <MemberEditorForm action={createMemberAction} groups={groups} submitLabel="등록" />
    </div>
  )
}
