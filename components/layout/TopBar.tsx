import Link from 'next/link'
import { SitemapMenuButton } from './SitemapMenuButton'

export function TopBar() {
  return (
    <div className="bg-gradient-to-r from-primary-darker via-primary-dark to-primary-darker py-2 px-6">
      <div className="max-w-6xl mx-auto flex justify-between items-center gap-4">
        <div className="hidden md:flex items-center gap-3">
          <a
            href="tel:02-6080-5798"
            className="text-xs text-white/80 hover:text-white transition-colors"
          >
            📞 02-6080-5798
          </a>
          <span className="text-white/30 text-xs">|</span>
          <a
            href="mailto:belifeorg@hanmail.net"
            className="text-xs text-white/80 hover:text-white transition-colors"
          >
            ✉ belifeorg@hanmail.net
          </a>
        </div>
        <div className="flex items-center gap-3 ml-auto md:ml-0">
          <Link href="/privacy" className="text-xs text-white/80 hover:text-white transition-colors">
            개인정보처리방침
          </Link>
          <span className="text-white/30 text-xs">|</span>
          <Link href="/terms" className="text-xs text-white/80 hover:text-white transition-colors">
            이용약관
          </Link>
          <span className="text-white/30 text-xs">|</span>
          <SitemapMenuButton className="text-xs text-white/80 hover:text-white transition-colors cursor-pointer" />
        </div>
      </div>
    </div>
  )
}
