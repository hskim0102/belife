import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export function HeroSection() {
  return (
    <section className="bg-gradient-to-br from-primary-darker via-primary-dark to-primary-dark min-h-[520px] flex items-center px-6 py-20 relative overflow-hidden">
      <div className="max-w-6xl mx-auto w-full">
        <div className="max-w-lg">
          <span className="inline-block bg-white/15 text-primary-muted text-xs font-semibold px-3 py-1 rounded-full tracking-widest mb-5">
            창립 20주년 · 2006–2025
          </span>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight mb-5">
            한 생명을<br />
            <span className="text-primary-accent">천하와 같이</span><br />
            사랑합니다
          </h1>
          <p className="text-primary-muted text-base leading-relaxed mb-8">
            저소득 어르신, 취약계층 어린이, 이주민,<br />
            그리고 해외 빈민까지 — 생명을 사랑하는 의료로 함께합니다.
          </p>
          <div className="flex gap-3">
            <Link href="/support">
              <Button variant="primary" className="bg-white text-primary hover:bg-primary-light">후원하기</Button>
            </Link>
            <Link href="/programs">
              <Button variant="outline" className="border-white/40 text-white hover:bg-white/10">활동 보기</Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
