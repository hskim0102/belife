'use client'

import { deleteHeroSlideAction } from '../../hero-actions'

export function SlideDeleteButton({ id }: { id: number }) {
  return (
    <form
      action={deleteHeroSlideAction}
      onSubmit={e => {
        if (!confirm('이 슬라이드를 삭제할까요? 되돌릴 수 없습니다.')) {
          e.preventDefault()
        }
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        className="px-3 py-1.5 rounded-lg text-sm font-semibold text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
      >
        삭제
      </button>
    </form>
  )
}
