'use client'
import { useEffect, useRef, useState } from 'react'

/**
 * 요소 상단이 뷰포트 상단 위로 밀려 올라간 거리(px)를 돌려주는 훅.
 *
 * 아직 화면 아래에 있으면 0이고, 위로 스크롤될수록 커진다.
 * 이 값에 계수를 곱해 transform/opacity에 쓰면 배경이 본문보다 느리게 흐르는
 * 패럴랙스가 된다. 스크롤 이벤트는 requestAnimationFrame으로 한 프레임에 한 번만 처리한다.
 * 애니메이션을 줄이도록 설정한 사용자에게는 항상 0을 유지해 효과를 끈다.
 */
export function useParallax<T extends HTMLElement>() {
  const ref = useRef<T | null>(null)
  const [offset, setOffset] = useState(0)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return

    let raf = 0
    const update = () => {
      raf = 0
      setOffset(Math.max(0, -el.getBoundingClientRect().top))
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])

  return { ref, offset }
}
