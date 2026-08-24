import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { PageHero } from '@/components/ui/PageHero'

export const metadata: Metadata = { title: '개인정보처리방침' }

const EFFECTIVE_DATE = '2014년 6월 1일'

/** 1. 수집 및 이용 목적 */
const PURPOSES = [
  '홈페이지 회원관리',
  '마케팅 및 광고에 활용',
  '후원금 결제 및 후원자 서비스 제공에 관한 계약',
  '회사 내부 방침에 의한 정보보유 사유',
  '고객상담 등 후원 서비스',
]

/** 2. 수집 항목 — 상황별 묶음 */
const COLLECTED: {
  scene: string
  groups: { kind: '필수' | '선택'; label?: string; items: string[] }[]
}[] = [
  {
    scene: '회원가입 시',
    groups: [
      {
        kind: '필수',
        items: [
          '회원아이디',
          '암호화된 비밀번호',
          '이름',
          '전화번호',
          '휴대전화번호',
          '자기소개',
          '이메일주소',
          '소속(하는 일)',
        ],
      },
    ],
  },
  {
    scene: '후원 신청 시',
    groups: [
      {
        kind: '필수',
        label: '공통',
        items: ['주소', '소식지 신청', '기부영수증 여부', '신청 동기'],
      },
      {
        kind: '필수',
        label: '신용카드 결제 시',
        items: ['카드명', '카드번호', '유효기간', '카드소유주', '카드번호 인증정보'],
      },
      {
        kind: '필수',
        label: '자동이체 시',
        items: [
          '은행명',
          '예금주',
          '계좌번호',
          '예금주 주민등록번호',
          '이체일',
          '계좌번호 인증정보',
        ],
      },
      { kind: '선택', items: ['자택주소', '직업', '종교'] },
    ],
  },
]

/** 서비스 이용 과정에서 자동으로 만들어져 쌓이는 정보 */
const AUTO_COLLECTED = ['IP Address', '쿠키', '방문일시', '서비스 이용 기록', '불량 이용 기록']

/** 3. 보유 기간에서 근거로 삼는 법령 */
const RETENTION_LAWS = [
  '전자상거래 등에서의 소비자보호에 관한 법률',
  '정보통신망 이용촉진 및 정보보호 등에 관한 법률',
  '통신비밀보호법',
]

/** 번호가 붙은 본문 섹션 카드 */
function Section({
  no,
  title,
  children,
}: {
  no: number
  title: string
  children: ReactNode
}) {
  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-6 sm:p-8 shadow-card">
      <div className="flex items-center gap-3 mb-5">
        <span className="w-8 h-8 shrink-0 rounded-lg bg-primary text-white text-sm font-black flex items-center justify-center">
          {no}
        </span>
        <h2 className="text-lg sm:text-xl font-black text-gray-900">{title}</h2>
      </div>
      {children}
    </section>
  )
}

/** 수집 항목처럼 낱말이 길게 나열되는 곳을 한눈에 보이게 하는 알약 목록 */
function Tags({ items, tone = 'primary' }: { items: string[]; tone?: 'primary' | 'gray' }) {
  return (
    <ul className="flex flex-wrap gap-1.5">
      {items.map(item => (
        <li
          key={item}
          className={
            tone === 'primary'
              ? 'text-[13px] font-semibold text-primary-darker bg-primary-lighter px-2.5 py-1 rounded-full'
              : 'text-[13px] font-semibold text-gray-600 bg-gray-100 px-2.5 py-1 rounded-full'
          }
        >
          {item}
        </li>
      ))}
    </ul>
  )
}

function KindBadge({ kind }: { kind: '필수' | '선택' }) {
  return (
    <span
      className={`shrink-0 text-[11px] font-bold px-2 py-0.5 rounded-full ${
        kind === '필수' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600'
      }`}
    >
      {kind} 항목
    </span>
  )
}

