'use client'

import { useNavMenu } from './NavMenuContext'

/** '사이트맵' 표기의 버튼. 클릭하면 햄버거처럼 전체메뉴가 열린다. */
export function SitemapMenuButton({ className }: { className?: string }) {
  const { openFullMenu } = useNavMenu()
  return (
    <button type="button" onClick={openFullMenu} className={className} aria-label="전체메뉴 열기">
      사이트맵
    </button>
  )
}
