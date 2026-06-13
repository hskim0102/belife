'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import type { FormState } from '../../actions'
import type { MissionCard } from '@/lib/repositories/missionCards'

type Action = (prev: FormState, formData: FormData) => Promise<FormState>

const EMOJI_PRESETS = ['👴', '👧', '🌏', '🏠', '🕊️', '📚', '💪', '❤️', '🙏', '⭐']

export function MissionCardEditorForm({
  action,
  card,
  submitLabel,
}: {
  action: Action
  card?: MissionCard
  submitLabel: string
}) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(action, {})

  return (
    <form action={formAction} className="space-y-6">
      {card && <input type="hidden" name="id" value={card.id} />}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-1.5">
            제목
          </label>
          <input
            id="title"
            name="title"
            type="text"
            required
            maxLength={50}
            defaultValue={card?.title ?? ''}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
          />
        </div>

        <div>
          <label htmlFor="order" className="block text-sm font-semibold text-gray-700 mb-1.5">
            정렬 순서 <span className="font-normal text-gray-400">· 작을수록 위</span>
          </label>
          <input
            id="order"
            name="order"
            type="number"
            defaultValue={card?.order ?? 0}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          아이콘 (이모지)
        </label>
        <div className="space-y-2">
          <div className="flex flex-wrap gap-2">
            {EMOJI_PRESETS.map(emoji => (
              <button
                key={emoji}
                type="button"
                onClick={() => {
                  const input = document.getElementById('iconEmoji') as HTMLInputElement
                  if (input) input.value = emoji
                }}
                className={`w-12 h-12 rounded-lg border-2 text-2xl flex items-center justify-center transition-colors ${
                  card?.iconEmoji === emoji
                    ? 'border-primary bg-primary-light'
                    : 'border-gray-200 hover:border-primary'
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>
          <input
            id="iconEmoji"
            name="iconEmoji"
            type="text"
            required
            maxLength={2}
            defaultValue={card?.iconEmoji ?? '👴'}
            placeholder="이모지 입력"
            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
          />
        </div>
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-1.5">
          설명 (한 줄, 100자 이내)
        </label>
        <textarea
          id="description"
          name="description"
          required
          maxLength={100}
          rows={2}
          defaultValue={card?.description ?? ''}
          className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors resize-y"
        />
      </div>

      <div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            name="enabled"
            defaultChecked={card?.enabled ?? true}
            className="w-4 h-4 accent-primary"
          />
          <span className="text-sm font-semibold text-gray-700">활성화 (홈페이지에 표시)</span>
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
          href="/admin/mission-cards"
          className="px-6 py-2.5 rounded-lg bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition-colors"
        >
          취소
        </Link>
      </div>
    </form>
  )
}
