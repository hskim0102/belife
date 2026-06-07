import type { Metadata } from 'next'
import { getMembers } from '@/lib/repositories/misc'
import { SectionLabel } from '@/components/ui/SectionLabel'
import type { Member } from '@/lib/types'

export const metadata: Metadata = { title: '함께하는 사람들' }

export const revalidate = 60

const groupLabels: Record<string, string> = {
  board: '이사회',
  auditor: '감사',
  advisor: '자문위원',
  staff: '상근자',
}

const groupColors: Record<string, string> = {
  board: 'bg-emerald-50 border-emerald-200',
  auditor: 'bg-blue-50 border-blue-200',
  advisor: 'bg-purple-50 border-purple-200',
  staff: 'bg-amber-50 border-amber-200',
}

export default async function PeoplePage() {
  const members = await getMembers()
  const byGroup = members.reduce<Record<string, Member[]>>((acc, m) => {
    if (!acc[m.group]) acc[m.group] = []
    acc[m.group].push(m)
    return acc
  }, {})
  const groupOrder = ['board', 'auditor', 'advisor', 'staff']

  return (
    <>
      <div className="bg-gradient-to-br from-primary-darker to-primary-dark px-6 py-16">
        <div className="max-w-3xl mx-auto">
          <SectionLabel>People</SectionLabel>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">함께하는 사람들</h1>
        </div>
      </div>

      <div className="py-16 px-6">
        <div className="max-w-3xl mx-auto space-y-10">
          {groupOrder.filter(g => byGroup[g]?.length).map(group => (
            <div key={group} className={`rounded-2xl p-6 border ${groupColors[group] ?? 'bg-gray-50 border-gray-100'}`}>
              <h2 className="text-lg font-black text-gray-800 mb-5">
                {groupLabels[group]}
              </h2>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {byGroup[group].map(m => (
                  <li key={m.id} className="flex gap-3 text-sm bg-white rounded-xl p-3 border border-white shadow-sm">
                    <span className="font-bold text-gray-900 w-20 shrink-0">{m.name}</span>
                    <span className="text-gray-500">{m.position}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          {members.length === 0 && (
            <p className="text-gray-400">등록된 멤버가 없습니다.</p>
          )}
        </div>
      </div>
    </>
  )
}