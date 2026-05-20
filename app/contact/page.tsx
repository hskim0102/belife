import type { Metadata } from 'next'
import { getSiteSettings } from '@/lib/sanity/queries'
import { SectionLabel } from '@/components/ui/SectionLabel'

export const metadata: Metadata = { title: '문의' }

export const revalidate = 60

const contactItems = [
  {
    key: 'phone',
    icon: '📞',
    label: '전화',
  },
  {
    key: 'email',
    icon: '✉️',
    label: '이메일',
  },
  {
    key: 'address',
    icon: '📍',
    label: '주소',
  },
]

export default async function ContactPage() {
  const settings = await getSiteSettings()

  return (
    <>
      {/* Page header */}
      <div className="bg-gradient-to-br from-primary-darker to-primary-dark px-6 py-16">
        <div className="max-w-2xl mx-auto">
          <SectionLabel>Contact</SectionLabel>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight mb-3">문의</h1>
          <p className="text-white/65 leading-relaxed">
            사업 협력, 후원, 봉사 문의는 아래 연락처로 연락해주세요.
          </p>
        </div>
      </div>

      <div className="py-16 px-6">
        <div className="max-w-2xl mx-auto">
          {!settings ? (
            <p className="text-gray-500">Sanity Studio에서 사이트 설정을 입력해주세요.</p>
          ) : (
            <div className="space-y-4">
              {settings.phoneNumber && (
                <div className="bg-gray-50 rounded-2xl p-6 flex gap-5 items-start border border-gray-100 hover:border-primary-lighter hover:bg-primary-light transition-colors">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-2xl shadow-sm border border-gray-100 shrink-0">
                    📞
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">전화</p>
                    <p className="text-gray-900 font-bold text-lg">{settings.phoneNumber}</p>
                  </div>
                </div>
              )}
              {settings.contactEmail && (
                <div className="bg-gray-50 rounded-2xl p-6 flex gap-5 items-start border border-gray-100 hover:border-primary-lighter hover:bg-primary-light transition-colors">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-2xl shadow-sm border border-gray-100 shrink-0">
                    ✉️
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">이메일</p>
                    <a href={`mailto:${settings.contactEmail}`} className="text-primary font-bold text-lg hover:underline">
                      {settings.contactEmail}
                    </a>
                  </div>
                </div>
              )}
              {settings.address && (
                <div className="bg-gray-50 rounded-2xl p-6 flex gap-5 items-start border border-gray-100 hover:border-primary-lighter hover:bg-primary-light transition-colors">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-2xl shadow-sm border border-gray-100 shrink-0">
                    📍
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">주소</p>
                    <p className="text-gray-900 font-semibold">{settings.address}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  )
}