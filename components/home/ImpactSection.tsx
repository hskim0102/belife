import { ImpactStat } from '@/lib/types'

const fallbackStats: ImpactStat[] = [
  { id: 1, value: '23', unit: '년', label: '활동 역사 (2003~)', order: 0 },
  { id: 2, value: '4', unit: '기', label: '생명사랑의료학교', order: 1 },
  { id: 3, value: '400+', unit: '가구', label: '필리핀 빈민 지원', order: 2 },
  { id: 4, value: '50+', unit: '명', label: '이주민 독감예방접종', order: 3 },
]

export function ImpactSection({ stats }: { stats: ImpactStat[] }) {
  const displayStats = stats.length > 0 ? stats : fallbackStats
  return (
    <section className="bg-primary-darker">
      <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 divide-x divide-white/10">
        {displayStats.map((s) => (
          <div
            key={s.id}
            className="py-8 px-6 text-center"
          >
            <p className="text-3xl md:text-4xl font-black text-white leading-none">
              {s.value}
              {s.unit && <span className="text-lg font-bold text-primary-accent ml-0.5">{s.unit}</span>}
            </p>
            <p className="text-white/55 text-xs mt-2">{s.label}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
