'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import type { Milestone } from '@/lib/types'
import type { FormState } from '../../actions'

type Action = (prev: FormState, formData: FormData) => Promise<FormState>

export function MilestoneEditorForm({
  action,
  milestone,
  submitLabel,
}: {
  action: Action
  milestone?: Milestone
  submitLabel: string
}) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(action, {})
  const currentYear = new Date().getFullYear()

  return (
    <form action={formAction} className="space-y-6">
      {milestone && <input type="hidden" name="id" value={milestone.id} />}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="year" className="block text-sm font-semibold text-gray-700 mb-1.5">
            연도
          </label>
          <input
            id="year"
            name="year"
            type="number"
            required
            min={1900}
            max={2200}
            defaultValue={milestone?.year ?? currentYear}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
          />
        </div>

        <div>
          <label htmlFor="month" className="block text-sm font-semibold text-gray-700 mb-1.5">
            월
          </label>
          <select
            id="month"
            name="month"
            defaultValue={milestone?.month ?? 1}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors bg-white"
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
              <option key={m} value={m}>
                {m}월
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="content" className="block text-sm font-semibold text-gray-700 mb-1.5">
          내용
        </label>
        <textarea
          id="content"
          name="content"
          required
          maxLength={500}
          rows={3}
          defaultValue={milestone?.content ?? ''}
          className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors resize-y"
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
          href="/admin/milestones"
          className="px-6 py-2.5 rounded-lg bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition-colors"
        >
          취소
        </Link>
      </div>
    </form>
  )
}
