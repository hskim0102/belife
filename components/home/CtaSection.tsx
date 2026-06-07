import Link from 'next/link'

export function CtaSection() {
  return (
    <section
      className="py-7 px-6"
      style={{ background: 'linear-gradient(135deg, #1a56db 0%, #003087 100%)' }}
    >
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-white mb-1">생명사랑의 손길, 함께 해주세요</h2>
          <p className="text-sm text-white/65">월 1만원의 정기후원으로 더 많은 이웃을 도울 수 있습니다.</p>
        </div>
        <Link
          href="/support"
          className="inline-block bg-white text-primary-darker font-bold px-7 py-3 rounded text-sm hover:bg-primary-light transition-colors shadow-md whitespace-nowrap"
        >
          후원하기 →
        </Link>
      </div>
    </section>
  )
}
