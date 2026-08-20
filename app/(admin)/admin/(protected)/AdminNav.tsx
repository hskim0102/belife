'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/cn'

/** 성격이 비슷한 메뉴끼리 묶어 구분선으로 나눈다. */
const NAV_GROUPS = [
  {
    label: '콘텐츠',
    items: [
      { href: '/admin/news', label: '활동소식' },
      { href: '/admin/posts', label: '게시판 글' },
    ],
  },
  {
    label: '기관 소개',
    items: [
      { href: '/admin/programs', label: '사업' },
      { href: '/admin/pages', label: '메뉴 페이지' },
      { href: '/admin/members', label: '함께하는 사람들' },
      { href: '/admin/milestones', label: '발자취' },
      { href: '/admin/location', label: '오시는 길' },
    ],
  },
  {
    label: '화면 설정',
    items: [
      { href: '/admin/hero', label: '메인 배너' },
      { href: '/admin/notifications', label: '팝업 알림' },
      { href: '/admin/mission-cards', label: '소명 카드' },
      { href: '/admin/theme', label: '테마 색상' },
    ],
  },
]

export function AdminNav() {
  const pathname = usePathname()
  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/')

  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5 pb-3">
      {NAV_GROUPS.map((group, i) => (
        <div key={group.label} className="flex items-center gap-2">
          {i > 0 && <span className="w-px h-5 bg-gray-200 mx-1 shrink-0" aria-hidden="true" />}
          <nav aria-label={group.label} className="flex flex-wrap items-center gap-1">
            {group.items.map(item => {
              const active = isActive(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-sm font-semibold whitespace-nowrap transition-colors',
                    active
                      ? 'bg-primary text-white shadow-sm'
                      : 'text-gray-600 hover:text-primary-dark hover:bg-primary-light',
                  )}
                >
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </div>
      ))}
    </div>
  )
}
