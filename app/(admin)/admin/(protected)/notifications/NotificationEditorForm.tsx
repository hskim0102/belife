'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import type { Notification } from '@/lib/types'
import type { FormState } from '../../actions'
import { TiptapEditor } from '@/components/admin/TiptapEditor'

type Action = (prev: FormState, formData: FormData) => Promise<FormState>

const TYPES = [
  { value: 'info', label: '정보', description: '일반 정보성 알림' },
  { value: 'success', label: '성공', description: '긍정적 메시지' },
  { value: 'warning', label: '경고', description: '주의가 필요한 내용' },
  { value: 'error', label: '오류', description: '오류나 문제' },
]

export function NotificationEditorForm({
  action,
  notification,
  submitLabel,
}: {
  action: Action
  notification?: Notification
  submitLabel: string
}) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(action, {})

  return (
    <form action={formAction} className="space-y-6">
      {notification && <input type="hidden" name="id" value={notification.id} />}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="type" className="block text-sm font-semibold text-gray-700 mb-1.5">
            알림 타입
          </label>
          <select
            id="type"
            name="type"
            defaultValue={notification?.type ?? 'info'}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors bg-white"
          >
            {TYPES.map(t => (
              <option key={t.value} value={t.value}>
                {t.label} - {t.description}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="order" className="block text-sm font-semibold text-gray-700 mb-1.5">
            정렬 순서 <span className="font-normal text-gray-400">· 작을수록 먼저 표시</span>
          </label>
          <input
            id="order"
            name="order"
            type="number"
            defaultValue={notification?.order ?? 0}
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
          maxLength={100}
          defaultValue={notification?.title ?? ''}
          className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          노출 빈도
        </label>
        <div className="space-y-2">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="radio"
              name="showFrequency"
              value="always"
              defaultChecked={notification?.showFrequency === 'always'}
              className="w-4 h-4 accent-primary"
            />
            <span className="text-sm text-gray-700">매번 보이기 (페이지 방문할 때마다)</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="radio"
              name="showFrequency"
              value="daily"
              defaultChecked={notification?.showFrequency !== 'always'}
              className="w-4 h-4 accent-primary"
            />
            <span className="text-sm text-gray-700">하루에 한 번 (같은 날 재방문 시 미표시)</span>
          </label>
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
          본문 내용 <span className="font-normal text-gray-400">· 선택 (이미지, 링크 가능)</span>
        </label>
        <TiptapEditor name="body" defaultValue={notification?.body ?? ''} />
      </div>

      <div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            name="enabled"
            defaultChecked={notification?.enabled ?? true}
            className="w-4 h-4 accent-primary"
          />
          <span className="text-sm font-semibold text-gray-700">활성화 (사이트에 표시)</span>
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
          href="/admin/notifications"
          className="px-6 py-2.5 rounded-lg bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition-colors"
        >
          취소
        </Link>
      </div>
    </form>
  )
}
