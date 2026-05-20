'use client'
import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { usePathname } from 'next/navigation'

const navItems = [
  { label: '소개', href: '/intro' },
  { label: '사업', href: '/programs' },
  { label: '소식', href: '/news' },
  { label: '후원·참여', href: '/support' },
  { label: '문의', href: '/contact' },
]

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = usePathname()

  return (
    <header className="bg-white/95 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-50 shadow-[0_1px_0_0_#f3f4f6]">
      <div className="max-w-6xl mx-auto px-6 h-[68px] flex items-center justify-between">
        <Link href="/" className="flex items-center">
          <Image src="/logo.jpg" alt="아름다운생명사랑" width={160} height={44} className="h-10 w-auto" priority />
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {navItems.map(item => {
            const active = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${active ? 'text-primary bg-primary-light' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>

        <Link href="/support" className="hidden md:block">
          <span className="inline-block bg-primary text-white font-bold px-5 py-2.5 rounded-full text-sm hover:bg-primary-dark transition-colors shadow-sm cursor-pointer">
            후원하기
          </span>
        </Link>

        <button
          className="md:hidden p-2 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="메뉴 열기"
        >
          {menuOpen ? (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-3 flex flex-col gap-1">
          {navItems.map(item => {
            const active = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${active ? 'text-primary bg-primary-light' : 'text-gray-700 hover:bg-gray-50'}`}
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </Link>
            )
          })}
          <div className="pt-2 pb-1">
            <Link href="/support" onClick={() => setMenuOpen(false)}>
              <span className="block bg-primary text-white font-bold px-5 py-3 rounded-xl text-sm text-center cursor-pointer hover:bg-primary-dark transition-colors">
                후원하기
              </span>
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}