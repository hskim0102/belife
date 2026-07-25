'use client'

import { useActionState, useState, type CSSProperties } from 'react'
import { updateThemeAction, type ThemeFormState } from '../../theme-actions'
import { THEME_KEYS, THEMES, paletteToCssVars, type ThemeKey } from '@/lib/theme'
import { cn } from '@/lib/cn'

/** 테마 색상 선택 컴포넌트: 스와치 선택 → 미리보기 → 저장 */
export function ThemePickerForm({ current }: { current: ThemeKey }) {
  const [state, formAction, pending] = useActionState<ThemeFormState, FormData>(updateThemeAction, {})
  const [selected, setSelected] = useState<ThemeKey>(current)
  const preview = THEMES[selected]

  return (
    <form action={formAction} className="space-y-8">
      {/* 색상 선택 스와치 */}
      <fieldset>
        <legend className="block text-sm font-semibold text-gray-700 mb-3">색상 선택</legend>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {THEME_KEYS.map(key => {
            const theme = THEMES[key]
            const isSelected = selected === key
            return (
              <label
                key={key}
                className={cn(
                  'relative flex flex-col items-center gap-2 p-4 rounded-2xl border-2 cursor-pointer transition-all',
                  isSelected
                    ? 'border-gray-900 bg-white shadow-md'
                    : 'border-gray-200 bg-white hover:border-gray-400',
                )}
              >
                <input
                  type="radio"
                  name="theme"
                  value={key}
                  checked={isSelected}
                  onChange={() => setSelected(key)}
                  className="sr-only"
                />
                {/* 팔레트 미리보기 원 3개 */}
                <span className="flex -space-x-2">
                  <span
                    className="w-9 h-9 rounded-full border-2 border-white shadow-sm"
                    style={{ backgroundColor: theme.palette.primary }}
                  />
                  <span
                    className="w-9 h-9 rounded-full border-2 border-white shadow-sm"
                    style={{ backgroundColor: theme.palette.primaryAccent }}
                  />
                  <span
                    className="w-9 h-9 rounded-full border-2 border-white shadow-sm"
                    style={{ backgroundColor: theme.palette.primaryLighter }}
                  />
                </span>
                <span className="text-sm font-bold text-gray-900">{theme.label}</span>
                <span className="text-xs text-gray-400 text-center leading-snug">{theme.description}</span>
                {current === key && (
                  <span className="absolute top-2 right-2 text-[10px] font-bold text-white bg-gray-900 px-1.5 py-0.5 rounded-full">
                    사용 중
                  </span>
                )}
              </label>
            )
          })}
        </div>
      </fieldset>

      {/* 실시간 미리보기: 선택한 팔레트를 CSS 변수로 덮어쓴 샘플 UI */}
      <div>
        <p className="text-sm font-semibold text-gray-700 mb-3">미리보기</p>
        <div
          className="rounded-2xl border border-gray-200 overflow-hidden"
          style={paletteToCssVars(preview.palette) as CSSProperties}
        >
          <div className="bg-gradient-to-r from-primary-darker via-primary-dark to-primary-darker px-5 py-2 text-white/80 text-xs">
            상단바 · 02-6080-5798
          </div>
          <div className="bg-white px-5 py-4 flex items-center justify-between border-b-2 border-primary-darker">
            <span className="font-black text-gray-900">아름다운생명사랑</span>
            <span className="inline-block bg-gradient-to-br from-primary to-primary-dark text-white font-bold px-5 py-2 rounded-lg text-sm">
              후원하기
            </span>
          </div>
          <div className="bg-gradient-to-b from-primary-light to-primary-lighter px-5 py-6">
            <p className="text-xs font-black text-primary tracking-widest uppercase mb-2">Preview</p>
            <h3 className="text-xl font-black text-gray-900 mb-2">
              존엄한 생명의 <em className="not-italic text-primary-dark">아름다움</em>을 꽃 피웁니다
            </h3>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-block bg-gradient-to-br from-primary to-primary-dark text-white font-bold px-4 py-2 rounded-full text-sm">
                기본 버튼
              </span>
              <span className="inline-block border-2 border-primary text-primary font-bold px-4 py-2 rounded-full text-sm bg-white">
                외곽선 버튼
              </span>
              <span className="text-xs font-bold bg-primary-lighter text-primary-darker px-2.5 py-1 rounded-full">
                배지
              </span>
            </div>
          </div>
          <div className="bg-gradient-to-b from-primary-darker to-navy-footer px-5 py-3 text-white/75 text-xs">
            푸터 영역
          </div>
        </div>
      </div>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state.saved && !pending && (
        <p className="text-sm font-semibold text-primary-dark">저장되었습니다. 사이트에 바로 반영됩니다.</p>
      )}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending || selected === current}
          className="px-6 py-2.5 rounded-lg bg-primary text-white font-bold hover:bg-primary-dark transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {pending ? '저장 중…' : '테마 저장'}
        </button>
        <a
          href="/"
          target="_blank"
          className="px-6 py-2.5 rounded-lg bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition-colors"
        >
          사이트에서 확인 ↗
        </a>
      </div>
    </form>
  )
}
