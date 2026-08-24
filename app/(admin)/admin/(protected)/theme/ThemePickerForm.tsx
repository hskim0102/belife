'use client'

import { useActionState, useState, type CSSProperties } from 'react'
import { updateThemeAction, type ThemeFormState } from '../../theme-actions'
import {
  BRIGHTNESS_STEP,
  MAX_BRIGHTNESS,
  MIN_BRIGHTNESS,
  NEUTRAL_BRIGHTNESS,
  THEME_KEYS,
  THEMES,
  isThemeKey,
  paletteToCssVars,
  resolvePalette,
  type ThemeColor,
} from '@/lib/theme'
import { ColorPicker } from '@/components/admin/ColorPicker'
import { cn } from '@/lib/cn'

/** 색상 선택 카드 — 프리셋과 '직접 선택'이 같은 모양을 쓴다. */
function SwatchCard({
  value,
  colors,
  label,
  description,
  selected,
  inUse,
  onSelect,
}: {
  /** 라디오 값(프리셋 키 또는 'custom') */
  value: string
  /** 카드에 겹쳐 보여 줄 색 3개 */
  colors: [string, string, string]
  label: string
  description: string
  selected: boolean
  /** 지금 사이트에 적용돼 있는 선택지인지 */
  inUse: boolean
  onSelect: () => void
}) {
  return (
    <label
      className={cn(
        'relative flex flex-col items-center gap-2 p-4 rounded-2xl border-2 cursor-pointer transition-all',
        selected ? 'border-gray-900 bg-white shadow-md' : 'border-gray-200 bg-white hover:border-gray-400',
      )}
    >
      <input
        type="radio"
        name="theme-choice"
        value={value}
        checked={selected}
        onChange={onSelect}
        className="sr-only"
      />
      {/* 팔레트 미리보기 원 3개 (선택한 밝기 반영) */}
      <span className="flex -space-x-2">
        {colors.map((color, i) => (
          <span
            key={i}
            className="w-9 h-9 rounded-full border-2 border-white shadow-sm"
            style={{ backgroundColor: color }}
          />
        ))}
      </span>
      <span className="text-sm font-bold text-gray-900">{label}</span>
      <span className="text-xs text-gray-400 text-center leading-snug">{description}</span>
      {inUse && (
        <span className="absolute top-2 right-2 text-[10px] font-bold text-white bg-gray-900 px-1.5 py-0.5 rounded-full">
          사용 중
        </span>
      )}
    </label>
  )
}

