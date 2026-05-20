import { SectionLabel } from '@/components/ui/SectionLabel'

const missions = [
  { icon: '👴', title: '저소득 어르신', desc: '가정방문 보건의료, 건강관리 서비스', color: 'bg-amber-50 border-amber-200', iconBg: 'bg-amber-100 text-amber-700' },
  { icon: '🧒', title: '취약계층 어린이', desc: '아동 치과치료 연계, 건강 지원', color: 'bg-blue-50 border-blue-200', iconBg: 'bg-blue-100 text-blue-700' },
  { icon: '🌏', title: '해외 빈민', desc: '필리핀 마닐라 빈민지역 의료·상비약 지원', color: 'bg-purple-50 border-purple-200', iconBg: 'bg-purple-100 text-purple-700' },
  { icon: '🏠', title: '이주민·결혼이주여성', desc: '의료 접근성 지원, 건강관리', color: 'bg-rose-50 border-rose-200', iconBg: 'bg-rose-100 text-rose-700' },
  { icon: '🕊️', title: '북한이탈주민', desc: '건강 회복과 정착 지원', color: 'bg-sky-50 border-sky-200', iconBg: 'bg-sky-100 text-sky-700' },
  { icon: '📚', title: '의료 교육·연구', desc: '생명사랑의료학교 운영, 예비의료인 교육', color: 'bg-emerald-50 border-emerald-200', iconBg: 'bg-emerald-100 text-emerald-700' },
]

export function MissionSection() {
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
          {missions.map(m => (
            <div key={m.title} className={`${m.color} rounded-2xl p-6 border hover:shadow-md transition-shadow duration-200`}>
              <div className={`${m.iconBg} w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4`}>
                {m.icon}
              </div>
              <h4 className="font-bold text-gray-900 mb-2 text-[15px]">{m.title}</h4>
              <p className="text-sm text-gray-500 leading-relaxed">{m.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}