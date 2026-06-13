import type { MenuKey } from '@/lib/types'

/** CMS 페이지를 붙일 수 있는 상단 메뉴 정의. */
export const MENUS: { key: MenuKey; label: string; base: string }[] = [
  { key: 'intro', label: '아름다운생명사랑은', base: '/intro' },
  { key: 'programs', label: '사업 소개', base: '/programs' },
]

export const MENU_KEYS = MENUS.map(m => m.key)

export function isMenuKey(value: string): value is MenuKey {
  return (MENU_KEYS as string[]).includes(value)
}

export function getMenuLabel(key: MenuKey): string {
  return MENUS.find(m => m.key === key)?.label ?? key
}

/**
 * 메뉴 페이지의 공개 경로.
 * slug 가 메뉴 키와 같으면 메뉴 대표 경로(예: /intro)에 매핑되는 특수 페이지.
 */
export function menuPageHref(menu: MenuKey, slug: string): string {
  const base = MENUS.find(m => m.key === menu)?.base ?? `/${menu}`
  return slug === menu ? base : `${base}/${slug}`
}
