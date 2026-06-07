'use client'
import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { usePathname } from 'next/navigation'

const navItems = [
  { label: '소개', href: '/intro' },
  { label: '사업', href: '/programs' },
  { label: '소식', href: '/news' },
  { label: '게시판', href: '/board' },
  { label: '후원·참여', href: '/support' },
  { label: '문의', href: '/contact' },
]

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = usePathname()

  return (
    <header className="bg-white border-b-2 border-primary-darker sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 h-[76px] flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.jpg" alt="아름다운생명사랑" width={180} height={52} className="h-12 w-auto" priority />
        </Link>

        <nav className="hidden md:flex items-stretch h-full">
          {navItems.map(item => {
            const active = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center px-5 text-[15px] font-semibold border-b-2 -mb-[2px] transition-colors ${
                  active
                    ? 'text-primary-darker border-primary-darker'
                    : 'text-gray-600 border-transparent hover:text-primary-darker hover:border-primary-darker'
                }`}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>

        <Link href="/support" className="hidden md:block">
          <span className="inline-block bg-primary-darker text-white font-bold px-6 py-3 rounded text-sm hover:bg-primary-dark transition-colors cursor-pointer">
            후원하기
          </span>
        </Link>

        <button
          className="md:hidden p-2 text-gray-600 rounded hover:bg-gray-50 transition-colors"
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
                className={`px-4 py-3 rounded text-sm font-semibold transition-colors ${
                  active ? 'text-primary-darker bg-primary-light' : 'text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </Link>
            )
          })}
          <div className="pt-2 pb-1">
            <Link href="/support" onClick={() => setMenuOpen(false)}>
              <span className="block bg-primary-darker text-white font-bold px-5 py-3 rounded text-sm text-center cursor-pointer hover:bg-primary-dark transition-colors">
                후원하기
              </span>
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
