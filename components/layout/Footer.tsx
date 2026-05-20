import Link from 'next/link'

export function Footer() {
  return (
    <footer className="bg-primary-darker text-gray-500 py-10">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex-1">
            <p className="text-primary-accent font-black text-lg mb-2">🌸 아름다운생명사랑</p>
            <p className="text-sm leading-7">
              공익법인(구,지정기부금단체) · 대표: 김영진<br />
              belife = beautiful + life · 아름다운 생명
            </p>
          </div>
          <nav className="flex flex-col gap-2 text-sm">
            <Link href="/intro" className="hover:text-primary-accent transition-colors">소개</Link>
            <Link href="/programs" className="hover:text-primary-accent transition-colors">사업</Link>
            <Link href="/news" className="hover:text-primary-accent transition-colors">소식</Link>
            <Link href="/support" className="hover:text-primary-accent transition-colors">후원·참여</Link>
            <Link href="/contact" className="hover:text-primary-accent transition-colors">문의</Link>
          </nav>
        </div>
        <p className="mt-8 text-xs text-center text-gray-600">
          © {new Date().getFullYear()} 아름다운생명사랑. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
