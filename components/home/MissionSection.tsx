import { SectionLabel } from '@/components/ui/SectionLabel'

const missions = [
  { icon: '👴', title: '저소득 어르신', desc: '가정방문 보건의료, 건강관리 서비스' },
  { icon: '🧒', title: '취약계층 어린이', desc: '아동 치과치료 연계, 건강 지원' },
  { icon: '🌏', title: '해외 빈민', desc: '필리핀 마닐라 빈민지역 의료·상비약 지원' },
  { icon: '🏠', title: '이주민·결혼이주여성', desc: '의료 접근성 지원, 건강관리' },
  { icon: '🕊️', title: '북한이탈주민', desc: '건강 회복과 정착 지원' },
  { icon: '📚', title: '의료 교육·연구', desc: '생명사랑의료학교 운영, 예비의료인 교육' },
]

export function MissionSection() {
  return (
    <section className="bg-white py-20 px-6">
      <div className="max-w-6xl mx-auto text-center">
        <SectionLabel>Our Mission</SectionLabel>
        <h2 className="text-3xl font-black mb-4">우리가 섬기는 이웃들</h2>
        <p className="text-text-subtle max-w-xl mx-auto mb-12 leading-relaxed">
          아름다운생명사랑은 의료의 사각지대에 놓인 이웃들 곁에서<br />
          생명을 사랑하는 마음으로 일합니다.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
          {missions.map(m => (
            <div key={m.title} className="bg-primary-light rounded-card-lg p-6 text-left border border-primary-lighter">
              <span className="text-3xl mb-3 block">{m.icon}</span>
              <h4 className="font-bold text-primary-dark mb-1">{m.title}</h4>
              <p className="text-sm text-text-subtle leading-relaxed">{m.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
