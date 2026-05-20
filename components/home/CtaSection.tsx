import Link from 'next/link'

export function CtaSection() {
  return (
    <section className="bg-gradient-to-br from-primary-darker via-primary-dark to-[#1a6b37] py-24 px-6 text-center relative overflow-hidden">
      <div className="absolute -left-20 -bottom-20 w-[400px] h-[400px] rounded-full bg-white/5 pointer-events-none" />
      <div className="absolute -right-10 -top-10 w-[300px] h-[300px] rounded-full bg-primary-accent/10 pointer-events-none" />
      <div className="max-w-2xl mx-auto relative">
        <p className="text-green-300 text-xs font-bold tracking-widest uppercase mb-4">Join Us</p>
        <h2 className="text-4xl md:text-5xl font-black text-white mb-5 leading-tight">
          함께 생명을<br />사랑해요
        </h2>
        <p className="text-white/65 mb-10 leading-relaxed text-lg">
          후원 한 번이 한 생명을 살립니다.<br />
          의료인이라면 봉사로, 누구든 후원으로 함께할 수 있습니다.
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Link href="/support">
            <span className="inline-block bg-white text-primary-dark font-bold px-10 py-4 rounded-full hover:bg-green-50 transition-all shadow-lg shadow-black/20 text-base cursor-pointer">
              후원하기
            </span>
          </Link>
          <Link href="/support">
            <span className="inline-block border-2 border-white/30 text-white font-semibold px-10 py-4 rounded-full hover:bg-white/10 hover:border-white/50 transition-all text-base cursor-pointer">
              봉사 신청하기
            </span>
          </Link>
        </div>
      </div>
    </section>
  )
}