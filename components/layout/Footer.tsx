import Link from 'next/link'
import Image from 'next/image'

export function Footer() {
  return (
    <footer className="bg-gray-700 text-white/80">
      <div className="max-w-6xl mx-auto px-6 pt-10 pb-6">
        <div className="mb-8">
          <Image
            src="/logo.jpg"
            alt="아름다운생명사랑"
            width={140}
            height={38}
            className="h-10 w-auto mb-4 rounded bg-white p-1"
          />
          <p className="text-sm text-white/90 mb-2">대표: 김영진</p>
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

        <div className="pt-5 border-t border-white/20 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-white/60">
            copyright© 2013 All rights reserved by belife.
          </p>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="text-xs text-white/70 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/50 rounded">
              개인정보처리방침
            </Link>
            <span className="text-white/30 text-xs">|</span>
            <Link href="/terms" className="text-xs text-white/70 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/50 rounded">
              이용약관
            </Link>
            <span className="text-white/30 text-xs">|</span>
            <Link href="/sitemap" className="text-xs text-white/70 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/50 rounded">
              사이트맵
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
