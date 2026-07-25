import { ReactNode } from 'react'
import { SectionLabel } from './SectionLabel'

/**
 * 각 페이지 상단의 배너(hero) 영역.
 * 초록 그라데이션 위에 은은한 광원과 도트 패턴, 그리고 페이지별 장식 아이콘을 얹어
 * 밋밋하지 않게 표현한다.
 */
export function PageHero({
  label,
  title,
  subtitle,
  icon,
  maxWidth = 'max-w-6xl',
  children,
}: {
  label?: string
  title?: ReactNode
  subtitle?: ReactNode
  /** 우측에 크게 흐리게 깔리는 장식 아이콘(이모지 또는 노드) */
  icon?: ReactNode
  /** 내부 콘텐츠 컨테이너 폭 (페이지별로 본문 폭에 맞춘다) */
  maxWidth?: string
  children?: ReactNode
}) {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-primary-darker via-primary-dark to-primary-darker">
      {/* 장식 배경 */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        {/* 부드러운 광원 */}
        <div className="absolute -top-24 right-[8%] w-80 h-80 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-32 -left-16 w-[28rem] h-[28rem] rounded-full bg-primary/40 blur-3xl" />
        {/* 도트 패턴 */}
        <div
          className="absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
            backgroundSize: '22px 22px',
          }}
        />
        {/* 하단 페이드 */}
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/15 to-transparent" />
        {/* 페이지별 장식 아이콘 */}
        {icon && (
          <div className="absolute right-6 md:right-12 top-1/2 -translate-y-1/2 text-white/10 text-[9rem] md:text-[13rem] leading-none select-none">
            {icon}
          </div>
        )}
      </div>

      <div className={`relative ${maxWidth} mx-auto px-6 py-16`}>
        {label && <SectionLabel>{label}</SectionLabel>}
        {title && (
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">{title}</h1>
        )}
        {subtitle && (
          <p className="mt-4 max-w-2xl text-base md:text-lg text-white/75 leading-relaxed">{subtitle}</p>
        )}
        {children}
      </div>
    </div>
  )
}
