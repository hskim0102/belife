import type { Metadata } from 'next'
import './globals.css'
import { getThemeSettings } from '@/lib/repositories/theme'
import { DEFAULT_BRIGHTNESS, DEFAULT_THEME, themeCss, type ThemeColor } from '@/lib/theme'

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
  // 관리자가 설정한 테마 색상·밝기. 조회 실패가 사이트 전체를 막지 않도록 기본값으로 폴백.
  let theme: ThemeColor = DEFAULT_THEME
  let brightness = DEFAULT_BRIGHTNESS
  try {
    const settings = await getThemeSettings()
    theme = settings.color
    brightness = settings.brightness
  } catch {
    // DB 미연결 등 — globals.css의 기본 팔레트로 렌더링
  }
  const overrideTheme = theme !== DEFAULT_THEME || brightness !== DEFAULT_BRIGHTNESS
  return (
    <html lang="ko">
      <body>
        {overrideTheme && <style>{themeCss(theme, brightness)}</style>}
        {children}
      </body>
    </html>
  )
}
