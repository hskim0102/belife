'use client'
import Link from 'next/link'
import { useState } from 'react'
import { Button } from '@/components/ui/Button'

const navItems = [
  { label: '소개', href: '/intro' },
  { label: '사업', href: '/programs' },
  { label: '소식', href: '/news' },
  { label: '후원·참여', href: '/support' },
  { label: '문의', href: '/contact' },
]

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-primary font-black text-xl">
          <span>🌸</span>
          <span>아름다운생명사랑</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {navItems.map(item => (
            <Link key={item.href} href={item.href} className="text-sm font-medium text-gray-700 hover:text-primary transition-colors">
              {item.label}
            </Link>
          ))}
        </nav>

        <Link href="/support" className="hidden md:block">
          <Button size="sm">후원하기</Button>
        </Link>

        <button
          className="md:hidden p-2 text-gray-700"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="메뉴 열기"
        >
          <span className="block w-5 h-0.5 bg-current mb-1" />
          <span className="block w-5 h-0.5 bg-current mb-1" />
          <span className="block w-5 h-0.5 bg-current" />
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-6 py-4 flex flex-col gap-4">
          {navItems.map(item => (
            <Link key={item.href} href={item.href} className="text-sm font-medium text-gray-700" onClick={() => setMenuOpen(false)}>
              {item.label}
            </Link>
          ))}
          <Link href="/support" onClick={() => setMenuOpen(false)}>
            <Button size="sm" className="w-full">후원하기</Button>
          </Link>
        </div>
      )}
    </header>
  )
}
