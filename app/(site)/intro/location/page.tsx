import type { Metadata } from 'next'
import Image from 'next/image'
import { PageHero } from '@/components/ui/PageHero'

export const metadata: Metadata = { title: '오시는 길' }

export const revalidate = 60

// 표시 주소 (지도 위치와 일치)
const ADDRESS = '서울시 강북구 인수봉로55가길 16-15 하늘평화센터 2층'
// 지도/내비게이션 검색용 도로명 주소
const MAP_QUERY = '서울시 강북구 인수봉로55가길 16-15'
// Google 지도 임베드(pb 방식, API 키 불필요). 인수봉로55가길 일대를 중심으로 표시.
// !1d=줌(작을수록 확대) !2d=경도 !3d=위도
const MAP_PB =
  '!1m18!1m12!1m3!1d3162!2d127.0098867!3d37.6359269!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2z!5e0!3m2!1sko!2skr!4v1700000000000!5m2!1sko!2skr'

export default function LocationPage() {
  const address = ADDRESS
  const mapSrc = `https://www.google.com/maps/embed?pb=${MAP_PB}`

  return (
    <>
      <PageHero
        label="Location"
        title="오시는 길"
        subtitle="아름다운생명사랑을 찾아오시는 방법을 안내해 드립니다."
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
                src={mapSrc}
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
                  <p className="text-gray-900 font-bold text-lg leading-snug">{address}</p>
                </div>
              </div>
              <a
                href={`https://map.kakao.com/link/search/${encodeURIComponent(MAP_QUERY)}`}
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
          <section>
            <div className="flex items-center gap-3 mb-6">
              <span className="w-9 h-9 rounded-full bg-primary text-white font-black flex items-center justify-center shrink-0">
                1
              </span>
              <h2 className="text-2xl font-black text-gray-900">대중교통 이용시</h2>
            </div>
            <div className="space-y-5">
              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                <p className="font-bold text-primary-dark mb-2">1) 지하철 4호선 수유역</p>
                <p className="text-gray-600 leading-relaxed">
                  3번 출구 앞 마을버스 <b className="text-gray-800">강북02</b> 승차 → 세븐일레븐 정류장(구 형제슈퍼)
                  하차 → 세븐일레븐 골목 200m 직진 → 동익빌라 앞에서 우회전
                </p>
              </div>
              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                <p className="font-bold text-primary-dark mb-2">2) 우이신설 경전철 화계역</p>
                <p className="text-gray-600 leading-relaxed">
                  2번 출구 하차 → 송암교회 방면으로 횡단보도를 건넌 후, 이디야 앞{' '}
                  <b className="text-gray-800">송암교회·화계사거리(09-803)</b> 정류장에서 마을버스{' '}
                  <b className="text-gray-800">강북02</b> 승차 → 세븐일레븐 정류장(구 형제슈퍼) 하차 → 세븐일레븐
                  골목 200m 직진 → 동익빌라 앞에서 우회전
                </p>
              </div>
            </div>
          </section>

          {/* 2. 자동차 이용시 */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <span className="w-9 h-9 rounded-full bg-primary text-white font-black flex items-center justify-center shrink-0">
                2
              </span>
              <h2 className="text-2xl font-black text-gray-900">자동차 이용시</h2>
            </div>
            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 text-gray-600 leading-relaxed">
              <p>
                내비게이션에 <b className="text-gray-800">‘{MAP_QUERY}’</b>를 입력해 주세요.
              </p>
              <p className="mt-2 text-sm text-gray-500">
                ※ 주차 공간이 협소하니 가급적 대중교통 이용을 권장드립니다.
              </p>
            </div>
          </section>

          {/* 3. 약도 */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <span className="w-9 h-9 rounded-full bg-primary text-white font-black flex items-center justify-center shrink-0">
                3
              </span>
              <h2 className="text-2xl font-black text-gray-900">약도</h2>
            </div>
            <div className="rounded-2xl overflow-hidden border border-gray-100 bg-white p-2">
              <Image
                src="/directions-map.png"
                alt="아름다운생명사랑 찾아오시는 약도 — 수유역 3번 출구 또는 화계역 2번 출구에서 마을버스 강북02 승차 후 세븐일레븐(구 형제슈퍼) 정류장 하차, 도보 200m"
                width={1417}
                height={1360}
                className="w-full h-auto"
              />
            </div>
          </section>
        </div>
      </div>
    </>
  )
}
