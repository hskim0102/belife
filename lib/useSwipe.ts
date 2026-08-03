import { useRef } from 'react'
import type { TouchEvent } from 'react'

export interface SwipeHandlers {
  onTouchStart: (e: TouchEvent) => void
  onTouchEnd: (e: TouchEvent) => void
}

/**
 * 좌/우 터치 스와이프 감지 훅 (태블릿·모바일).
 *
 * 손을 뗀 시점의 가로 이동이 세로 이동보다 크고 임계값(px)을 넘을 때만 콜백을 호출한다.
 * 기본 스크롤을 막지 않으므로 세로 스크롤과 충돌하지 않는다.
 * 왼쪽으로 밀면 onSwipeLeft(다음), 오른쪽으로 밀면 onSwipeRight(이전).
 */
export function useSwipe(
  onSwipeLeft: () => void,
  onSwipeRight: () => void,
  threshold = 50,
): SwipeHandlers {
  const start = useRef<{ x: number; y: number } | null>(null)

  return {
    onTouchStart: (e: TouchEvent) => {
      const t = e.touches[0]
      if (t) start.current = { x: t.clientX, y: t.clientY }
    },
    onTouchEnd: (e: TouchEvent) => {
      const s = start.current
      start.current = null
      const t = e.changedTouches[0]
      if (!s || !t) return
      const dx = t.clientX - s.x
      const dy = t.clientY - s.y
      // 가로 이동이 세로보다 크고 임계값을 넘어야 스와이프로 인정(세로 스크롤 보호).
      if (Math.abs(dx) < threshold || Math.abs(dx) <= Math.abs(dy)) return
      if (dx < 0) onSwipeLeft()
      else onSwipeRight()
    },
  }
}
