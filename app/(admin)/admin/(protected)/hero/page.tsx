import type { Metadata } from 'next'
import { getAllHeroSlides } from '@/lib/repositories/heroSlides'
import { UploadForm } from './UploadForm'
import { SlideDeleteButton } from './SlideDeleteButton'
import { toggleHeroSlideAction, moveHeroSlideAction, updateHeroSlideTextAction } from '../../hero-actions'

export const metadata: Metadata = { title: '메인 배너 관리' }
export const dynamic = 'force-dynamic'

export default async function AdminHeroPage() {
  const slides = await getAllHeroSlides()
  const publishedCount = slides.filter(s => s.published).length

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-black text-gray-900">메인 배너 관리</h1>
        <p className="text-sm text-gray-400 mt-1">
          홈 화면 상단에서 롤링되는 이미지입니다. 공개된 슬라이드 {publishedCount}개가 순서대로 노출됩니다.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6 items-start">
        {/* Upload */}
        <div>
          <h2 className="text-sm font-bold text-gray-700 mb-2">새 슬라이드 추가</h2>
          <UploadForm />
        </div>

        {/* List */}
        <div>
          <h2 className="text-sm font-bold text-gray-700 mb-2">슬라이드 목록</h2>
          <div className="space-y-3">
            {slides.map((slide, i) => (
              <div
                key={slide.id}
                className="flex items-start gap-4 bg-white rounded-xl border border-gray-100 p-3"
              >
                {/* Thumbnail */}
                <div className="relative w-32 h-20 shrink-0 rounded-lg overflow-hidden bg-gray-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={slide.imageUrl} alt={slide.alt} className="w-full h-full object-cover" />
                  {!slide.published && (
                    <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                      <span className="text-xs font-bold text-gray-500">숨김</span>
                    </div>
                  )}
                </div>

                {/* Info + 문구 편집 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-400">#{i + 1}</span>
                    {slide.published ? (
                      <span className="text-xs font-semibold text-emerald-600">공개</span>
                    ) : (
                      <span className="text-xs font-semibold text-gray-400">비공개</span>
                    )}
                  </div>

                  <form action={updateHeroSlideTextAction} className="mt-2 space-y-2">
                    <input type="hidden" name="id" value={slide.id} />
                    <textarea
                      name="title"
                      rows={2}
                      defaultValue={slide.title ?? ''}
                      placeholder="메인 문구(제목) · 비우면 기본 문구 · 줄바꿈 가능"
                      aria-label={`슬라이드 ${i + 1} 메인 문구`}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors resize-y"
                    />
                    <textarea
                      name="subtitle"
                      rows={2}
                      defaultValue={slide.subtitle ?? ''}
                      placeholder="설명 문구(제목 아래 작은 글씨)"
                      aria-label={`슬라이드 ${i + 1} 설명 문구`}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors resize-y"
                    />
                    <div className="flex items-center gap-2">
                      <input
                        name="alt"
                        type="text"
                        maxLength={255}
                        defaultValue={slide.alt}
                        placeholder="대체 텍스트(접근성)"
                        aria-label={`슬라이드 ${i + 1} 대체 텍스트`}
                        className="flex-1 min-w-0 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                      />
                      <button
                        type="submit"
                        className="shrink-0 px-4 py-2 rounded-lg bg-primary text-white text-sm font-bold hover:bg-primary-dark transition-colors"
                      >
                        문구 저장
                      </button>
                    </div>
                  </form>
                </div>

                {/* Controls */}
                <div className="flex flex-col items-center gap-1 shrink-0">
                  {/* Move up */}
                  <form action={moveHeroSlideAction}>
                    <input type="hidden" name="id" value={slide.id} />
                    <input type="hidden" name="direction" value="up" />
                    <button
                      type="submit"
                      disabled={i === 0}
                      aria-label="위로"
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      ↑
                    </button>
                  </form>
                  {/* Move down */}
                  <form action={moveHeroSlideAction}>
                    <input type="hidden" name="id" value={slide.id} />
                    <input type="hidden" name="direction" value="down" />
                    <button
                      type="submit"
                      disabled={i === slides.length - 1}
                      aria-label="아래로"
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      ↓
                    </button>
                  </form>
                  {/* Toggle publish */}
                  <form action={toggleHeroSlideAction}>
                    <input type="hidden" name="id" value={slide.id} />
                    <input type="hidden" name="published" value={slide.published ? 'false' : 'true'} />
                    <button
                      type="submit"
                      className="px-3 py-1.5 rounded-lg text-sm font-semibold text-gray-500 hover:bg-gray-100 transition-colors"
                    >
                      {slide.published ? '숨기기' : '공개'}
                    </button>
                  </form>
                  <SlideDeleteButton id={slide.id} />
                </div>
              </div>
            ))}

            {slides.length === 0 && (
              <div className="bg-white rounded-xl border border-gray-100 px-4 py-16 text-center text-gray-400">
                등록된 슬라이드가 없습니다. 왼쪽에서 이미지를 추가해 주세요.
              </div>
            )}
          </div>

          <p className="mt-4 text-xs text-gray-400">
            슬라이드가 하나도 공개되지 않으면 홈 화면은 기본 배너 이미지를 표시합니다.
          </p>
        </div>
      </div>
    </div>
  )
}
