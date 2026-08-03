'use client'

import { useActionState, useRef, useState } from 'react'
import { uploadHeroSlideAction } from '../../hero-actions'
import type { FormState } from '../../actions'

export function UploadForm() {
  const [state, formAction, pending] = useActionState<FormState, FormData>(uploadHeroSlideAction, {})
  const [fileName, setFileName] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <form action={formAction} className="bg-white rounded-xl border border-gray-100 p-5 space-y-4">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">이미지 파일</label>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 text-sm font-semibold hover:bg-gray-200 transition-colors"
          >
            파일 선택
          </button>
          <span className="text-sm text-gray-400 truncate">{fileName || '선택된 파일 없음'}</span>
        </div>
        <input
          ref={inputRef}
          type="file"
          name="image"
          accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
          required
          className="hidden"
          onChange={e => setFileName(e.target.files?.[0]?.name ?? '')}
        />
        <p className="mt-1.5 text-xs text-gray-400">JPG·PNG·WEBP·AVIF·GIF, 최대 8MB. 권장 비율 가로형(약 1920×1040).</p>
      </div>

      <div>
        <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-1.5">
          메인 문구 <span className="font-normal text-gray-400">(이 사진 위에 크게 표시, 선택 · 줄바꿈 가능)</span>
        </label>
        <textarea
          id="title"
          name="title"
          rows={3}
          placeholder={'예:\n존엄한 생명의\n아름다움을\n꽃 피웁니다'}
          className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors resize-y"
        />
      </div>

      <div>
        <label htmlFor="subtitle" className="block text-sm font-semibold text-gray-700 mb-1.5">
          설명 문구 <span className="font-normal text-gray-400">(제목 아래 작은 글씨, 선택)</span>
        </label>
        <textarea
          id="subtitle"
          name="subtitle"
          rows={2}
          placeholder="예: 저소득 어르신, 취약계층 어린이와 함께합니다."
          className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors resize-y"
        />
      </div>

      <div>
        <label htmlFor="alt" className="block text-sm font-semibold text-gray-700 mb-1.5">
          대체 텍스트 <span className="font-normal text-gray-400">(접근성·SEO용, 선택)</span>
        </label>
        <input
          id="alt"
          name="alt"
          type="text"
          maxLength={255}
          placeholder="예: 2026년 필리핀 의료봉사 현장"
          className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
        />
      </div>

      <p className="text-xs text-gray-400">문구를 비워 두면 홈 화면은 기본 문구를 표시합니다.</p>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="px-6 py-2.5 rounded-lg bg-primary text-white font-bold hover:bg-primary-dark transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {pending ? '업로드 중…' : '슬라이드 추가'}
      </button>
    </form>
  )
}
