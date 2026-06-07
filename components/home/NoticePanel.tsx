'use client'
import { useState } from 'react'

const tabs = ['공지사항', '소식', '보도자료'] as const
type Tab = typeof tabs[number]

// TODO: Replace with real data from database when notice repository is implemented
const noticeItems: Record<Tab, { title: string; date: string; isNew: boolean }[]> = {
  '공지사항': [
    { title: '2026년 하반기 봉사자 모집 안내', date: '2026.05.20', isNew: true },
    { title: '해외 의료봉사팀 파견 결과 보고', date: '2026.05.08', isNew: false },
    { title: '저소득 어르신 의료비 지원 신청 접수', date: '2026.04.30', isNew: false },
    { title: '2026 정기 후원자 감사의 밤 개최', date: '2026.04.20', isNew: false },
    { title: '사단법인 정기총회 결과 공고', date: '2026.03.15', isNew: false },
    { title: '취약계층 어린이 치과 연계 사업 안내', date: '2026.03.01', isNew: false },
  ],
  '소식': [
    { title: '필리핀 의료봉사 2026 현장 보고', date: '2026.05.15', isNew: true },
    { title: '어르신 건강검진 캠페인 결과 발표', date: '2026.05.02', isNew: false },
    { title: '아동 예방접종 지원사업 현황', date: '2026.04.10', isNew: false },
    { title: '이주민 무료 진료 후기', date: '2026.03.25', isNew: false },
    { title: '생명사랑의료학교 4기 수료식', date: '2026.03.10', isNew: false },
    { title: '후원자 감사 편지 전달 행사', date: '2026.02.20', isNew: false },
  ],
  '보도자료': [
    { title: '[○○일보] 아름다운생명사랑, 해외 의료봉사 성과', date: '2026.05.18', isNew: true },
    { title: '[△△뉴스] 취약계층 의료지원 확대 나선 NGO', date: '2026.04.22', isNew: false },
    { title: '[□□방송] 이주민 건강권 보호 활동 조명', date: '2026.03.28', isNew: false },
    { title: '[○○신문] 생명사랑의료학교 4기 운영 소식', date: '2026.03.05', isNew: false },
    { title: '[△△뉴스] 필리핀 빈민 지역 의료 지원 현황', date: '2026.02.14', isNew: false },
    { title: '[□□방송] 비영리 의료복지 단체 우수사례', date: '2026.01.30', isNew: false },
  ],
}

export function NoticePanel() {
  const [activeTab, setActiveTab] = useState<Tab>('공지사항')
  const items = noticeItems[activeTab]

  return (
    <div className="bg-white">
      <div className="flex border-b border-gray-200">
        {tabs.map(tab => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-4 text-sm font-bold border-b-2 -mb-[1px] transition-colors ${
              activeTab === tab
                ? 'text-primary-darker border-primary-darker'
                : 'text-gray-400 border-transparent hover:text-gray-600'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
      <ul>
        {items.map(item => (
          <li
            key={item.title}
            className="flex items-start gap-3 px-5 py-3.5 border-b border-gray-100 hover:bg-primary-light cursor-pointer transition-colors"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-primary-darker flex-shrink-0 mt-1.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-700 leading-snug line-clamp-1">
                {item.title}
                {item.isNew && <span className="ml-1.5 text-[10px] font-bold text-red-500">N</span>}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">{item.date}</p>
            </div>
          </li>
        ))}
      </ul>
      <div className="p-4">
        <a href="/news" className="block text-center text-xs text-gray-400 font-semibold hover:text-primary-darker transition-colors">
          전체 공지 보기 →
        </a>
      </div>
    </div>
  )
}
