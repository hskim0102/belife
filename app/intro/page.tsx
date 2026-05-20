import type { Metadata } from 'next'
import { SectionLabel } from '@/components/ui/SectionLabel'

export const metadata: Metadata = { title: '소개' }

const visions = [
  '저소득 어르신의 건강을 위해 일한다.',
  '취약계층 어린이들의 건강을 위해 일한다.',
  '동남아시아 이웃의 건강을 위해 일한다.',
  '이주민의 건강을 위해 일한다.',
  '북한이탈주민의 건강을 위해 일한다.',
  '생명을 사랑하는 의료를 교육하고 연구한다.',
  '생명사랑의료센터를 설립하여 생명사랑의료를 실천한다.',
]

const values = [
  '한 생명을 천하와 같이 중히 여기어 사랑한다.',
  '성실과 진실로 봉사하고 연구한다.',
  '생명사랑운동을 이루어 생명사랑운동을 실천한다.',
  '함께하는 단체들과 협력하여 사랑의 그물망을 이룬다.',
]

export default function IntroPage() {
  return (
    <div className="py-20 px-6">
      <div className="max-w-3xl mx-auto">
        <SectionLabel>About</SectionLabel>
        <h1 className="text-4xl font-black mb-6">아름다운생명사랑은</h1>
        <p className="text-text-subtle leading-relaxed mb-16">
          의료계층을 위한 보건의료문서와 교육 및 연구사업을 통하여 존엄한 생명의 아름다움을 꽃 피우기 위한 생명사랑운동단체입니다.
          2006년 6월 20일 「프레임비고」로 창립하였으며 "한 생명이 천하보다 소중하다"는 생명사랑의 정신을 실현하고자 합니다.
        </p>

        <div className="grid md:grid-cols-2 gap-10">
          <div>
            <h2 className="text-xl font-black mb-5 text-primary-dark">소명</h2>
            <ul className="space-y-3">
              {visions.map((v, i) => (
                <li key={i} className="flex gap-3 text-sm leading-relaxed">
                  <span className="text-primary mt-0.5">♥</span>
                  <span>{v}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="text-xl font-black mb-5 text-primary-dark">핵심가치</h2>
            <ul className="space-y-3">
              {values.map((v, i) => (
                <li key={i} className="flex gap-3 text-sm leading-relaxed">
                  <span className="text-primary mt-0.5">♥</span>
                  <span>{v}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
