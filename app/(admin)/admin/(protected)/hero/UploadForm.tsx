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
