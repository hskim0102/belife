'use client'
import type { ComponentPropsWithoutRef } from 'react'
import { cn } from '@/lib/cn'
import { useScrollReveal } from '@/lib/useScrollReveal'

/** 등장 방향/방식. 스타일은 globals.css의 .reveal-* 규칙에 정의되어 있다. */
export type RevealEffect = 'up' | 'down' | 'left' | 'right' | 'zoom' | 'blur'

export interface RevealProps extends ComponentPropsWithoutRef<'div'> {
  /** 등장 방식 (기본: 아래에서 위로) */
  effect?: RevealEffect
  /** 등장 지연(ms). 목록에서 index를 곱해 순차 등장(stagger)을 만든다. */
  delay?: number
}

/**
 * 뷰포트에 들어오면 부드럽게 나타나는 래퍼.
 *
 * 서버 컴포넌트를 children으로 받을 수 있어, 홈 섹션의 마크업을 그대로 감싸면 된다.
 * 애니메이션을 줄이도록 설정한 사용자에게는 CSS에서 효과를 끄고 즉시 노출한다.
 */
export function Reveal({
  children,
  effect = 'up',
  delay = 0,
  className,
  style,
  ...rest
}: RevealProps) {
  const { ref, visible } = useScrollReveal<HTMLDivElement>()

  return (
    <div
      ref={ref}
      className={cn('reveal', `reveal-${effect}`, visible && 'reveal-in', className)}
      style={delay ? { transitionDelay: `${delay}ms`, ...style } : style}
      {...rest}
    >
      {children}
    </div>
  )
}
