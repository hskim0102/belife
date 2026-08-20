import Link from 'next/link'
import Image from 'next/image'
import { SitemapMenuButton } from './SitemapMenuButton'

/** 하단 링크 줄에 사각 버튼으로 노출하는 외부 관련 기관 */
const RELATED_SITES = [
  { label: '국세청', href: 'https://www.nts.go.kr/' },
  { label: '서울특별시', href: 'https://www.seoul.go.kr/main/index.jsp' },
]

function ExternalIcon() {
  return (
    <svg
      className="w-3 h-3 shrink-0 opacity-70"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
      />
    </svg>
  )
}

export function Footer() {
  return (
    <footer className="bg-gradient-to-b from-primary-darker to-navy-footer text-white/80">
      <div className="max-w-6xl mx-auto px-6 pt-10 pb-6">
        <div className="mb-8">
          <div>
            <Image
              src="/logo.svg"
              alt="아름다운생명사랑"
              width={514}
              height={88}
              className="h-10 w-auto mb-4 rounded bg-white px-2 py-1"
            />
            <p className="text-sm text-white/90 mb-2">대표이사: 김영진</p>
            <p className="text-sm text-white/80 mb-2">
              서울시 강북구 인수봉로55가길 16-15 하늘평화센터 202호 우) 01024
            </p>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-white/80">
              <span>TEL: 02-6080-5798</span>
              <span className="text-white/40">|</span>
              <span>FAX: 02-6008-7998</span>
              <span className="text-white/40">|</span>
              <a
                href="mailto:belifeorg@hanmail.net"
                className="hover:text-white transition-colors"
              >
                E-mail: belifeorg@hanmail.net
              </a>
            </div>
          </div>
        </div>

        <div className="pt-5 border-t border-white/20 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-white/60">
            copyright© 2013 All rights reserved by belife.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link href="/privacy" className="text-xs text-white/70 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/50 rounded">
              개인정보처리방침
            </Link>
            <span className="text-white/30 text-xs">|</span>
            <Link href="/terms" className="text-xs text-white/70 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/50 rounded">
              이용약관
            </Link>
            <span className="text-white/30 text-xs">|</span>
            <SitemapMenuButton className="text-xs text-white/70 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/50 rounded cursor-pointer" />
            <nav aria-label="관련 사이트" className="flex items-center gap-2">
              {RELATED_SITES.map(site => (
                <a
                  key={site.href}
                  href={site.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-md border border-white/25 bg-white/10 px-2.5 py-1.5 text-xs font-bold text-white hover:bg-white/20 hover:border-white/45 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/60"
                >
                  {site.label}
                  <span className="sr-only">(새 창에서 열림)</span>
                  <ExternalIcon />
                </a>
              ))}
            </nav>
          </div>
        </div>
      </div>
    </footer>
  )
}
