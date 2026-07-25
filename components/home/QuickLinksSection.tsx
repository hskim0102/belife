import Link from 'next/link'

const links = [
  {
    icon: '💚',
    title: '후원하기 안내',
    sub: '정기·일시 후원 신청',
    href: '/support',
    iconBg: 'bg-gradient-to-br from-emerald-50 to-emerald-100',
  },
  {
    icon: '🧾',
    title: '기부금영수증',
    sub: '연말정산 세액공제',
    href: '/support#receipt',
    iconBg: 'bg-gradient-to-br from-amber-50 to-amber-100',
  },
  {
    icon: '🤝',
    title: '봉사활동 신청',
    sub: '자원봉사 참여 안내',
    href: '/support#volunteer',
    iconBg: 'bg-gradient-to-br from-rose-50 to-rose-100',
  },
]

export function QuickLinksSection() {
  return (
    <nav
      aria-label="빠른 이동"
      className="grid grid-cols-1 sm:grid-cols-3 bg-cream divide-y sm:divide-y-0 sm:divide-x divide-primary-muted/60"
    >
      {links.map((item) => (
        <Link
          key={item.title}
          href={item.href}
          className="flex flex-col items-center py-6 px-4 text-center hover:bg-primary-light transition-colors"
        >
          <div className={`w-12 h-12 rounded-xl ${item.iconBg} flex items-center justify-center text-2xl mb-2`}>
            {item.icon}
          </div>
          <span className="text-base font-bold text-gray-900 mb-0.5">{item.title}</span>
          <span className="text-sm text-gray-400">{item.sub}</span>
        </Link>
      ))}
    </nav>
  )
}
