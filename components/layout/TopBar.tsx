import Link from 'next/link'

export function TopBar() {
  return (
    <div className="bg-primary-darker py-2 px-6">
      <div className="max-w-6xl mx-auto flex justify-between items-center gap-4">
        <div className="hidden md:flex items-center gap-3">
          <a
            href="tel:02-6080-5798"
            className="text-[10px] text-white/60 hover:text-white/90 transition-colors"
          >
            📞 02-6080-5798
          </a>
          <span className="text-white/20 text-[10px]">|</span>
          <a
            href="mailto:belifeorg@hanmail.net"
            className="text-[10px] text-white/60 hover:text-white/90 transition-colors"
          >
            ✉ belifeorg@hanmail.net
          </a>
        </div>
        <div className="flex items-center gap-3 ml-auto md:ml-0">
          <Link href="/privacy" className="text-[10px] text-white/60 hover:text-white/90 transition-colors">
            개인정보처리방침
          </Link>
          <span className="text-white/20 text-[10px]">|</span>
          <Link href="/terms" className="text-[10px] text-white/60 hover:text-white/90 transition-colors">
            이용약관
          </Link>
          <span className="text-white/20 text-[10px]">|</span>
          <Link href="/sitemap" className="text-[10px] text-white/60 hover:text-white/90 transition-colors">
            사이트맵
          </Link>
        </div>
      </div>
    </div>
  )
}
