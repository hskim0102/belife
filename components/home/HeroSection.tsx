// components/home/HeroSection.tsx
'use client'
import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useSwipe } from '@/lib/useSwipe'

export interface HeroSlideItem {
  src: string
  alt: string
}

// Used when no slides are configured in the database yet.
const fallbackSlides: HeroSlideItem[] = [
  { src: '/banner/1.jpg', alt: '아름다운생명사랑 활동 사진 1' },
  { src: '/banner/2.jpg', alt: '아름다운생명사랑 활동 사진 2' },
  { src: '/banner/3.jpg', alt: '아름다운생명사랑 활동 사진 3' },
]

export function HeroSection({ slides: slidesProp }: { slides?: HeroSlideItem[] }) {
  const slides = slidesProp && slidesProp.length > 0 ? slidesProp : fallbackSlides
  const count = slides.length
  const [current, setCurrent] = useState(0)
  const [paused, setPaused] = useState(false)

  const next = useCallback(
    () => setCurrent(c => (c + 1) % count),
    [count]
  )
  const prev = useCallback(
    () => setCurrent(c => (c - 1 + count) % count),
    [count]
  )
  // 태블릿·모바일 터치 스와이프로 슬라이드 이동
  const swipe = useSwipe(next, prev)

  // Keep the active index valid if the slide count changes.
  useEffect(() => {
    setCurrent(c => (c >= count ? 0 : c))
  }, [count])

  useEffect(() => {
    if (paused || count <= 1) return
    const id = setInterval(next, 5000)
    return () => clearInterval(id)
  }, [paused, next, count])

  return (
    <section
      className="relative overflow-hidden min-h-[520px] touch-pan-y"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      {...swipe}
    >
      {/* 슬라이드 트랙 */}
      <div
        data-testid="slide-track"
        className="flex min-h-[520px] transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {slides.map((slide, i) => (
          <div key={i} className="relative min-w-full min-h-[520px] flex-shrink-0">
            <Image
              src={slide.src}
              alt={slide.alt}
              fill
              className="object-cover"
              priority={i === 0}
              sizes="100vw"
            />
          </div>
        ))}
      </div>

      {/* 텍스트 가독성 그라디언트 */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/30 to-transparent pointer-events-none" />

      {/* 텍스트 오버레이 */}
      <div className="absolute inset-0 flex items-center">
        <div className="max-w-6xl mx-auto px-6 w-full">
          <div className="max-w-xl">
            <p className="flex items-center gap-2 text-[11px] font-bold text-primary-accent uppercase tracking-widest mb-4">
              <span className="inline-block w-5 h-0.5 bg-primary-accent" />
              창립 23주년 · 의료복지 비영리단체
            </p>
            <h1 className="text-5xl md:text-6xl font-black text-white leading-[1.1] mb-5 tracking-tight">
              존엄한 생명의<br />
              <em className="not-italic text-primary-accent">아름다움</em>을<br />
              꽃 피웁니다
            </h1>
            <p className="text-white/65 text-base leading-relaxed mb-8">
              저소득 어르신, 취약계층 어린이, 이주민,<br />
              그리고 해외 빈민까지 — 생명을 사랑하는 의료로 함께합니다.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/support">
                <span className="inline-block bg-white text-primary-darker font-bold px-8 py-3.5 rounded-lg text-base hover:bg-primary-light transition-colors cursor-pointer shadow-lg">
                  후원하기
                </span>
              </Link>
              <Link href="/programs">
                <span className="inline-block border border-white/40 text-white font-semibold px-8 py-3.5 rounded-lg text-base hover:bg-white/10 hover:border-white/60 transition-colors cursor-pointer">
                  활동 보기 →
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 이전 버튼 */}
      <button
        type="button"
        onClick={prev}
        aria-label="이전 슬라이드"
        className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/30 hover:bg-black/50 text-white flex items-center justify-center transition-colors"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* 다음 버튼 */}
      <button
        type="button"
        onClick={next}
        aria-label="다음 슬라이드"
        className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/30 hover:bg-black/50 text-white flex items-center justify-center transition-colors"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Dot 인디케이터 */}
      <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2 z-10">
        {slides.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setCurrent(i)}
            aria-label={`슬라이드 ${i + 1}`}
            aria-current={i === current ? 'true' : undefined}
            className={`h-1 rounded-full transition-all duration-300 ${
              i === current
                ? 'w-6 bg-white'
                : 'w-2 bg-white/50 hover:bg-white/75'
            }`}
          />
        ))}
      </div>
    </section>
  )
}
