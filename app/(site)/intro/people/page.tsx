import type { Metadata } from 'next'
import { getMembers } from '@/lib/repositories/misc'
import { getMemberGroups } from '@/lib/repositories/memberGroups'
import { PageHero } from '@/components/ui/PageHero'
import type { Member } from '@/lib/types'

export const metadata: Metadata = { title: '함께하는 사람들' }

export const revalidate = 60

/** 구분이 늘어나도 색이 모자라지 않도록 순서대로 돌려 쓴다. */
const groupPalette = [
  'bg-emerald-50 border-emerald-100',
  'bg-teal-50 border-teal-100',
  'bg-purple-50 border-purple-100',
  'bg-amber-50 border-amber-100',
  'bg-rose-50 border-rose-100',
  'bg-sky-50 border-sky-100',
]

export default async function PeoplePage() {
  const [members, groups] = await Promise.all([getMembers(), getMemberGroups()])

  const byGroup = members.reduce<Record<string, Member[]>>((acc, m) => {
    if (!acc[m.group]) acc[m.group] = []
    acc[m.group].push(m)
    return acc
  }, {})

  const visibleGroups = groups.filter(g => byGroup[g.key]?.length)

  return (
    <>
      <PageHero label="People" title="함께하는 사람들" icon="🤝" maxWidth="max-w-3xl" />

      <div className="py-16 px-6">
        <div className="max-w-3xl mx-auto space-y-10">
          {visibleGroups.map((group, i) => (
            <div
              key={group.key}
              className={`rounded-2xl p-6 border ${groupPalette[i % groupPalette.length]}`}
            >
              <h2 className="text-lg font-black text-gray-800 mb-5">{group.label}</h2>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {byGroup[group.key].map(m => (
                  <li key={m.id} className="flex gap-3 text-sm bg-white rounded-xl p-3 border border-white shadow-sm">
                    <span className="font-bold text-gray-900 w-20 shrink-0">{m.name}</span>
                    <span className="text-gray-500">{m.position}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          {members.length === 0 && <p className="text-gray-400">등록된 멤버가 없습니다.</p>}
        </div>
      </div>
    </>
  )
}
