import type { Metadata } from 'next'
import { PageHero } from '@/components/ui/PageHero'
import { getMenuPageBySlug } from '@/lib/repositories/menuPages'
import { sanitizePostBody } from '@/lib/sanitize'

export const metadata: Metadata = { title: '기관 소개' }
export const revalidate = 60

// 마이그레이션(006_menu_pages.sql) 이전 DB 를 위한 폴백 본문.
// 평소에는 관리자 > 메뉴 페이지에서 수정하는 menu_pages(slug='intro') 내용이 렌더링된다.
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

function FallbackBody() {
  return (
    <>
      <p className="text-gray-600 leading-relaxed text-lg mb-16 border-l-4 border-primary pl-5">
        의료계층을 위한 보건의료문서와 교육 및 연구사업을 통하여 존엄한 생명의 아름다움을 꽃 피우기 위한 생명사랑운동단체입니다.
        2006년 6월 20일 「프레임비고」로 창립하였으며 &ldquo;한 생명이 천하보다 소중하다&rdquo;는 생명사랑의 정신을 실현하고자 합니다.
      </p>

      <div className="grid md:grid-cols-2 gap-10">
        <div className="bg-gradient-to-br from-primary-light to-primary-lighter rounded-2xl p-8 border border-primary-lighter">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-black">소</span>
            </div>
            <h2 className="text-xl font-black text-primary-dark">소명</h2>
          </div>
          <ul className="space-y-3.5">
            {visions.map((v, i) => (
              <li key={i} className="flex gap-3 text-sm leading-relaxed text-gray-700">
                <span className="text-primary font-bold mt-0.5 shrink-0">✦</span>
                <span>{v}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-gray-50 rounded-2xl p-8 border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-black">핵</span>
            </div>
            <h2 className="text-xl font-black text-gray-800">핵심가치</h2>
          </div>
          <ul className="space-y-3.5">
            {values.map((v, i) => (
              <li key={i} className="flex gap-3 text-sm leading-relaxed text-gray-700">
                <span className="text-gray-400 font-bold mt-0.5 shrink-0">✦</span>
                <span>{v}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  )
}

export default async function IntroPage() {
  const page = await getMenuPageBySlug('intro')
  const cmsBody = page?.published && page.body ? sanitizePostBody(page.body) : ''

  return (
    <>
      <PageHero label="About" title="아름다운생명사랑은" icon="🌸" maxWidth="max-w-3xl" />

      <div className="py-16 px-6">
        <div className="max-w-3xl mx-auto">
          {cmsBody ? (
            <div
              className="prose prose-lg max-w-none prose-headings:font-black prose-p:text-gray-700 prose-p:leading-relaxed prose-img:rounded-xl prose-img:mx-auto"
              dangerouslySetInnerHTML={{ __html: cmsBody }}
            />
          ) : (
            <FallbackBody />
          )}
        </div>
      </div>
    </>
  )
}
