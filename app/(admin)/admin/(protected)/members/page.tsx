import type { Metadata } from 'next'
import Link from 'next/link'
import { getMembers } from '@/lib/repositories/misc'
import { getMemberGroups } from '@/lib/repositories/memberGroups'
import { memberGroupLabelMap } from '@/lib/members'
import { RowActions } from '@/components/admin/RowActions'
import { deleteMemberAction } from '../../member-actions'

export const metadata: Metadata = { title: '함께하는 사람들 관리' }
export const dynamic = 'force-dynamic'

export default async function AdminMembersPage({
  searchParams,
}: {
  searchParams: Promise<{ group?: string }>
}) {
  const sp = await searchParams
  const [all, groups] = await Promise.all([getMembers(), getMemberGroups()])
  const labels = memberGroupLabelMap(groups)

  const group = sp.group && labels.has(sp.group) ? sp.group : undefined
  const members = group ? all.filter(m => m.group === group) : all

  const filters = [{ key: 'all', label: '전체' }, ...groups.map(g => ({ key: g.key, label: g.label }))]

  return (
    <div>
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-black text-gray-900">함께하는 사람들 관리</h1>
          <p className="text-sm text-gray-400 mt-1">
            소개 &gt; 함께하는 사람들 페이지의 임원진·상근자 명단입니다. 총 {members.length}명
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/admin/members/groups"
            className="inline-flex items-center px-4 py-2 rounded-lg bg-gray-100 text-gray-700 text-sm font-bold hover:bg-gray-200 transition-colors"
          >
            구분 관리
          </Link>
          <Link
            href="/admin/members/new"
            className="inline-flex items-center px-4 py-2 rounded-lg bg-primary text-white text-sm font-bold hover:bg-primary-dark transition-colors"
          >
            + 새 멤버
          </Link>
        </div>
      </div>

      {/* 구분 필터 */}
      <div className="flex flex-wrap gap-1.5 mb-5">
        {filters.map(f => {
          const active = (f.key === 'all' && !group) || f.key === group
          const href = f.key === 'all' ? '/admin/members' : `/admin/members?group=${f.key}`
          return (
            <Link
              key={f.key}
              href={href}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                active ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {f.label}
            </Link>
          )
        })}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-left text-gray-500">
              <th className="px-4 py-3 font-semibold w-16">번호</th>
              <th className="px-4 py-3 font-semibold w-28">구분</th>
              <th className="px-4 py-3 font-semibold w-36">이름</th>
              <th className="px-4 py-3 font-semibold">직책</th>
              <th className="px-4 py-3 font-semibold w-16">순서</th>
              <th className="px-4 py-3 font-semibold w-32 text-right">관리</th>
            </tr>
          </thead>
          <tbody>
            {members.map(member => (
              <tr key={member.id} className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors">
                <td className="px-4 py-3 text-gray-400">{member.id}</td>
                <td className="px-4 py-3">
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                    {labels.get(member.group) ?? member.group}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/members/${member.id}/edit`}
                    className="font-medium text-gray-900 hover:text-primary transition-colors"
                  >
                    {member.name}
                  </Link>
                </td>
                <td className="px-4 py-3 max-w-0">
                  <span className="block truncate text-gray-500">{member.position}</span>
                </td>
                <td className="px-4 py-3 text-gray-400">{member.order}</td>
                <td className="px-4 py-3">
                  <RowActions
                    id={member.id}
                    title={member.name}
                    viewHref="/intro/people"
                    editHref={`/admin/members/${member.id}/edit`}
                    deleteAction={deleteMemberAction}
                  />
                </td>
              </tr>
            ))}
            {members.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-16 text-center text-gray-400">
                  등록된 멤버가 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
