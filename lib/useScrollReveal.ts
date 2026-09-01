'use client'
import { useEffect, useRef, useState } from 'react'

export interface ScrollRevealOptions {
  /**
   * 뷰포트 아래쪽을 얼마나 좁혀서 볼지. 값이 클수록 요소가 더 위로 올라와야 등장한다.
   * IntersectionObserver의 rootMargin 하단 값으로 그대로 쓰인다.
   */
  rootMargin?: string
  /** false면 화면 밖으로 나갈 때 다시 숨겨져, 오르내릴 때마다 애니메이션이 반복된다. */
  once?: boolean
}

/**
 * 요소가 뷰포트에 들어오면 visible이 true가 되는 훅 (스크롤 등장 애니메이션용).
 *
 * IntersectionObserver가 없는 환경(테스트·구형 브라우저)에서는 즉시 보이는 것으로 처리해
 * 콘텐츠가 숨겨진 채 남지 않게 한다. 같은 이유로 애니메이션을 줄이도록 설정한
 * 사용자(prefers-reduced-motion)에게는 관찰 없이 바로 노출한다.
 */
export function useScrollReveal<T extends HTMLElement>({
  rootMargin = '0px 0px -12% 0px',
  once = true,
}: ScrollRevealOptions = {}) {
  const ref = useRef<T | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const reduced = !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    const noObserver = typeof IntersectionObserver === 'undefined'
    // 렌더링이 멈춘 탭(백그라운드 등)에서는 관찰자 콜백이 오지 않으므로,
    // 마운트 시점에 이미 화면 안이라면 직접 판정해 콘텐츠가 숨겨진 채 남지 않게 한다.
    const rect = el.getBoundingClientRect()
    const inViewport = rect.top < window.innerHeight && rect.bottom > 0

    if (reduced || noObserver || inViewport) {
      setVisible(true)
      if (reduced || noObserver || once) return
    }

    const io = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true)
            if (once) io.disconnect()
          } else if (!once) {
            setVisible(false)
          }
        }
      },
      { rootMargin, threshold: 0 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [rootMargin, once])

  return { ref, visible }
}
