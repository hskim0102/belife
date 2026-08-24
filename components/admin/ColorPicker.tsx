'use client'

import { useRef, useState } from 'react'
import { hexToHsv, hsvToHex, normalizeHex } from '@/lib/theme'

const clamp01 = (v: number) => Math.min(1, Math.max(0, v))

/**
 * 색상 선택기 — 채도·명도 사각형 + 색상(hue) 슬라이더 + hex 입력.
 *
 * 값은 항상 '#rrggbb' 로 올려 보낸다. 사각형 조작은 HSV 가 직관적이라
 * 내부 상태만 HSV 로 들고, 바깥과는 hex 로만 주고받는다.
 */
export function ColorPicker({
  value,
  onChange,
  label = '기본 색상',
}: {
  /** 현재 색(hex). 바깥에서 바뀌면 선택기도 따라간다. */
  value: string
  onChange: (hex: string) => void
  label?: string
}) {
  const [hsv, setHsv] = useState(() => hexToHsv(value))
  const [draft, setDraft] = useState(value)
  // 프리셋을 고르는 등 바깥에서 색이 바뀌면 사각형·입력칸을 그 색으로 맞춘다.
  const [syncedFrom, setSyncedFrom] = useState(value)
  if (value !== syncedFrom) {
    setSyncedFrom(value)
    setHsv(hexToHsv(value))
    setDraft(value)
  }

  const squareRef = useRef<HTMLDivElement>(null)

  const emit = (next: { h: number; s: number; v: number }) => {
    setHsv(next)
    const hex = hsvToHex(next.h, next.s, next.v)
    setDraft(hex)
    setSyncedFrom(hex)
    onChange(hex)
  }

  const pickFromPointer = (clientX: number, clientY: number) => {
    const box = squareRef.current?.getBoundingClientRect()
    if (!box) return
    emit({
      ...hsv,
      s: clamp01((clientX - box.left) / box.width) * 100,
      v: (1 - clamp01((clientY - box.top) / box.height)) * 100,
    })
  }

  const onSquareKeyDown = (e: React.KeyboardEvent) => {
    const step = e.shiftKey ? 10 : 2
    const move: Record<string, [number, number]> = {
      ArrowLeft: [-step, 0],
      ArrowRight: [step, 0],
      ArrowUp: [0, step],
      ArrowDown: [0, -step],
    }
    const delta = move[e.key]
    if (!delta) return
    e.preventDefault()
    emit({
      ...hsv,
      s: Math.min(100, Math.max(0, hsv.s + delta[0])),
      v: Math.min(100, Math.max(0, hsv.v + delta[1])),
    })
  }

  const handleHexInput = (next: string) => {
    setDraft(next)
    const hex = normalizeHex(next)
    if (!hex) return // 입력 중일 수 있으므로 형식이 맞을 때만 반영한다
    setHsv(hexToHsv(hex))
    setSyncedFrom(hex)
    onChange(hex)
  }

  const hex = normalizeHex(draft) ?? value

  return (
    <div className="max-w-md rounded-2xl border border-gray-200 bg-white p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-semibold text-gray-700">{label}</span>
        <span className="text-xs font-semibold text-gray-400">HEX</span>
      </div>

      {/* hex 입력 */}
      <div className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 mb-3 focus-within:border-gray-400 transition-colors">
        <span
          className="w-5 h-5 shrink-0 rounded-full border border-black/10"
          style={{ backgroundColor: hex }}
          aria-hidden="true"
        />
        <input
          type="text"
          value={draft}
          onChange={e => handleHexInput(e.target.value)}
          onBlur={() => setDraft(hex)}
          spellCheck={false}
          aria-label="색상 hex 값"
          className="flex-1 min-w-0 text-sm font-semibold text-gray-800 uppercase tracking-wide outline-none"
        />
      </div>

      {/* 채도(가로) · 명도(세로) 사각형 */}
      <div
        ref={squareRef}
        role="slider"
        tabIndex={0}
        aria-label="채도와 명도"
        aria-valuetext={`채도 ${Math.round(hsv.s)}%, 명도 ${Math.round(hsv.v)}%`}
        aria-valuenow={Math.round(hsv.s)}
        aria-valuemin={0}
        aria-valuemax={100}
        onKeyDown={onSquareKeyDown}
        onPointerDown={e => {
          e.currentTarget.setPointerCapture(e.pointerId)
          pickFromPointer(e.clientX, e.clientY)
        }}
        onPointerMove={e => {
          if (e.buttons === 1) pickFromPointer(e.clientX, e.clientY)
        }}
        className="relative h-44 rounded-lg cursor-crosshair touch-none outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2"
        style={{
          background: `linear-gradient(to top, #000, rgba(0,0,0,0)), linear-gradient(to right, #fff, hsl(${hsv.h} 100% 50%))`,
        }}
      >
        <span
          className="absolute w-4 h-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_0_0_1px_rgba(0,0,0,0.3)] pointer-events-none"
          style={{ left: `${hsv.s}%`, top: `${100 - hsv.v}%`, backgroundColor: hex }}
        />
      </div>

      {/* 색상(hue) 슬라이더 */}
      <input
        type="range"
        min={0}
        max={360}
        step={1}
        value={Math.round(hsv.h)}
        onChange={e => emit({ ...hsv, h: Number(e.target.value) })}
        aria-label="색상"
        className="w-full h-3 mt-4 appearance-none rounded-full cursor-pointer accent-gray-900"
        style={{
          background:
            'linear-gradient(to right, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%)',
        }}
      />
    </div>
  )
}
