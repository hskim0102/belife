import Link from 'next/link'
import Image from 'next/image'

const navGroups = [
  {
    title: '단체 소개',
    links: [
      { label: '소개', href: '/intro' },
      { label: '소명 & 핵심가치', href: '/intro' },
      { label: '연혁', href: '/intro/history' },
      { label: '사람들', href: '/intro/people' },
    ],
  },
  {
    title: '사업 & 소식',
    links: [
      { label: '주요 사업', href: '/programs' },
      { label: '최근 소식', href: '/news' },
      { label: '후원·참여', href: '/support' },
      { label: '문의', href: '/contact' },
    ],
  },
]

export function Footer() {
  return (
    <footer className="bg-gray-950 text-gray-400">
      <div className="max-w-6xl mx-auto px-6 py-14">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <Image
              src="/logo.jpg"
              alt="아름다운생명사랑"
              width={140}
              height={38}
              className="h-10 w-auto mb-4 rounded bg-white p-1"
            />
            <p className="text-sm leading-7 text-gray-400">
              공익법인(구 지정기부금단체)<br />
              대표: 김영진
            </p>
            <p className="text-xs text-gray-600 mt-3 leading-relaxed">
              belife = beautiful + life<br />
              아름다운 생명
            </p>
          </div>

          {/* Nav groups */}
          {navGroups.map(group => (
            <div key={group.title}>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">{group.title}</p>
              <nav className="flex flex-col gap-2.5">
                {group.links.map(link => (
                  <Link key={link.href + link.label} href={link.href} className="text-sm text-gray-400 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-6 border-t border-gray-800 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-600">
            © {new Date().getFullYear()} 아름다운생명사랑. All rights reserved.
          </p>
          <Link href="/support">
            <span className="inline-block bg-primary text-white text-xs font-bold px-5 py-2.5 rounded-full hover:bg-primary-dark transition-colors cursor-pointer">
              후원하기
            </span>
          </Link>
        </div>
      </div>
    </footer>
  )
}