import Link from 'next/link'

export function CtaSection() {
  return (
    <section className="py-7 px-6 bg-gradient-to-br from-primary to-primary-dark">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-white mb-1">생명사랑의 손길, 함께 해주세요</h2>
          <p className="text-base text-white/85">월 1만원의 정기후원으로 더 많은 이웃을 도울 수 있습니다.</p>
        </div>
        <Link
          href="/support"
          className="inline-block bg-white text-primary-darker font-bold px-8 py-3.5 rounded-lg text-base hover:bg-primary-light transition-colors shadow-md whitespace-nowrap"
        >
          후원하기 →
        </Link>
      </div>
    </section>
  )
}
