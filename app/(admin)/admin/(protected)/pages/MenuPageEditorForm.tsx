'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import type { MenuPage } from '@/lib/types'
import type { FormState } from '../../actions'
import { MENUS } from '@/lib/menus'
import { TiptapEditor } from '@/components/admin/TiptapEditor'

type Action = (prev: FormState, formData: FormData) => Promise<FormState>

export function MenuPageEditorForm({
  action,
  page,
  submitLabel,
}: {
  action: Action
  page?: MenuPage
  submitLabel: string
}) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(action, {})
  // 메뉴 대표 페이지(예: 기관 소개)는 경로가 고정이라 메뉴를 옮길 수 없다.
  const menuLocked = !!page && page.slug === page.menu

  return (
    <form action={formAction} className="space-y-6">
      {page && <input type="hidden" name="id" value={page.id} />}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label htmlFor="menu" className="block text-sm font-semibold text-gray-700 mb-1.5">
            상위 메뉴
          </label>
          {menuLocked ? (
            <>
              <input type="hidden" name="menu" value={page!.menu} />
              <div className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-gray-700">
                {MENUS.find(m => m.key === page!.menu)?.label}
              </div>
            </>
          ) : (
            <select
              id="menu"
              name="menu"
              defaultValue={page?.menu ?? MENUS[0].key}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors bg-white"
            >
              {MENUS.map(m => (
                <option key={m.key} value={m.key}>
                  {m.label}
                </option>
              ))}
            </select>
          )}
        </div>

        <div>
          <label htmlFor="order" className="block text-sm font-semibold text-gray-700 mb-1.5">
            정렬 순서 <span className="font-normal text-gray-400">· 작을수록 위</span>
          </label>
          <input
            id="order"
            name="order"
            type="number"
            defaultValue={page?.order ?? 0}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
          />
        </div>

        <div>
          <span className="block text-sm font-semibold text-gray-700 mb-1.5">노출</span>
          <label className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-gray-200 cursor-pointer">
            <input
              type="checkbox"
              name="published"
              defaultChecked={page?.published ?? true}
              className="w-4 h-4 accent-primary"
            />
            <span className="text-sm text-gray-700">메뉴에 노출</span>
          </label>
        </div>
      </div>

      <div>
        <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-1.5">
          메뉴명(제목) <span className="font-normal text-gray-400">· 네비게이션과 페이지 상단에 표시</span>
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          maxLength={100}
          defaultValue={page?.title ?? ''}
          className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
          내용 <span className="font-normal text-gray-400">· 이미지 버튼으로 사진 첨부</span>
        </label>
        <TiptapEditor name="body" defaultValue={page?.body ?? ''} />
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
          href="/admin/pages"
          className="px-6 py-2.5 rounded-lg bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition-colors"
        >
          취소
        </Link>
      </div>
    </form>
  )
}
