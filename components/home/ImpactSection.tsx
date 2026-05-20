import { ImpactStat } from '@/lib/sanity/types'

const fallbackStats: ImpactStat[] = [
  { _id: '1', value: '23', unit: '년', label: '활동 역사 (2003~)' },
  { _id: '2', value: '4', unit: '기', label: '생명사랑의료학교 (2025)' },
  { _id: '3', value: '400+', unit: '가구', label: '필리핀 빈민 지원' },
  { _id: '4', value: '50+', unit: '명', label: '이주민 독감예방접종' },
]

export function ImpactSection({ stats }: { stats: ImpactStat[] }) {
  const displayStats = stats.length > 0 ? stats : fallbackStats
  return (
    <section className="bg-gradient-to-br from-primary-dark via-primary to-[#1e8a4a] py-20 px-6 text-center relative overflow-hidden">
      <div className="absolute inset-0 opacity-10 pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, #4ade80 0%, transparent 50%), radial-gradient(circle at 80% 20%, #4ade80 0%, transparent 40%)' }}
      />
      <div className="max-w-6xl mx-auto relative">
        <p className="text-green-200 text-xs font-bold tracking-widest uppercase mb-3">Impact</p>
        <h2 className="text-3xl md:text-4xl font-black text-white mb-14">숫자로 보는 아름다운생명사랑</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {displayStats.map(s => (
            <div key={s._id} className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/15">
              <p className="text-4xl md:text-5xl font-black text-white leading-none">
                {s.value}<span className="text-xl md:text-2xl font-bold text-green-200">{s.unit}</span>
              </p>
              <p className="text-green-100 text-sm mt-3 leading-relaxed">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}