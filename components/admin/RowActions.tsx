'use client'

import Link from 'next/link'
import { deletePostAction } from '@/app/(admin)/admin/post-actions'

/** 관리 목록 행의 보기/수정/삭제 아이콘 액션. 소식·게시판 글 목록에서 공유. */
export function RowActions({
  id,
  title,
  viewHref,
  editHref,
}: {
  id: number
  title: string
  viewHref: string
  editHref: string
}) {
  const base =
    'inline-flex items-center justify-center w-8 h-8 rounded-lg transition-colors'

  return (
    <div className="flex items-center justify-end gap-1">
      <Link
        href={viewHref}
        target="_blank"
        title="보기"
        aria-label="보기"
        className={`${base} text-gray-400 hover:text-gray-700 hover:bg-gray-100`}
      >
        <EyeIcon />
      </Link>
      <Link
        href={editHref}
        title="수정"
        aria-label="수정"
        className={`${base} text-gray-400 hover:text-primary hover:bg-primary-light/60`}
      >
        <PencilIcon />
      </Link>
      <form
        action={deletePostAction}
        onSubmit={e => {
          if (!confirm(`'${title}' 게시물을 삭제할까요? 되돌릴 수 없습니다.`)) {
            e.preventDefault()
          }
        }}
      >
        <input type="hidden" name="id" value={id} />
        <button
          type="submit"
          title="삭제"
          aria-label="삭제"
          className={`${base} text-gray-400 hover:text-red-600 hover:bg-red-50`}
        >
          <TrashIcon />
        </button>
      </form>
    </div>
  )
}

function EyeIcon() {
  return (
    <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" strokeWidth={1.7} stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    </svg>
  )
}

function PencilIcon() {
  return (
    <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" strokeWidth={1.7} stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125" />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" strokeWidth={1.7} stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
    </svg>
  )
}
