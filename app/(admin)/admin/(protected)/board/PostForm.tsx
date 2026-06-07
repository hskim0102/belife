'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import type { BoardPost } from '@/lib/types'
import type { FormState } from '../../actions'

type Action = (prev: FormState, formData: FormData) => Promise<FormState>

const categoryOptions = [
  { value: 'general', label: '일반' },
  { value: 'notice', label: '공지사항' },
  { value: 'faq', label: '자주 묻는 질문' },
]

export function PostForm({
  action,
  post,
  submitLabel,
}: {
  action: Action
  post?: BoardPost
  submitLabel: string
}) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(action, {})

  return (
    <form action={formAction} className="space-y-6">
      {post && <input type="hidden" name="id" value={post.id} />}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="category" className="block text-sm font-semibold text-gray-700 mb-1.5">
            분류
          </label>
          <select
            id="category"
            name="category"
            defaultValue={post?.category ?? 'general'}
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
          <label htmlFor="author" className="block text-sm font-semibold text-gray-700 mb-1.5">
            작성자
          </label>
          <input
            id="author"
            name="author"
            type="text"
            defaultValue={post?.author ?? '관리자'}
            maxLength={100}
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
        <label htmlFor="body" className="block text-sm font-semibold text-gray-700 mb-1.5">
          내용
        </label>
        <textarea
          id="body"
          name="body"
          required
          rows={14}
          defaultValue={post?.body ?? ''}
          className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors resize-y leading-relaxed"
        />
      </div>

      <div className="flex items-center gap-6">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            name="published"
            defaultChecked={post ? post.published : true}
            className="w-4 h-4 accent-primary"
          />
          <span className="text-sm font-semibold text-gray-700">공개</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            name="pinned"
            defaultChecked={post?.pinned ?? false}
            className="w-4 h-4 accent-primary"
          />
          <span className="text-sm font-semibold text-gray-700">상단 고정</span>
        </label>
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
          href="/admin/board"
          className="px-6 py-2.5 rounded-lg bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition-colors"
        >
          취소
        </Link>
      </div>
    </form>
  )
}
