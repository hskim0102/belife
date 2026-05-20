import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: { default: '아름다운생명사랑', template: '%s | 아름다운생명사랑' },
  description: '저소득 어르신, 취약계층 어린이, 이주민, 해외 빈민을 위한 의료복지 비영리단체',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  )
}