/** 테마 색상 선택 컴포넌트: 색상 선택 + 밝기 슬라이더 → 미리보기 → 저장 */
export function ThemePickerForm({
  current,
  currentBrightness,
}: {
  current: ThemeColor
  currentBrightness: number
}) {
  const [state, formAction, pending] = useActionState<ThemeFormState, FormData>(updateThemeAction, {})
  const [selected, setSelected] = useState<ThemeColor>(current)
  const [brightness, setBrightness] = useState<number>(currentBrightness)
  const previewPalette = resolvePalette(selected, brightness)
  const unchanged = selected === current && brightness === currentBrightness
  // 슬라이더 트랙: 왼쪽(진하게)~오른쪽(연하게) 그라데이션
  const strong = resolvePalette(selected, MIN_BRIGHTNESS)
  const light = resolvePalette(selected, MAX_BRIGHTNESS)

  // '직접 선택' 카드가 들고 있는 색. 프리셋에 갔다 돌아와도 고른 색이 남아 있다.
  // (처음에는 지금 쓰는 테마의 대표색에서 출발한다)
  const [customHex, setCustomHex] = useState<string>(() =>
    isThemeKey(current) ? resolvePalette(current, NEUTRAL_BRIGHTNESS).primary : current,
  )
  const usingCustom = !isThemeKey(selected)
  const customSwatch = resolvePalette(customHex, brightness)
  // 흰 글씨가 읽히도록 명도를 좁혀 적용하므로, 고른 색과 실제 적용색이 다를 수 있다.
  const appliedPrimary = resolvePalette(selected, NEUTRAL_BRIGHTNESS).primary

  const pickCustom = (hex: string) => {
    setCustomHex(hex)
    setSelected(hex)
  }

  return (
    <form action={formAction} className="space-y-8">
      {/* 프리셋·직접 선택 어느 쪽이든 실제로 저장되는 값은 이 하나다. */}
      <input type="hidden" name="theme" value={selected} />

      {/* 색상 선택 카드 (프리셋 + 직접 선택) */}
      <fieldset>
        <legend className="block text-sm font-semibold text-gray-700 mb-3">색상 선택</legend>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {THEME_KEYS.map(key => {
            const swatch = resolvePalette(key, brightness)
            return (
              <SwatchCard
                key={key}
                value={key}
                colors={[swatch.primary, swatch.primaryAccent, swatch.primaryLighter]}
                label={THEMES[key].label}
                description={THEMES[key].description}
                selected={selected === key}
                inUse={current === key}
                onSelect={() => setSelected(key)}
              />
            )
          })}
          <SwatchCard
            value="custom"
            colors={[customSwatch.primary, customSwatch.primaryAccent, customSwatch.primaryLighter]}
            label="직접 선택"
            description="원하는 색을 직접 고릅니다"
            selected={usingCustom}
            inUse={!isThemeKey(current)}
            onSelect={() => setSelected(customHex)}
          />
        </div>

        {/* 직접 선택 카드를 고른 동안에만 색상 선택기를 편다 */}
        {usingCustom && (
          <div className="mt-4">
            <ColorPicker value={customHex} onChange={pickCustom} />
            <div className="max-w-md mt-3 flex items-start gap-2 text-xs text-gray-500">
              <span
                className="w-5 h-5 shrink-0 rounded-full border border-black/10"
                style={{ backgroundColor: appliedPrimary }}
                aria-hidden="true"
              />
              <p className="leading-relaxed">
                실제 적용되는 대표색은 <strong className="text-gray-700">{appliedPrimary}</strong> 입니다.
                버튼·푸터에는 흰 글씨가 얹히므로, 너무 밝거나 어두운 색은 글씨가 읽히는 범위로
                명도를 좁혀 적용합니다. 나머지 색(연한 배경·강조·푸터)은 이 색에서 자동으로 만듭니다.
              </p>
            </div>
          </div>
        )}
      </fieldset>

      {/* 밝기 슬라이더 */}
      <fieldset>
        <div className="flex items-center justify-between mb-3">
          <legend className="text-sm font-semibold text-gray-700">밝기</legend>
          <span className="text-xs font-bold text-gray-500 tabular-nums">{brightness}</span>
        </div>
        <div className="max-w-md">
          <input
            type="range"
            name="brightness"
            min={MIN_BRIGHTNESS}
            max={MAX_BRIGHTNESS}
            step={BRIGHTNESS_STEP}
            value={brightness}
            onChange={e => setBrightness(Number(e.target.value))}
            aria-label="밝기"
            className="w-full h-3 appearance-none rounded-full cursor-pointer accent-gray-900"
            style={{
              background: `linear-gradient(to right, ${strong.primary}, ${light.primary})`,
            }}
          />
          <div className="flex justify-between text-xs font-semibold text-gray-500 mt-2">
            <span>진하게</span>
            <span>연하게</span>
          </div>
        </div>
      </fieldset>

      {/* 실시간 미리보기: 선택한 팔레트를 CSS 변수로 덮어쓴 샘플 UI */}
      <div>
        <p className="text-sm font-semibold text-gray-700 mb-3">미리보기</p>
        <div
          className="rounded-2xl border border-gray-200 overflow-hidden"
          style={paletteToCssVars(previewPalette) as CSSProperties}
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
          disabled={pending || unchanged}
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
