'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import type { Post } from '@/lib/types'
import type { FormState } from '../../actions'
import { TiptapEditor } from '@/components/admin/TiptapEditor'
import { BOARD_CATEGORIES } from '@/lib/boardCategories'

type Action = (prev: FormState, formData: FormData) => Promise<FormState>

const categoryOptions = [
  { value: 'activity', label: '활동소식 (소식)' },
  ...BOARD_CATEGORIES.map(c => ({ value: c.key, label: c.label })),
]

export function PostEditorForm({
  action,
  post,
  submitLabel,
}: {
  action: Action
  post?: Post
  submitLabel: string
}) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(action, {})
  const today = new Date().toISOString().slice(0, 10)
  const defaultDate = post ? post.publishedAt.slice(0, 10) : today

  return (
    <form action={formAction} className="space-y-6">
      {post && <input type="hidden" name="id" value={post.id} />}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="category" className="block text-sm font-semibold text-gray-700 mb-1.5">
            게시판 분류
          </label>
          <select
            id="category"
            name="category"
            defaultValue={post?.category ?? 'notice'}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors bg-white"
          >
            {categoryOptions.map(o => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="publishedAt" className="block text-sm font-semibold text-gray-700 mb-1.5">
            발행일
          </label>
          <input
            id="publishedAt"
            name="publishedAt"
            type="date"
            defaultValue={defaultDate}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
          />
        </div>
      </div>

      <div>
        <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-1.5">
          제목
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          maxLength={255}
          defaultValue={post?.title ?? ''}
          className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
        />
      </div>

      <div>
        <label htmlFor="tags" className="block text-sm font-semibold text-gray-700 mb-1.5">
          분류 태그 <span className="font-normal text-gray-400">· 쉼표로 구분 (선택, 주로 활동소식)</span>
        </label>
        <input
          id="tags"
          name="tags"
          type="text"
          defaultValue={post?.tags.join(', ') ?? ''}
          placeholder="가정방문, 어린이"
          className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
          내용 <span className="font-normal text-gray-400">· 이미지 버튼으로 사진 첨부 (첫 이미지가 썸네일)</span>
        </label>
        <TiptapEditor name="body" defaultValue={post?.body ?? ''} />
      </div>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={pending}
          className="px-6 py-2.5 rounded-lg bg-primary text-white font-bold hover:bg-primary-dark transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {pending ? '저장 중…' : submitLabel}
        </button>
        <Link
          href="/admin/posts"
          className="px-6 py-2.5 rounded-lg bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition-colors"
        >
          취소
        </Link>
      </div>
    </form>
  )
}
