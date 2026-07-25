import type { Metadata } from 'next'
import Link from 'next/link'
import { getMemberGroups } from '@/lib/repositories/memberGroups'
import { MemberGroupManager } from './MemberGroupManager'

export const metadata: Metadata = { title: '구분 관리' }
export const dynamic = 'force-dynamic'

export default async function AdminMemberGroupsPage() {
  const groups = await getMemberGroups()

  return (
    <div>
      <div className="mb-6">
        <Link href="/admin/members" className="text-sm text-gray-400 hover:text-primary transition-colors">
          ← 함께하는 사람들
        </Link>
        <h1 className="text-xl font-black text-gray-900 mt-2">구분 관리</h1>
        <p className="text-sm text-gray-400 mt-1">
          이사회·감사처럼 멤버를 묶는 구분입니다. 정렬 순서가 작을수록 공개 페이지에서 위에 나옵니다.
        </p>
      </div>

      <MemberGroupManager groups={groups} />
    </div>
  )
}
