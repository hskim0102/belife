import type { MissionCard } from '@/lib/repositories/missionCards'
import { SectionLabel } from '@/components/ui/SectionLabel'

const colorMap = [
  { color: 'bg-gradient-to-br from-green-50 to-green-100 border-green-100', iconBg: 'bg-green-100 text-green-700' },
  { color: 'bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-100', iconBg: 'bg-emerald-100 text-emerald-700' },
  { color: 'bg-gradient-to-br from-teal-50 to-teal-100 border-teal-100', iconBg: 'bg-teal-100 text-teal-700' },
  { color: 'bg-gradient-to-br from-lime-50 to-lime-100 border-lime-100', iconBg: 'bg-lime-100 text-lime-700' },
  { color: 'bg-gradient-to-br from-amber-50 to-amber-100 border-amber-100', iconBg: 'bg-amber-100 text-amber-700' },
  { color: 'bg-gradient-to-br from-rose-50 to-rose-100 border-rose-100', iconBg: 'bg-rose-100 text-rose-700' },
]

export function MissionSection({ cards }: { cards: MissionCard[] }) {
  return (
    <section className="bg-gradient-to-b from-cream to-cream-deep py-24 px-6">
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
                <div className={`${colorSet.iconBg} w-14 h-14 rounded-xl flex items-center justify-center text-3xl mb-4`}>
                  {card.iconEmoji}
                </div>
                <h4 className="font-bold text-gray-900 mb-2 text-lg">{card.title}</h4>
                <p className="text-base text-gray-500 leading-relaxed">{card.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}