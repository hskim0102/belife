import type { Metadata } from 'next'
import { getMembers } from '@/lib/sanity/queries'
import { SectionLabel } from '@/components/ui/SectionLabel'
import type { Member } from '@/lib/sanity/types'

export const metadata: Metadata = { title: '함께하는 사람들' }

const groupLabels: Record<string, string> = {
  board: '이사회',
  auditor: '감사',
  advisor: '자문위원',
  staff: '상근자',
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
    <div className="py-20 px-6">
      <div className="max-w-3xl mx-auto">
        <SectionLabel>People</SectionLabel>
        <h1 className="text-4xl font-black mb-16">함께하는 사람들</h1>
        <div className="space-y-12">
          {groupOrder.filter(g => byGroup[g]?.length).map(group => (
            <div key={group}>
              <h2 className="text-lg font-black text-primary-dark mb-4 border-b border-primary-lighter pb-2">
                {groupLabels[group]}
              </h2>
              <ul className="space-y-2">
                {byGroup[group].map(m => (
                  <li key={m._id} className="flex gap-4 text-sm">
                    <span className="font-bold w-20 shrink-0">{m.name}</span>
                    <span className="text-text-subtle">{m.position}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          {members.length === 0 && (
            <p className="text-text-subtle">등록된 멤버가 없습니다.</p>
          )}
        </div>
      </div>
    </div>
  )
}
