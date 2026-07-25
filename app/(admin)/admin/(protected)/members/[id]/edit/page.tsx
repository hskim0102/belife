import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getMemberById } from '@/lib/repositories/misc'
import { getMemberGroups } from '@/lib/repositories/memberGroups'
import { updateMemberAction } from '../../../../member-actions'
import { MemberEditorForm } from '../../MemberEditorForm'

export const metadata: Metadata = { title: '멤버 수정' }
export const dynamic = 'force-dynamic'

export default async function EditMemberPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const numericId = Number(id)
  if (!Number.isInteger(numericId) || numericId <= 0) notFound()

  const [member, groups] = await Promise.all([getMemberById(numericId), getMemberGroups()])
  if (!member) notFound()

  return (
    <div className="max-w-3xl">
      <Link href="/admin/members" className="text-sm text-gray-400 hover:text-primary transition-colors">
        ← 목록으로
      </Link>
      <h1 className="mt-3 mb-6 text-xl font-black text-gray-900">멤버 수정</h1>
      <MemberEditorForm action={updateMemberAction} member={member} groups={groups} submitLabel="수정" />
    </div>
  )
}
