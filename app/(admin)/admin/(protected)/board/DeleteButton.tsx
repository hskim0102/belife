'use client'

import { deleteBoardPostAction } from '../../actions'

export function DeleteButton({ id, title }: { id: number; title: string }) {
  return (
    <form
      action={deleteBoardPostAction}
      onSubmit={e => {
        if (!confirm(`'${title}' 게시물을 삭제할까요? 되돌릴 수 없습니다.`)) {
          e.preventDefault()
        }
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button type="submit" className="text-sm text-gray-400 hover:text-red-600 font-semibold transition-colors">
        삭제
      </button>
    </form>
  )
}
