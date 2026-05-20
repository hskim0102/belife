'use client'
import Image from 'next/image'
import { useEffect, useState } from 'react'

const slides = [
  { src: '/welcom/1.jpg', alt: '아름다운생명사랑 활동 사진 1' },
  { src: '/welcom/2.jpg', alt: '아름다운생명사랑 활동 사진 2' },
  { src: '/welcom/3.jpg', alt: '아름다운생명사랑 활동 사진 3' },
  { src: '/welcom/4.jpg', alt: '아름다운생명사랑 활동 사진 4' },
  { src: '/welcom/5.jpg', alt: '아름다운생명사랑 활동 사진 5' },
]

const INTERVAL_MS = 4000

export function HeroSlideshow() {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (paused) return
    const id = setInterval(() => {
      setIndex(i => (i + 1) % slides.length)
    }, INTERVAL_MS)
    return () => clearInterval(id)
  }, [paused])

  return (
    <div
      className="relative aspect-[4/5] w-full max-w-md mx-auto rounded-3xl overflow-hidden shadow-2xl shadow-black/40 ring-1 ring-white/10"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      role="region"
      aria-label="활동 사진 슬라이드쇼"
    >
      {slides.map((slide, i) => (
        <Image
          key={slide.src}
          src={slide.src}
          alt={slide.alt}
          fill
          sizes="(max-width: 768px) 80vw, 400px"
          priority={i === 0}
          className={`object-cover transition-opacity duration-1000 ease-in-out ${i === index ? 'opacity-100' : 'opacity-0'}`}
        />
      ))}

      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />

      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {slides.map((slide, i) => (
          <button
            key={slide.src}
            type="button"
            onClick={() => setIndex(i)}
            aria-label={`슬라이드 ${i + 1}로 이동`}
            aria-current={i === index}
            className={`h-1.5 rounded-full transition-all ${i === index ? 'w-8 bg-white' : 'w-1.5 bg-white/50 hover:bg-white/80'}`}
          />
        ))}
      </div>
    </div>
  )
}
