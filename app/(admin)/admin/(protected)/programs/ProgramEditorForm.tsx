'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import type { Program } from '@/lib/types'
import type { FormState } from '../../actions'
import { TiptapEditor } from '@/components/admin/TiptapEditor'

type Action = (prev: FormState, formData: FormData) => Promise<FormState>

const CATEGORIES = [
  { value: 'domestic', label: '국내 사업' },
  { value: 'overseas', label: '해외 사업' },
  { value: 'education', label: '교육·연구 사업' },
]

export function ProgramEditorForm({
  action,
  program,
  submitLabel,
}: {
  action: Action
  program?: Program
  submitLabel: string
}) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(action, {})

  return (
    <form action={formAction} className="space-y-6">
      {program && <input type="hidden" name="id" value={program.id} />}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="category" className="block text-sm font-semibold text-gray-700 mb-1.5">
            분류
          </label>
          <select
            id="category"
            name="category"
            defaultValue={program?.category ?? 'domestic'}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors bg-white"
          >
            {CATEGORIES.map(c => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="order" className="block text-sm font-semibold text-gray-700 mb-1.5">
            정렬 순서 <span className="font-normal text-gray-400">· 작을수록 위</span>
          </label>
          <input
            id="order"
            name="order"
            type="number"
            defaultValue={program?.order ?? 0}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
          />
        </div>
      </div>

      <div>
        <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-1.5">
          사업명
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          maxLength={100}
          defaultValue={program?.name ?? ''}
          className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-1.5">
          사업 설명 <span className="font-normal text-gray-400">· 목록/상세에 표시 (300자 이내)</span>
        </label>
        <textarea
          id="description"
          name="description"
          required
          maxLength={300}
          rows={3}
          defaultValue={program?.description ?? ''}
          className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors resize-y"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
          상세 내용 <span className="font-normal text-gray-400">· 이미지 버튼으로 사진 첨부 (첫 이미지가 썸네일)</span>
        </label>
        <TiptapEditor name="body" defaultValue={program?.body ?? ''} />
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
          href="/admin/programs"
          className="px-6 py-2.5 rounded-lg bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition-colors"
        >
          취소
        </Link>
      </div>
    </form>
  )
}
