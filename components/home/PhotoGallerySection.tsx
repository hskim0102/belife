'use client'
import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import type { Post } from '@/lib/types'
import { SectionLabel } from '@/components/ui/SectionLabel'
import { SectionDivider } from '@/components/ui/SectionDivider'
import { useSwipe } from '@/lib/useSwipe'

/** 한 화면에 보여줄 사진 수 (모바일에서는 2열 2줄로 접힌다) */
const PER_PAGE = 4
const AUTOPLAY_MS = 4500

function toPages<T>(items: T[], size: number): T[][] {
  const pages: T[][] = []
  for (let i = 0; i < items.length; i += size) pages.push(items.slice(i, i + size))
  return pages
}

export function PhotoGallerySection({ photos }: { photos: Post[] }) {
  const pages = toPages(photos, PER_PAGE)
  const count = pages.length
  const [current, setCurrent] = useState(0)
  const [paused, setPaused] = useState(false)

  const next = useCallback(() => setCurrent(c => (c + 1) % count), [count])
  const prev = useCallback(() => setCurrent(c => (c - 1 + count) % count), [count])
  // 태블릿·모바일 터치 스와이프로 페이지 이동
  const swipe = useSwipe(next, prev)

  // 사진 수가 바뀌어 페이지가 줄어들면 활성 인덱스를 되돌린다. (렌더 중 상태 조정 패턴)
  const [prevCount, setPrevCount] = useState(count)
  if (count !== prevCount) {
    setPrevCount(count)
    if (current >= count) setCurrent(0)
  }

  useEffect(() => {
    if (paused || count <= 1) return
    const id = setInterval(next, AUTOPLAY_MS)
    return () => clearInterval(id)
  }, [paused, next, count])

  if (count === 0) return null

  return (
    <section className="bg-gradient-to-b from-cream-deep to-cream pt-14 pb-24 px-6">
      <SectionDivider />

      <div className="max-w-6xl mx-auto mt-16">
        <div className="text-center mb-12">
          <SectionLabel>Photos</SectionLabel>
          <h2 className="text-4xl font-black mb-3 text-gray-900">사진 게시판</h2>
          <p className="text-text-subtle">현장에서 만난 순간들을 사진으로 전합니다</p>
        </div>

        <div
          className="relative"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <div className="overflow-hidden rounded-2xl touch-pan-y" {...swipe}>
            <div
              data-testid="photo-track"
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${current * 100}%)` }}
            >
              {pages.map((page, pageIndex) => (
                <div key={pageIndex} className="w-full shrink-0 grid grid-cols-2 md:grid-cols-4 gap-4">
                  {page.map(photo => (
                    <Link
                      key={photo.id}
                      href={`/board/photo/${photo.slug}`}
                      className="group relative aspect-square rounded-2xl overflow-hidden bg-primary-lighter shadow-sm"
                      // 화면 밖 페이지는 키보드 포커스 대상에서 제외한다.
                      tabIndex={pageIndex === current ? undefined : -1}
                      aria-hidden={pageIndex === current ? undefined : true}
                    >
                      {photo.thumbnail ? (
                        <Image
                          src={photo.thumbnail}
                          alt={photo.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          sizes="(min-width: 768px) 25vw, 50vw"
                          // 화면 밖 페이지는 lazy 로딩이 걸리지 않아, 슬라이드 시 빈 칸이 보인다.
                          loading="eager"
                        />
                      ) : (
                        <span className="absolute inset-0 flex items-center justify-center text-4xl">📸</span>
                      )}
                      <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-3 pt-8 pb-3">
                        <span className="block text-xs font-semibold text-white leading-snug line-clamp-2">
                          {photo.title}
                        </span>
                      </span>
                    </Link>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {count > 1 && (
            <>
              <button
                type="button"
                onClick={prev}
                aria-label="이전 사진"
                className="absolute -left-2 md:-left-5 top-1/2 -translate-y-1/2 z-10 w-9 h-9 md:w-11 md:h-11 rounded-full bg-white text-primary-dark shadow-md hover:bg-primary-light flex items-center justify-center transition-colors"
              >
                <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                type="button"
                onClick={next}
                aria-label="다음 사진"
                className="absolute -right-2 md:-right-5 top-1/2 -translate-y-1/2 z-10 w-9 h-9 md:w-11 md:h-11 rounded-full bg-white text-primary-dark shadow-md hover:bg-primary-light flex items-center justify-center transition-colors"
              >
                <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}
        </div>

        {count > 1 && (
          <div className="flex justify-center gap-2 mt-6">
            {pages.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setCurrent(i)}
                aria-label={`사진 ${i + 1}페이지`}
                aria-current={i === current ? 'true' : undefined}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === current ? 'w-7 bg-primary' : 'w-2.5 bg-primary-muted hover:bg-primary-accent'
                }`}
              />
            ))}
          </div>
        )}

        <div className="text-center mt-12">
          <Link
            href="/board/photo"
            className="inline-flex items-center gap-2 border-2 border-primary text-primary-dark font-bold text-base px-8 py-3 rounded-full hover:bg-primary-light transition-colors"
          >
            사진게시판 전체 보기 <span className="text-lg">→</span>
          </Link>
        </div>
      </div>
    </section>
  )
}
