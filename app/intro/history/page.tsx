import type { Metadata } from 'next'
import { getMilestones } from '@/lib/sanity/queries'
import { SectionLabel } from '@/components/ui/SectionLabel'

export const metadata: Metadata = { title: '발자취' }

export const revalidate = 60

export default async function HistoryPage() {
  const milestones = await getMilestones()

  const byYear = milestones.reduce<Record<number, typeof milestones>>((acc, m) => {
    if (!acc[m.year]) acc[m.year] = []
    acc[m.year].push(m)
    return acc
  }, {})
  const years = Object.keys(byYear).map(Number).sort((a, b) => b - a)

  return (
    <>
      <div className="bg-gradient-to-br from-primary-darker to-primary-dark px-6 py-16">
        <div className="max-w-3xl mx-auto">
          <SectionLabel>History</SectionLabel>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">발자취</h1>
        </div>
      </div>

      <div className="py-16 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="relative border-l-2 border-primary-lighter pl-8 space-y-12">
            {years.map(year => (
              <div key={year}>
                <div className="absolute -left-3 w-6 h-6 rounded-full bg-primary border-4 border-white shadow-sm" style={{ marginTop: '-2px' }} />
                <h2 className="text-2xl font-black text-primary-dark -ml-10 mb-4">{year}</h2>
                <ul className="space-y-3">
                  {[...byYear[year]].sort((a, b) => a.month - b.month).map(m => (
                    <li key={m._id} className="flex gap-3 text-sm leading-relaxed">
                      <span className="font-bold text-primary w-6 shrink-0 text-right">{m.month}월</span>
                      <span className="text-gray-600">{m.content}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            {years.length === 0 && (
              <p className="text-gray-400">등록된 발자취가 없습니다.</p>
            )}
          </div>
        </div>
      </div>
    </>
  )
}