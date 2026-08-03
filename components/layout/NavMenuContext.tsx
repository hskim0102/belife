'use client'

import { createContext, useContext, useState, type Dispatch, type ReactNode, type SetStateAction } from 'react'
import { usePathname } from 'next/navigation'

interface NavMenuContextValue {
  /** 모바일 드롭다운 열림 상태 */
  mobileOpen: boolean
  setMobileOpen: Dispatch<SetStateAction<boolean>>
  /** 데스크톱 전체메뉴(메가메뉴) 열림 상태 */
  desktopOpen: boolean
  setDesktopOpen: Dispatch<SetStateAction<boolean>>
  /** 사이트맵 등 외부 버튼에서 전체메뉴를 연다(뷰포트에 맞는 메뉴를 연다). */
  openFullMenu: () => void
}

const NavMenuContext = createContext<NavMenuContextValue | null>(null)

export function NavMenuProvider({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [desktopOpen, setDesktopOpen] = useState(false)

  // 페이지(경로)가 바뀌면 열려 있던 전체메뉴를 닫는다. (렌더 중 상태 조정 패턴)
  const pathname = usePathname()
  const [prevPath, setPrevPath] = useState(pathname)
  if (pathname !== prevPath) {
    setPrevPath(pathname)
    setMobileOpen(false)
    setDesktopOpen(false)
  }

  // 햄버거와 동일하게: 데스크톱이면 메가메뉴, 모바일이면 모바일 메뉴를 연다.
  const openFullMenu = () => {
    const isDesktop = typeof window !== 'undefined' && window.matchMedia('(min-width: 768px)').matches
    if (isDesktop) setDesktopOpen(true)
    else setMobileOpen(true)
  }

  return (
    <NavMenuContext.Provider value={{ mobileOpen, setMobileOpen, desktopOpen, setDesktopOpen, openFullMenu }}>
      {children}
    </NavMenuContext.Provider>
  )
}

export function useNavMenu(): NavMenuContextValue {
  const ctx = useContext(NavMenuContext)
  if (!ctx) throw new Error('useNavMenu must be used within NavMenuProvider')
  return ctx
}
