import Link from 'next/link'

const links = [
  { icon: '🏥', title: '어르신 의료지원', sub: '저소득 건강 돌봄', href: '/programs', iconBg: 'bg-blue-100' },
  { icon: '👶', title: '아동 복지 사업', sub: '취약계층 어린이', href: '/programs', iconBg: 'bg-green-100' },
  { icon: '🌍', title: '해외 의료봉사', sub: '해외 빈민 가정', href: '/programs', iconBg: 'bg-amber-100' },
  { icon: '❤️', title: '후원 안내', sub: '함께해 주세요', href: '/support', iconBg: 'bg-rose-100' },
]

export function QuickLinksSection() {
  return (
    <nav aria-label="빠른 이동" className="grid grid-cols-2 md:grid-cols-4 border-b border-gray-200 bg-white divide-x divide-gray-200">
      {links.map((item) => (
        <Link
          key={item.title}
          href={item.href}
          className="flex flex-col items-center py-5 px-4 text-center hover:bg-primary-light transition-colors"
        >
          <div className={`w-10 h-10 rounded-xl ${item.iconBg} flex items-center justify-center text-xl mb-2`}>
            {item.icon}
          </div>
          <span className="text-sm font-bold text-gray-900 mb-0.5">{item.title}</span>
          <span className="text-xs text-gray-400">{item.sub}</span>
        </Link>
      ))}
    </nav>
  )
}
