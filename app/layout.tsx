import type { Metadata } from 'next'
import './globals.css'
import { getThemeColor } from '@/lib/repositories/theme'
import { DEFAULT_THEME, themeCss, type ThemeKey } from '@/lib/theme'

export const metadata: Metadata = {
  title: { default: '아름다운생명사랑', template: '%s | 아름다운생명사랑' },
  description: '저소득 어르신, 취약계층 어린이, 이주민, 해외 빈민을 위한 의료복지 비영리단체',
  keywords: ['아름다운생명사랑', 'belife', '비영리', '의료복지', '후원', '봉사'],
  openGraph: {
    type: 'website',
    siteName: '아름다운생명사랑',
    locale: 'ko_KR',
    url: 'https://belife.org',
  },
  robots: { index: true, follow: true },
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // 관리자가 설정한 테마 색상. 조회 실패가 사이트 전체를 막지 않도록 기본 테마로 폴백.
  let theme: ThemeKey = DEFAULT_THEME
  try {
    theme = await getThemeColor()
  } catch {
    // DB 미연결 등 — globals.css의 기본 팔레트로 렌더링
  }
  return (
    <html lang="ko">
      <body>
        {theme !== DEFAULT_THEME && <style>{themeCss(theme)}</style>}
        {children}
      </body>
    </html>
  )
}
