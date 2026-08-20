import type { Metadata } from 'next'
import { PageHero } from '@/components/ui/PageHero'
import { getLocationSettings } from '@/lib/repositories/location'
import { sanitizePostBody } from '@/lib/sanitize'

export const metadata: Metadata = { title: '오시는 길' }

export const revalidate = 60

/** 관리자가 입력한 안내 본문(HTML)을 담는 카드. 내용이 없으면 렌더링하지 않는다. */
function BodyCard({ html }: { html: string }) {
  if (!html) return null
  return (
    <div
      className="bg-gray-50 rounded-2xl p-6 border border-gray-100 prose max-w-none prose-headings:text-base prose-headings:font-bold prose-headings:text-primary-dark prose-headings:mt-6 prose-headings:mb-2 prose-headings:first:mt-0 prose-p:text-gray-600 prose-p:leading-relaxed prose-strong:text-gray-800 prose-img:rounded-xl"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}

/** 섹션 번호가 붙은 제목 */
function SectionTitle({ no, children }: { no: number; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <span className="w-9 h-9 rounded-full bg-primary text-white font-black flex items-center justify-center shrink-0">
        {no}
      </span>
      <h2 className="text-2xl font-black text-gray-900">{children}</h2>
    </div>
  )
}

export default async function LocationPage() {
  const location = await getLocationSettings()
  const transitBody = sanitizePostBody(location.transitBody)
  const carBody = sanitizePostBody(location.carBody)
  // 비어 있는 항목은 건너뛰고 남은 항목에만 1·2·3 번호를 붙인다.
  const sectionNo = (() => {
    let n = 0
    return { transit: transitBody ? ++n : 0, car: carBody ? ++n : 0, map: location.mapImage ? ++n : 0 }
  })()

  return (
    <>
      <PageHero
        label="Location"
        title="오시는 길"
        subtitle={location.heroSubtitle}
        icon="📍"
        maxWidth="max-w-4xl"
      />

      <div className="py-16 px-6">
        <div className="max-w-4xl mx-auto space-y-14">
          {/* 지도 + 주소 */}
          <section>
            <div className="relative rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
              <iframe
                title="아름다운생명사랑 위치 지도"
                src={location.mapEmbed}
                className="w-full h-[380px] md:h-[460px] block"
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
              />
              {/* 지도 중심(기관 위치)에 위치 핀 표시 */}
              <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-full">
                <svg width="40" height="40" viewBox="0 0 24 24" className="drop-shadow-md" aria-hidden="true">
                  <path
                    d="M12 2c-3.87 0-7 3.13-7 7 0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
                    className="fill-primary"
                    stroke="#fff"
                    strokeWidth="1.5"
                  />
                  <circle cx="12" cy="9" r="2.6" fill="#fff" />
                </svg>
              </div>
            </div>

            <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-4 bg-primary-light rounded-2xl p-6 border border-primary-lighter">
              <div className="flex items-start gap-4 flex-1">
                <div className="w-11 h-11 bg-white rounded-xl flex items-center justify-center text-2xl shadow-sm shrink-0">
                  📍
                </div>
                <div>
                  <p className="text-xs font-bold text-primary uppercase tracking-wide mb-1">주소</p>
                  <p className="text-gray-900 font-bold text-lg leading-snug">{location.address}</p>
                </div>
              </div>
              <a
                href={`https://map.kakao.com/link/search/${encodeURIComponent(location.mapQuery)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 bg-primary-darker text-white font-bold text-sm px-5 py-3 rounded-xl hover:bg-primary-dark transition-colors shrink-0"
              >
                지도에서 열기
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14 5h5m0 0v5m0-5L10 14M9 5H5v14h14v-4" />
                </svg>
              </a>
            </div>
          </section>

          {/* 1. 대중교통 이용시 */}
          {transitBody && (
            <section>
              <SectionTitle no={sectionNo.transit}>대중교통 이용시</SectionTitle>
              <BodyCard html={transitBody} />
            </section>
          )}

          {/* 2. 자동차 이용시 */}
          {carBody && (
            <section>
              <SectionTitle no={sectionNo.car}>자동차 이용시</SectionTitle>
              <BodyCard html={carBody} />
            </section>
          )}

          {/* 3. 약도 */}
          {location.mapImage && (
            <section>
              <SectionTitle no={sectionNo.map}>약도</SectionTitle>
              <div className="rounded-2xl overflow-hidden border border-gray-100 bg-white p-2">
                {/* 관리자가 올린 외부(Blob) 이미지도 들어오므로 next/image 대신 일반 img 사용 */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={location.mapImage} alt={location.mapImageAlt} className="w-full h-auto" />
              </div>
            </section>
          )}
        </div>
      </div>
    </>
  )
}
