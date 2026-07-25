// app/support/page.tsx
import type { Metadata } from 'next'
import { PageHero } from '@/components/ui/PageHero'

export const metadata: Metadata = { title: '후원·참여' }

export const revalidate = 60

export default function SupportPage() {
  return (
    <>
      <PageHero
        label="Support"
        title="후원·참여"
        subtitle={<>아름다운생명사랑은 공익법인(구 지정기부금단체)으로<br />후원금에 대해 세액공제 혜택이 주어집니다.</>}
        icon="❤️"
        maxWidth="max-w-5xl"
      />

      <div className="py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6 mb-12 items-stretch">
            {/* 기부금영수증 */}
            <a
              id="receipt"
              href="https://mygive.bankcms.co.kr/mygive/main.do?uid=2688&is_receipt=y"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col bg-gray-50 rounded-2xl p-8 border border-gray-100 hover:border-primary-lighter hover:bg-primary-light transition-colors scroll-mt-28"
            >
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mb-5 text-2xl shadow-sm border border-gray-100">
                🧾
              </div>
              <h2 className="text-xl font-black text-gray-800 mb-3">기부금영수증</h2>
              <p className="text-sm text-gray-600 leading-relaxed mb-6 flex-1">
                연말정산·세액공제를 위한 기부금영수증을 온라인으로 조회·발급하실 수 있습니다.
              </p>
              <span className="inline-flex items-center gap-1 font-bold text-sm text-primary-dark group-hover:gap-2 transition-all">
                영수증 조회하기 →
              </span>
            </a>

            {/* 생명사랑후원신청 (대표) */}
            <a
              href="https://www.mygive.co.kr/mygive/main.do?uid=2688"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col bg-gradient-to-br from-primary-dark to-primary-darker text-white rounded-2xl p-8 hover:from-primary hover:to-primary-dark transition-colors shadow-sm"
            >
              <div className="w-12 h-12 bg-white/15 rounded-xl flex items-center justify-center mb-5 text-2xl">
                💚
              </div>
              <h2 className="text-xl font-black mb-3">생명사랑후원신청</h2>
              <p className="text-sm text-white/80 leading-relaxed mb-6 flex-1">
                정기후원·일시후원을 온라인으로 간편하게 신청하실 수 있습니다. 여러분의 후원이 생명을 살립니다.
              </p>
              <span className="inline-flex items-center gap-1 font-bold text-sm group-hover:gap-2 transition-all">
                후원 신청하기 →
              </span>
            </a>

            {/* 자원봉사신청 (준비중) */}
            <div id="volunteer" className="relative flex flex-col bg-gray-50 rounded-2xl p-8 border border-gray-100 scroll-mt-28">
              <span className="absolute top-6 right-6 text-xs font-bold bg-gray-200 text-gray-500 px-2.5 py-1 rounded-full">
                준비중
              </span>
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mb-5 text-2xl shadow-sm border border-gray-100">
                🤝
              </div>
              <h2 className="text-xl font-black text-gray-400 mb-3">자원봉사신청</h2>
              <p className="text-sm text-gray-400 leading-relaxed mb-6 flex-1">
                자원봉사 신청 기능을 준비하고 있습니다. 빠른 시일 내에 만나보실 수 있습니다.
              </p>
              <span className="inline-flex items-center gap-1 font-bold text-sm text-gray-400">
                준비중입니다
              </span>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-sm text-gray-700 leading-relaxed">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-amber-600 text-lg">ℹ</span>
              <p className="font-bold text-gray-800">세액공제 안내</p>
            </div>
            <p>
              아름다운생명사랑은 공익법인(구 지정기부금단체)으로 지정되어 있습니다.<br />
              <strong>개인 기부자</strong>: 기부금의 15%(1,000만 원 초과분 30%) 세액공제<br />
              <strong>법인 기부자</strong>: 법인 소득의 10% 한도 내 손금 산입
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
