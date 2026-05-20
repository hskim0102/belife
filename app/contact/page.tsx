import type { Metadata } from 'next'
import { getSiteSettings } from '@/lib/sanity/queries'
import { SectionLabel } from '@/components/ui/SectionLabel'

export const metadata: Metadata = { title: '문의' }

export const revalidate = 60

export default async function ContactPage() {
  const settings = await getSiteSettings()

  return (
    <div className="py-20 px-6">
      <div className="max-w-2xl mx-auto">
        <SectionLabel>Contact</SectionLabel>
        <h1 className="text-4xl font-black mb-4">문의</h1>
        <p className="text-text-subtle mb-12 leading-relaxed">
          사업 협력, 후원, 봉사 문의는 아래 연락처로 연락해주세요.
        </p>

        <div className="space-y-5">
          {settings?.phoneNumber && (
            <div className="flex gap-4 items-start">
              <span className="text-2xl">📞</span>
              <div>
                <p className="font-bold text-sm mb-0.5">전화</p>
                <p className="text-text-subtle">{settings.phoneNumber}</p>
              </div>
            </div>
          )}
          {settings?.contactEmail && (
            <div className="flex gap-4 items-start">
              <span className="text-2xl">✉️</span>
              <div>
                <p className="font-bold text-sm mb-0.5">이메일</p>
                <a href={`mailto:${settings.contactEmail}`} className="text-primary hover:underline">
                  {settings.contactEmail}
                </a>
              </div>
            </div>
          )}
          {settings?.address && (
            <div className="flex gap-4 items-start">
              <span className="text-2xl">📍</span>
              <div>
                <p className="font-bold text-sm mb-0.5">주소</p>
                <p className="text-text-subtle">{settings.address}</p>
              </div>
            </div>
          )}
          {!settings && (
            <p className="text-text-subtle">Sanity Studio에서 사이트 설정을 입력해주세요.</p>
          )}
        </div>
      </div>
    </div>
  )
}
