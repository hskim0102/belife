import type { Metadata } from 'next'
import { getMilestones } from '@/lib/sanity/queries'
import { SectionLabel } from '@/components/ui/SectionLabel'

export const metadata: Metadata = { title: '발자취' }

export default async function HistoryPage() {
  const milestones = await getMilestones()

  const byYear = milestones.reduce<Record<number, typeof milestones>>((acc, m) => {
    if (!acc[m.year]) acc[m.year] = []
    acc[m.year].push(m)
    return acc
  }, {})
  const years = Object.keys(byYear).map(Number).sort((a, b) => b - a)

  return (
    <div className="py-20 px-6">
      <div className="max-w-3xl mx-auto">
        <SectionLabel>History</SectionLabel>
        <h1 className="text-4xl font-black mb-16">발자취</h1>
        <div className="relative border-l-2 border-primary-lighter pl-8 space-y-12">
          {years.map(year => (
            <div key={year}>
              <h2 className="text-2xl font-black text-primary -ml-10 mb-4">{year}</h2>
              <ul className="space-y-3">
                {[...byYear[year]].sort((a, b) => a.month - b.month).map(m => (
                  <li key={m._id} className="flex gap-3 text-sm leading-relaxed">
                    <span className="font-bold text-primary-dark w-6 shrink-0">{m.month}</span>
                    <span className="text-text-subtle">{m.content}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          {years.length === 0 && (
            <p className="text-text-subtle">등록된 발자취가 없습니다.</p>
          )}
        </div>
      </div>
    </div>
  )
}
