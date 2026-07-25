import { TopBar } from '@/components/layout/TopBar'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { NotificationPopup } from '@/components/NotificationPopup'
import { FloatingSupportButton } from '@/components/layout/FloatingSupportButton'
import { getPublishedMenuPages } from '@/lib/repositories/menuPages'
import { getActiveNotification } from '@/lib/repositories/notifications'
import { sanitizePostBody } from '@/lib/sanitize'
import { menuPageHref } from '@/lib/menus'
import type { MenuPage } from '@/lib/types'

/** 네비게이션 하위 항목. 기관 소개(slug=intro)는 고정 항목으로 이미 있으므로 제외. */
function navChildren(pages: MenuPage[], menu: MenuPage['menu']) {
  return pages
    .filter(p => p.menu === menu && p.slug !== menu)
    .map(p => ({ label: p.title, href: menuPageHref(p.menu, p.slug) }))
}

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  let pages: MenuPage[] = []
  let notification = null
  try {
    pages = await getPublishedMenuPages()
  } catch {
    // 네비게이션 조회 실패가 사이트 전체를 막지 않도록 기본 메뉴로 렌더링.
  }
  try {
    const raw = await getActiveNotification()
    if (raw) {
      // 서버에서 sanitize해서 클라이언트로 전달
      notification = {
        id: raw.id,
        title: raw.title,
        body: raw.body ? sanitizePostBody(raw.body) : null,
        type: raw.type,
        showFrequency: raw.showFrequency,
      }
    }
  } catch {
    // 알림 조회 실패가 사이트 전체를 막지 않도록 처리.
  }
  return (
    <>
      <TopBar />
      <Header introPages={navChildren(pages, 'intro')} programPages={navChildren(pages, 'programs')} />
      <main>{children}</main>
      <Footer />
      <NotificationPopup notification={notification} />
      <FloatingSupportButton />
    </>
  )
}
