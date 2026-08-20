'use client'

import { useActionState, useRef, useState } from 'react'
import type { LocationSettings } from '@/lib/repositories/location'
import { TiptapEditor } from '@/components/admin/TiptapEditor'
import { updateLocationAction, type LocationFormState } from '../../location-actions'

const inputClass =
  'w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors'

const labelClass = 'block text-sm font-semibold text-gray-700 mb-1.5'

export function LocationForm({ current }: { current: LocationSettings }) {
  const [state, formAction, pending] = useActionState<LocationFormState, FormData>(
    updateLocationAction,
    {},
  )
  const [fileName, setFileName] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  return (
    <form action={formAction} className="space-y-6">
      <section className="bg-white rounded-xl border border-gray-100 p-5 space-y-4">
        <h2 className="text-sm font-bold text-gray-700">주소 · 지도</h2>

        <div>
          <label htmlFor="heroSubtitle" className={labelClass}>
            상단 안내 문구
          </label>
          <input
            id="heroSubtitle"
            name="heroSubtitle"
            type="text"
            maxLength={200}
            defaultValue={current.heroSubtitle}
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="address" className={labelClass}>
            주소 <span className="font-normal text-gray-400">(화면에 표시되는 전체 주소)</span>
          </label>
          <input
            id="address"
            name="address"
            type="text"
            required
            maxLength={200}
            defaultValue={current.address}
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="mapQuery" className={labelClass}>
            지도 검색용 주소{' '}
            <span className="font-normal text-gray-400">
              (&lsquo;지도에서 열기&rsquo; 버튼과 내비게이션 안내에 사용)
            </span>
          </label>
          <input
            id="mapQuery"
            name="mapQuery"
            type="text"
            required
            maxLength={200}
            defaultValue={current.mapQuery}
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="mapEmbed" className={labelClass}>
            지도 embed 주소 <span className="font-normal text-gray-400">(페이지에 박히는 구글 지도)</span>
          </label>
          <textarea
            id="mapEmbed"
            name="mapEmbed"
            rows={3}
            defaultValue={current.mapEmbed}
            className={`${inputClass} resize-y font-mono text-xs`}
          />
          <p className="mt-1.5 text-xs text-gray-400">
            구글 지도에서 <b>공유 → 지도 퍼가기</b>의 HTML을 복사해 붙여넣으면 됩니다(iframe 태그째 붙여넣어도
            주소만 자동으로 추출합니다). 비워 두면 기본 지도가 표시됩니다.
          </p>
        </div>
      </section>

      <section className="bg-white rounded-xl border border-gray-100 p-5 space-y-3">
        <h2 className="text-sm font-bold text-gray-700">대중교통 이용시</h2>
        <TiptapEditor name="transitBody" defaultValue={current.transitBody} />
      </section>

      <section className="bg-white rounded-xl border border-gray-100 p-5 space-y-3">
        <h2 className="text-sm font-bold text-gray-700">자동차 이용시</h2>
        <TiptapEditor name="carBody" defaultValue={current.carBody} />
      </section>

      <section className="bg-white rounded-xl border border-gray-100 p-5 space-y-4">
        <h2 className="text-sm font-bold text-gray-700">약도</h2>

        <div className="flex flex-wrap items-start gap-5">
          <div className="w-48 shrink-0 rounded-lg border border-gray-100 overflow-hidden bg-gray-50">
            {/* 외부(Blob) 이미지도 들어오므로 next/image 대신 일반 img 사용 */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={current.mapImage} alt="현재 약도" className="w-full h-auto block" />
          </div>

          <div className="flex-1 min-w-[16rem] space-y-4">
            <div>
              <label className={labelClass}>약도 이미지 교체</label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 text-sm font-semibold hover:bg-gray-200 transition-colors"
                >
                  파일 선택
                </button>
                <span className="text-sm text-gray-400 truncate">
                  {fileName || '선택하지 않으면 현재 이미지를 그대로 둡니다'}
                </span>
              </div>
              <input
                ref={fileRef}
                type="file"
                name="mapImageFile"
                accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
                className="hidden"
                onChange={e => setFileName(e.target.files?.[0]?.name ?? '')}
              />
              <p className="mt-1.5 text-xs text-gray-400">JPG·PNG·WEBP·AVIF·GIF, 최대 8MB.</p>
            </div>

            <div>
              <label htmlFor="mapImageAlt" className={labelClass}>
                약도 대체 텍스트 <span className="font-normal text-gray-400">(접근성·SEO용)</span>
              </label>
              <textarea
                id="mapImageAlt"
                name="mapImageAlt"
                rows={2}
                defaultValue={current.mapImageAlt}
                className={`${inputClass} resize-y`}
              />
            </div>
          </div>
        </div>
      </section>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state.saved && !state.error && (
        <p className="text-sm text-primary-dark font-semibold">저장했습니다. 사이트에 바로 반영됩니다.</p>
      )}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="px-6 py-2.5 rounded-lg bg-primary text-white font-bold hover:bg-primary-dark transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {pending ? '저장 중…' : '저장'}
        </button>
        <a
          href="/intro/location"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-gray-400 hover:text-primary transition-colors"
        >
          페이지 보기 ↗
        </a>
      </div>
    </form>
  )
}
