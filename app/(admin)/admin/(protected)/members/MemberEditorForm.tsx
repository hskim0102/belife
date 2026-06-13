'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import type { Member } from '@/lib/types'
import type { FormState } from '../../actions'
import { MEMBER_GROUPS } from '@/lib/members'

type Action = (prev: FormState, formData: FormData) => Promise<FormState>

export function MemberEditorForm({
  action,
  member,
  submitLabel,
}: {
  action: Action
  member?: Member
  submitLabel: string
}) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(action, {})

  return (
    <form action={formAction} className="space-y-6">
      {member && <input type="hidden" name="id" value={member.id} />}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="group" className="block text-sm font-semibold text-gray-700 mb-1.5">
            구분
          </label>
          <select
            id="group"
            name="group"
            defaultValue={member?.group ?? MEMBER_GROUPS[0].key}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors bg-white"
          >
            {MEMBER_GROUPS.map(g => (
              <option key={g.key} value={g.key}>
                {g.label}
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
            defaultValue={member?.order ?? 0}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
          />
        </div>
      </div>

      <div>
        <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-1.5">
          이름
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          maxLength={100}
          defaultValue={member?.name ?? ''}
          className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
        />
      </div>

      <div>
        <label htmlFor="position" className="block text-sm font-semibold text-gray-700 mb-1.5">
          직책 <span className="font-normal text-gray-400">· 선택 (예: 이사장 / 가정의학과 전문의)</span>
        </label>
        <input
          id="position"
          name="position"
          type="text"
          maxLength={200}
          defaultValue={member?.position ?? ''}
          className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
        />
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
          href="/admin/members"
          className="px-6 py-2.5 rounded-lg bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition-colors"
        >
          취소
        </Link>
      </div>
    </form>
  )
}
