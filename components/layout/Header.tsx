'use client'
import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { BOARD_CATEGORIES } from '@/lib/boardCategories'

interface NavChild {
  label: string
  href: string
}
interface NavItem {
  label: string
  href: string
  children?: NavChild[]
}

/** 관리자가 등록한 메뉴 페이지(intro/programs)를 받아 네비게이션을 구성한다. */
function buildNavItems(introPages: NavChild[], programPages: NavChild[]): NavItem[] {
  return [
    {
      label: '아름다운생명사랑은',
      href: '/intro',
      children: [
        { label: '기관 소개', href: '/intro' },
        { label: '함께하는 사람들', href: '/intro/people' },
        { label: '발자취', href: '/intro/history' },
        ...introPages,
      ],
    },
    {
      label: '사업 소개',
      href: '/programs',
      children: [
        { label: '전체 사업', href: '/programs' },
        { label: '국내 사업', href: '/programs?category=domestic' },
        { label: '해외 사업', href: '/programs?category=overseas' },
        { label: '교육·연구 사업', href: '/programs?category=education' },
        ...programPages,
      ],
    },
    {
      label: '소식',
      href: '/news',
    },
    {
      label: '게시판',
      href: '/board',
      children: [
        { label: '게시판 홈', href: '/board' },
        ...BOARD_CATEGORIES.map(c => ({ label: c.label, href: `/board/${c.key}` })),
      ],
    },
    { label: '후원·참여', href: '/support' },
    { label: '문의', href: '/contact' },
  ]
}

export function Header({
  introPages = [],
  programPages = [],
}: {
  introPages?: NavChild[]
  programPages?: NavChild[]
}) {
  const navItems = buildNavItems(introPages, programPages)
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = usePathname()

  const isActive = (href: string) => {
    const base = href.split('?')[0]
    return pathname === base || pathname.startsWith(base + '/')
  }

  return (
    <header className="bg-white border-b-2 border-primary-darker sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 h-[76px] flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.jpg" alt="아름다운생명사랑" width={180} height={52} className="h-12 w-auto" priority />
        </Link>

        <nav className="hidden md:flex items-stretch h-full">
          {navItems.map(item => {
            const active = isActive(item.href)
            const hasChildren = !!item.children?.length
            return (
              <div key={item.href} className="relative group flex items-stretch">
                <Link
                  href={item.href}
                  className={`flex items-center gap-1 px-5 text-[15px] font-semibold border-b-2 -mb-[2px] transition-colors ${
                    active
                      ? 'text-primary-darker border-primary-darker'
                      : 'text-gray-600 border-transparent hover:text-primary-darker group-hover:text-primary-darker hover:border-primary-darker group-hover:border-primary-darker'
                  }`}
                >
                  {item.label}
                  {hasChildren && (
                    <svg
                      className="w-3 h-3 mt-0.5 opacity-60 transition-transform group-hover:rotate-180"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.06l3.71-3.83a.75.75 0 111.08 1.04l-4.25 4.39a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                    </svg>
                  )}
                </Link>

                {hasChildren && (
                  <div
                    className="absolute left-0 top-full min-w-[190px] bg-white border border-gray-100 rounded-b-xl shadow-lg py-2 z-50 origin-top
                      opacity-0 invisible -translate-y-1 transition-all duration-150
                      group-hover:opacity-100 group-hover:visible group-hover:translate-y-0
                      group-focus-within:opacity-100 group-focus-within:visible group-focus-within:translate-y-0"
                  >
                    {item.children!.map(child => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className="block px-4 py-2.5 text-sm font-medium text-gray-600 hover:text-primary-darker hover:bg-primary-light/60 transition-colors"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
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
            const active = isActive(item.href)
            return (
              <div key={item.href}>
                <Link
                  href={item.href}
                  className={`px-4 py-3 rounded text-sm font-semibold transition-colors block ${
                    active ? 'text-primary-darker bg-primary-light' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={() => setMenuOpen(false)}
                >
                  {item.label}
                </Link>
                {item.children?.length ? (
                  <div className="flex flex-col mt-0.5 mb-1 ml-3 border-l border-gray-100">
                    {item.children.map(child => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className="pl-4 pr-3 py-2 text-[13px] font-medium text-gray-500 hover:text-primary-darker transition-colors"
                        onClick={() => setMenuOpen(false)}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                ) : null}
              </div>
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
