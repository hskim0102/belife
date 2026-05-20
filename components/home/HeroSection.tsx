import Link from 'next/link'
import { HeroSlideshow } from './HeroSlideshow'

export function HeroSection() {
  return (
    <section className="relative bg-gradient-to-br from-primary-darker via-primary-dark to-[#1a6b37] min-h-[640px] flex items-center px-6 py-28 overflow-hidden">
      <div className="absolute -right-32 -top-32 w-[600px] h-[600px] rounded-full bg-white/[0.03] pointer-events-none" />
      <div className="absolute right-20 bottom-0 w-[400px] h-[400px] rounded-full bg-primary-accent/10 translate-y-1/2 pointer-events-none" />
      <div className="absolute left-1/2 top-1/2 w-[900px] h-[900px] rounded-full bg-primary/20 -translate-x-[30%] -translate-y-1/2 pointer-events-none" />

      <div className="max-w-6xl mx-auto w-full relative z-10 grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-12 lg:gap-16 items-center">
        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-green-100 text-xs font-bold px-4 py-1.5 rounded-full tracking-widest mb-7">
            <span className="w-1.5 h-1.5 rounded-full bg-primary-accent inline-block" />
            창립 23주년 · 2003 – 2026
          </span>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-white leading-[1.05] mb-6">
            존엄한 생명의<br />
            <span className="text-primary-accent">아름다움을</span><br />
            꽃 피웁니다
          </h1>

          <p className="text-white/70 text-lg leading-relaxed mb-10 max-w-lg">
            저소득 어르신, 취약계층 어린이, 이주민,<br />
            그리고 해외 빈민까지 — 생명을 사랑하는 의료로 함께합니다.
          </p>

          <div className="flex flex-wrap gap-3">
            <Link href="/support">
              <span className="inline-block bg-white text-primary-dark font-bold px-8 py-3.5 rounded-full hover:bg-green-50 transition-all shadow-lg shadow-black/20 text-base cursor-pointer">
                후원하기
              </span>
            </Link>
            <Link href="/programs">
              <span className="inline-block border-2 border-white/30 text-white font-semibold px-8 py-3.5 rounded-full hover:bg-white/10 hover:border-white/50 transition-all text-base cursor-pointer">
                활동 보기 →
              </span>
            </Link>
          </div>

          <div className="mt-14 flex flex-wrap gap-8">
            {[
              { value: '23년', label: '활동 역사' },
              { value: '400+', label: '해외 지원 가구' },
              { value: '50+', label: '이주민 접종 지원' },
            ].map(stat => (
              <div key={stat.label} className="border-l-2 border-white/20 pl-4">
                <p className="text-2xl font-black text-white">{stat.value}</p>
                <p className="text-white/50 text-xs mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="w-full lg:w-[420px]">
          <HeroSlideshow />
        </div>
      </div>
    </section>
  )
}