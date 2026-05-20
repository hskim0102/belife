import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export function CtaSection() {
  return (
    <section className="bg-gradient-to-br from-primary-light to-primary-lighter py-20 px-6 text-center">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-3xl font-black mb-4">함께 생명을 사랑해요 💚</h2>
        <p className="text-text-subtle mb-10 leading-relaxed">
          후원 한 번이 한 생명을 살립니다.<br />
          의료인이라면 봉사로, 누구든 후원으로 함께할 수 있습니다.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/support"><Button size="lg">후원하기</Button></Link>
          <Link href="/support"><Button size="lg" variant="outline">봉사 신청하기</Button></Link>
        </div>
      </div>
    </section>
  )
}
