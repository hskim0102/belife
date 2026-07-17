import type { Metadata } from 'next'
import { PageHero } from '@/components/ui/PageHero'

export const metadata: Metadata = { title: '문의' }

export const revalidate = 60

// 기관 연락처 정보
const CONTACT = {
  address: '서울시 강북구 인수봉로55가길 16-15 하늘평화센터 202호',
  zipcode: '01024',
  phone: '02-6080-5798',
  fax: '02-6008-7998',
  email: 'belifeorg@hanmail.net',
}

export default function ContactPage() {
  return (
    <>
      <PageHero
        label="Contact"
        title="문의"
        subtitle="사업 협력, 후원, 봉사 문의는 아래 연락처로 연락해주세요."
        icon="✉️"
        maxWidth="max-w-2xl"
      />

      <div className="py-16 px-6">
        <div className="max-w-2xl mx-auto space-y-4">
          {/* 주소 */}
          <div className="bg-gray-50 rounded-2xl p-6 flex gap-5 items-start border border-gray-100 hover:border-primary-lighter hover:bg-primary-light transition-colors">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-2xl shadow-sm border border-gray-100 shrink-0">
              📍
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">주소</p>
              <p className="text-gray-900 font-semibold leading-snug">{CONTACT.address}</p>
              <p className="text-gray-500 text-sm mt-1">우편번호 {CONTACT.zipcode}</p>
            </div>
          </div>

          {/* 전화 */}
          <div className="bg-gray-50 rounded-2xl p-6 flex gap-5 items-start border border-gray-100 hover:border-primary-lighter hover:bg-primary-light transition-colors">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-2xl shadow-sm border border-gray-100 shrink-0">
              📞
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">전화</p>
              <a href={`tel:${CONTACT.phone.replace(/-/g, '')}`} className="text-gray-900 font-bold text-lg hover:text-primary transition-colors">
                {CONTACT.phone}
              </a>
            </div>
          </div>

          {/* 팩스 */}
          <div className="bg-gray-50 rounded-2xl p-6 flex gap-5 items-start border border-gray-100 hover:border-primary-lighter hover:bg-primary-light transition-colors">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-2xl shadow-sm border border-gray-100 shrink-0">
              📠
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">팩스</p>
              <p className="text-gray-900 font-bold text-lg">{CONTACT.fax}</p>
            </div>
          </div>

          {/* 이메일 */}
          <div className="bg-gray-50 rounded-2xl p-6 flex gap-5 items-start border border-gray-100 hover:border-primary-lighter hover:bg-primary-light transition-colors">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-2xl shadow-sm border border-gray-100 shrink-0">
              ✉️
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">이메일</p>
              <a href={`mailto:${CONTACT.email}`} className="text-primary font-bold text-lg hover:underline">
                {CONTACT.email}
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
