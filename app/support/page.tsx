// app/support/page.tsx
import type { Metadata } from 'next'
import { getSiteSettings } from '@/lib/sanity/queries'
import { SectionLabel } from '@/components/ui/SectionLabel'

export const metadata: Metadata = { title: '후원·참여' }

export default async function SupportPage() {
  const settings = await getSiteSettings()

  return (
    <div className="py-20 px-6">
      <div className="max-w-3xl mx-auto">
        <SectionLabel>Support</SectionLabel>
        <h1 className="text-4xl font-black mb-4">후원·참여</h1>
        <p className="text-text-subtle mb-16 leading-relaxed">
          아름다운생명사랑은 공익법인(구 지정기부금단체)으로 후원금에 대해 세액공제 혜택이 주어집니다.
        </p>

        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {/* 정기후원 */}
          <div className="bg-primary-light rounded-card-lg p-8 border border-primary-lighter">
            <h2 className="text-xl font-black text-primary-dark mb-4">정기후원</h2>
            <p className="text-sm text-text-subtle leading-relaxed mb-6">
              매월 일정 금액을 후원하시면 꾸준한 사업 진행에 큰 힘이 됩니다.
            </p>
            <div className="bg-white rounded-card p-4 text-sm">
              <p className="font-bold mb-1">후원 계좌</p>
              <p className="text-primary font-mono text-lg">{settings?.donationBank} {settings?.donationAccount}</p>
              <p className="text-text-subtle mt-1">예금주: {settings?.donationHolder}</p>
            </div>
          </div>

          {/* 의료봉사 */}
          <div className="bg-white rounded-card-lg p-8 border border-gray-200">
            <h2 className="text-xl font-black text-primary-dark mb-4">의료봉사 신청</h2>
            <p className="text-sm text-text-subtle leading-relaxed mb-6">
              의료인·예비의료인이라면 생명사랑의료학교 및 의료봉사 활동에 참여하실 수 있습니다.
            </p>
            <a
              href={`mailto:${settings?.contactEmail ?? 'belife@belife.org'}`}
              className="inline-block bg-primary text-white px-6 py-3 rounded-full text-sm font-semibold hover:bg-primary-dark transition-colors"
            >
              이메일로 문의하기
            </a>
          </div>
        </div>

        <div className="bg-gray-50 rounded-card-lg p-6 text-sm text-text-subtle leading-relaxed">
          <p className="font-bold text-text mb-2">세액공제 안내</p>
          <p>아름다운생명사랑은 공익법인(구 지정기부금단체)으로 지정되어 있습니다.<br />
          개인 기부자: 기부금의 15%(1,000만 원 초과분 30%) 세액공제<br />
          법인 기부자: 법인 소득의 10% 한도 내 손금 산입</p>
        </div>
      </div>
    </div>
  )
}