export default function PrivacyPage() {
  return (
    <>
      <PageHero
        label="Privacy"
        title="개인정보처리방침"
        subtitle="사단법인 아름다운생명사랑은 개인정보보호법에 의거하여 이용자의 개인정보를 수집·이용하며, 그 내용을 아래와 같이 안내합니다."
        icon="🔒"
        maxWidth="max-w-4xl"
      >
        <p className="mt-6 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-sm font-semibold text-white/90">
          시행일 · {EFFECTIVE_DATE}
        </p>
      </PageHero>

      <div className="py-14 px-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* 개정 안내 */}
          <p className="rounded-2xl border-l-4 border-primary bg-primary-light px-6 py-5 text-[15px] leading-relaxed text-gray-700">
            사단법인 아름다운생명사랑은 개인정보처리방침을 개정하는 경우, 웹사이트 공지사항(또는
            개별 공지)을 통하여 공지할 것입니다.
          </p>

          <Section no={1} title="개인정보 수집 및 이용 목적">
            <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-3">
              {PURPOSES.map(purpose => (
                <li key={purpose} className="flex gap-2.5 text-[15px] leading-relaxed text-gray-700">
                  <span className="mt-1 shrink-0 text-primary font-bold" aria-hidden="true">
                    ✦
                  </span>
                  <span>{purpose}</span>
                </li>
              ))}
            </ul>
          </Section>

          <Section no={2} title="수집하려는 개인정보의 항목">
            <p className="text-[15px] leading-relaxed text-gray-700 mb-6">
              회원가입, 원활한 고객상담, 후원신청 등 기본적인 서비스 제공을 위한{' '}
              <strong className="font-bold text-gray-900">필수정보</strong>와, 고객 맞춤 서비스 제공을
              위한 <strong className="font-bold text-gray-900">선택정보</strong>로 구분하여 아래와 같은
              개인정보를 수집합니다.
            </p>

            <div className="space-y-5">
              {COLLECTED.map(({ scene, groups }) => (
                <div key={scene} className="rounded-xl border border-gray-100 bg-gray-50/70 p-5">
                  <h3 className="text-[15px] font-black text-gray-900 mb-4">{scene}</h3>
                  <div className="space-y-4">
                    {groups.map((group, i) => (
                      <div key={i}>
                        <div className="flex items-center gap-2 mb-2">
                          <KindBadge kind={group.kind} />
                          {group.label && (
                            <span className="text-sm font-bold text-gray-700">{group.label}</span>
                          )}
                        </div>
                        <Tags items={group.items} tone={group.kind === '필수' ? 'primary' : 'gray'} />
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              <div className="rounded-xl border border-gray-100 bg-gray-50/70 p-5">
                <h3 className="text-[15px] font-black text-gray-900 mb-1">자동으로 생성·수집되는 정보</h3>
                <p className="text-sm text-gray-500 leading-relaxed mb-4">
                  서비스 이용 과정이나 사업 처리 과정에서 아래 정보들이 자동으로 생성되어 수집될 수
                  있습니다.
                </p>
                <Tags items={AUTO_COLLECTED} tone="gray" />
              </div>
            </div>
          </Section>

          <Section no={3} title="개인정보의 보유 및 이용기간">
            <p className="text-[15px] leading-relaxed text-gray-700">
              이용자의 개인정보는 원칙적으로 개인정보의 수집 및 이용목적이 달성되면 지체 없이
              파기합니다. 다만 후원금 결제 및 후원자 서비스 제공에 관한 계약 등 개인정보처리방침에
              별도로 명시한 경우에는 아래 법령에 준하여 보유합니다.
            </p>
            <ul className="mt-4 space-y-2">
              {RETENTION_LAWS.map(law => (
                <li
                  key={law}
                  className="flex gap-2.5 text-sm leading-relaxed text-gray-600 rounded-lg bg-gray-50 px-4 py-2.5"
                >
                  <span className="shrink-0 text-gray-300" aria-hidden="true">
                    §
                  </span>
                  <span>{law}</span>
                </li>
              ))}
            </ul>
          </Section>

          <Section no={4} title="동의를 거부할 권리 및 거부에 따른 안내">
            <p className="text-[15px] leading-relaxed text-gray-700">
              고객께서는 본 안내에 따른 개인정보 수집 등에 대하여 거부할 수 있는 권리가 있습니다.
            </p>
            <p className="mt-4 rounded-xl bg-primary-light border border-primary-lighter px-5 py-4 text-[15px] leading-relaxed text-primary-darker">
              다만 수집에 동의하지 않으실 경우, 홈페이지 회원서비스 및 각종 후원 서비스를 받으실 수
              없습니다.
            </p>
          </Section>
        </div>
      </div>
    </>
  )
}
