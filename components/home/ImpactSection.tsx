import { ImpactStat } from '@/lib/sanity/types'

const fallbackStats: ImpactStat[] = [
  { _id: '1', value: '20', unit: '년', label: '활동 역사 (2006~)' },
  { _id: '2', value: '4', unit: '기', label: '생명사랑의료학교 (2025)' },
  { _id: '3', value: '400+', unit: '가구', label: '필리핀 빈민 지원' },
  { _id: '4', value: '50+', unit: '명', label: '이주민 독감예방접종' },
]

export function ImpactSection({ stats }: { stats: ImpactStat[] }) {
  const displayStats = stats.length > 0 ? stats : fallbackStats
  return (
    <section className="bg-primary py-16 px-6 text-center">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-black text-white mb-12">숫자로 보는 아름다운생명사랑</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {displayStats.map(s => (
            <div key={s._id}>
              <p className="text-5xl font-black text-white leading-none">
                {s.value}<span className="text-2xl">{s.unit}</span>
              </p>
              <p className="text-primary-muted text-sm mt-2">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
