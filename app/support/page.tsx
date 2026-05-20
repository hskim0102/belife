// app/support/page.tsx
import type { Metadata } from 'next'
import { getSiteSettings } from '@/lib/sanity/queries'
import { SectionLabel } from '@/components/ui/SectionLabel'

export const metadata: Metadata = { title: '후원·참여' }

export const revalidate = 60

export default async function SupportPage() {
  const settings = await getSiteSettings()

  return (
    <>
      {/* Page header */}
      <div className="bg-gradient-to-br from-primary-darker to-primary-dark px-6 py-16">
        <div className="max-w-3xl mx-auto">
          <SectionLabel>Support</SectionLabel>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight mb-3">후원·참여</h1>
          <p className="text-white/65 leading-relaxed">
            아름다운생명사랑은 공익법인(구 지정기부금단체)으로<br />후원금에 대해 세액공제 혜택이 주어집니다.
          </p>
        </div>
      </div>

      <div className="py-16 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {/* 정기후원 */}
            <div className="bg-primary-light rounded-2xl p-8 border border-primary-lighter">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center mb-5">
                <span className="text-white text-xl">💚</span>
              </div>
              <h2 className="text-xl font-black text-primary-dark mb-3">정기후원</h2>
              <p className="text-sm text-gray-600 leading-relaxed mb-6">
                매월 일정 금액을 후원하시면 꾸준한 사업 진행에 큰 힘이 됩니다.
              </p>
              <div className="bg-white rounded-xl p-5 border border-primary-lighter">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">후원 계좌</p>
                <p className="text-primary font-black text-lg font-mono">{settings?.donationBank} {settings?.donationAccount}</p>
                <p className="text-gray-500 text-sm mt-1">예금주: {settings?.donationHolder}</p>
              </div>
            </div>

            {/* 의료봉사 */}
            <div className="bg-gray-50 rounded-2xl p-8 border border-gray-100">
              <div className="w-10 h-10 bg-gray-800 rounded-xl flex items-center justify-center mb-5">
                <span className="text-white text-xl">🏥</span>
              </div>
              <h2 className="text-xl font-black text-gray-800 mb-3">의료봉사 신청</h2>
              <p className="text-sm text-gray-600 leading-relaxed mb-6">
                의료인·예비의료인이라면 생명사랑의료학교 및 의료봉사 활동에 참여하실 수 있습니다.
              </p>
              <a
                href={`mailto:${settings?.contactEmail || 'belife@belife.org'}`}
                className="inline-block bg-gray-900 text-white px-6 py-3 rounded-full text-sm font-bold hover:bg-gray-700 transition-colors"
              >
                이메일로 문의하기 →
              </a>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-sm text-gray-700 leading-relaxed">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-amber-600 text-lg">ℹ</span>
              <p className="font-bold text-gray-800">세액공제 안내</p>
            </div>
            <p>아름다운생명사랑은 공익법인(구 지정기부금단체)으로 지정되어 있습니다.<br />
            <strong>개인 기부자</strong>: 기부금의 15%(1,000만 원 초과분 30%) 세액공제<br />
            <strong>법인 기부자</strong>: 법인 소득의 10% 한도 내 손금 산입</p>
          </div>
        </div>
      </div>
    </>
  )
}