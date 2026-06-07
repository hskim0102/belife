'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import type { Post } from '@/lib/types'
import type { FormState } from '../../actions'
import { TiptapEditor } from '@/components/admin/TiptapEditor'

type Action = (prev: FormState, formData: FormData) => Promise<FormState>

export interface CategoryOption {
  value: string
  label: string
}

export function PostEditorForm({
  action,
  post,
  submitLabel,
  categoryOptions,
  cancelHref = '/admin/posts',
  categoryLabel = '게시판 분류',
  tagOptions,
}: {
  action: Action
  post?: Post
  submitLabel: string
  categoryOptions: CategoryOption[]
  cancelHref?: string
  categoryLabel?: string
  /** 지정 시 분류를 자유입력 대신 단일 select 로 선택(소식 분류용). */
  tagOptions?: readonly string[]
}) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(action, {})
  const today = new Date().toISOString().slice(0, 10)
  const defaultDate = post ? post.publishedAt.slice(0, 10) : today
  const single = categoryOptions.length === 1

  // 분류 select 옵션: 기본 목록 + (수정 중인 글의 기존 분류가 목록에 없으면 보존)
  const currentTag = post?.tags[0] ?? ''
  const tagSelectOptions = tagOptions
    ? currentTag && !tagOptions.includes(currentTag)
      ? [...tagOptions, currentTag]
      : tagOptions
    : null

  return (
    <form action={formAction} className="space-y-6">
      {post && <input type="hidden" name="id" value={post.id} />}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="category" className="block text-sm font-semibold text-gray-700 mb-1.5">
            {categoryLabel}
          </label>
          {single ? (
            <>
              <input type="hidden" name="category" value={categoryOptions[0].value} />
              <div className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-gray-700">
                {categoryOptions[0].label}
              </div>
            </>
          ) : (
            <select
              id="category"
              name="category"
              defaultValue={post?.category ?? categoryOptions[0]?.value}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors bg-white"
            >
              {categoryOptions.map(o => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          )}
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
          분류{' '}
          <span className="font-normal text-gray-400">
            {tagSelectOptions ? '· 카테고리 선택' : '· 쉼표로 구분 (선택)'}
          </span>
        </label>
        {tagSelectOptions ? (
          <select
            id="tags"
            name="tags"
            defaultValue={currentTag}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors bg-white"
          >
            <option value="">(분류 없음)</option>
            {tagSelectOptions.map(t => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        ) : (
          <input
            id="tags"
            name="tags"
            type="text"
            defaultValue={post?.tags.join(', ') ?? ''}
            placeholder="가정방문, 어린이"
            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
          />
        )}
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
          href={cancelHref}
          className="px-6 py-2.5 rounded-lg bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition-colors"
        >
          취소
        </Link>
      </div>
    </form>
  )
}
