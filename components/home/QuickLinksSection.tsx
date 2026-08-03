import Link from 'next/link'

interface QuickLink {
  icon: string
  title: string
  sub: string
  href: string
  /** 강조 카드(대표 색상으로 채움) */
  featured?: boolean
}

const links: QuickLink[] = [
  {
    icon: '💚',
    title: '후원하기 안내',
    sub: '매월 이어지는 따뜻한 나눔으로 안정적인 돌봄을 전해 주세요.',
    href: '/support',
  },
  {
    icon: '🧾',
    title: '기부금영수증',
    sub: '연말정산·세액공제를 위한 기부금영수증을 발급해 드립니다.',
    href: '/support#receipt',
  },
  {
    icon: '🤝',
    title: '봉사활동 신청',
    sub: '아이들의 건강한 성장을 위해 따뜻한 손길을 나누어 주세요.',
    href: '/support#volunteer',
  },
  {
    icon: '📊',
    title: '연례보고',
    sub: '한 해의 활동과 재정 사용 내역을 투명하게 공개합니다.',
    href: '/board/report',
    featured: true,
  },
]

export function QuickLinksSection() {
  return (
    <nav aria-label="빠른 이동" className="bg-cream px-4 sm:px-6 py-8 sm:py-12">
      {/* 4개 카드: 모바일에서도 항상 1줄(grid-cols-4) */}
      <div className="max-w-6xl mx-auto grid grid-cols-4 gap-2.5 sm:gap-5">
        {links.map((item) => {
          const featured = item.featured
          return (
            <Link
              key={item.title}
              href={item.href}
              className={[
                'group relative flex flex-col rounded-2xl p-3 sm:p-6 shadow-md transition-all hover:-translate-y-0.5 hover:shadow-xl',
                'items-center text-center sm:items-stretch sm:text-left',
                featured
                  ? 'bg-gradient-to-br from-primary to-primary-dark text-white shadow-primary/30 hover:shadow-primary/40'
                  : 'bg-white hover:bg-primary-light/40',
              ].join(' ')}
            >
              {/* 모바일 전용: 아이콘을 위에 크게 노출 */}
              <span className="text-2xl mb-1.5 sm:hidden" aria-hidden="true">
                {item.icon}
              </span>

              <h3
                className={[
                  'font-black leading-tight text-xs sm:text-lg',
                  featured ? 'text-white' : 'text-primary-dark',
                ].join(' ')}
              >
                {item.title}
              </h3>

              {/* 설명: 좁은 모바일에서는 숨기고 태블릿 이상에서 노출 */}
              <p
                className={[
                  'hidden sm:block text-sm mt-2 leading-relaxed',
                  featured ? 'text-white/90' : 'text-gray-500',
                ].join(' ')}
              >
                {item.sub}
              </p>

              {/* 데스크톱 전용 하단: 일러스트 아이콘 + 원형 화살표 */}
              <div className="hidden sm:flex items-end justify-between mt-auto pt-8">
                <span className="text-3xl" aria-hidden="true">
                  {item.icon}
                </span>
                <span
                  className={[
                    'w-9 h-9 rounded-full flex items-center justify-center transition-colors',
                    featured
                      ? 'bg-white/20 text-white group-hover:bg-white/30'
                      : 'bg-gray-100 text-gray-500 group-hover:bg-primary group-hover:text-white',
                  ].join(' ')}
                  aria-hidden="true"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 12h16m0 0l-6-6m6 6l-6 6" />
                  </svg>
                </span>
              </div>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
