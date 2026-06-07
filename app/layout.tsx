import type { Metadata } from 'next'
import './globals.css'

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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  )
}
