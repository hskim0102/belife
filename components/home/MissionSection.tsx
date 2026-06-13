import type { MissionCard } from '@/lib/repositories/missionCards'
import { SectionLabel } from '@/components/ui/SectionLabel'

const colorMap = [
  { color: 'bg-blue-50 border-blue-200', iconBg: 'bg-blue-100 text-blue-700' },
  { color: 'bg-sky-50 border-sky-200', iconBg: 'bg-sky-100 text-sky-700' },
  { color: 'bg-indigo-50 border-indigo-200', iconBg: 'bg-indigo-100 text-indigo-700' },
  { color: 'bg-violet-50 border-violet-200', iconBg: 'bg-violet-100 text-violet-700' },
  { color: 'bg-cyan-50 border-cyan-200', iconBg: 'bg-cyan-100 text-cyan-700' },
  { color: 'bg-slate-50 border-slate-200', iconBg: 'bg-slate-100 text-slate-700' },
]

export function MissionSection({ cards }: { cards: MissionCard[] }) {
  return (
    <section className="bg-white py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <SectionLabel>Our Mission</SectionLabel>
          <h2 className="text-4xl font-black mb-4 text-gray-900">우리가 섬기는 이웃들</h2>
          <p className="text-text-subtle max-w-xl mx-auto leading-relaxed">
            아름다운생명사랑은 의료의 사각지대에 놓인 이웃들 곁에서<br />
            생명을 사랑하는 마음으로 일합니다.
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
          {cards.map((card, i) => {
            const colorSet = colorMap[i % colorMap.length]
            return (
              <div key={card.id} className={`${colorSet.color} rounded-2xl p-6 border hover:shadow-md transition-shadow duration-200`}>
                <div className={`${colorSet.iconBg} w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4`}>
                  {card.iconEmoji}
                </div>
                <h4 className="font-bold text-gray-900 mb-2 text-[15px]">{card.title}</h4>
                <p className="text-sm text-gray-500 leading-relaxed">{card.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}