'use client'

import { useActionState } from 'react'
import type { NewsCategoryItem } from '@/lib/repositories/newsCategories'
import type { FormState } from '../../../actions'
import {
  createNewsCategoryAction,
  updateNewsCategoryAction,
  deleteNewsCategoryAction,
} from '../../../news-category-actions'

const inputClass =
  'px-4 py-2.5 rounded-lg border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors'

export function NewsCategoryManager({ categories }: { categories: NewsCategoryItem[] }) {
  const nextOrder = categories.length > 0 ? Math.max(...categories.map(c => c.order)) + 1 : 0

  return (
    <div className="space-y-8">
      <NewCategoryForm nextOrder={nextOrder} />

      <div>
        <h2 className="text-sm font-bold text-gray-700 mb-3">
          등록된 구분 <span className="font-normal text-gray-400">· {categories.length}개</span>
        </h2>
        {categories.length === 0 ? (
          <p className="text-sm text-gray-400 py-8 text-center bg-white rounded-xl border border-gray-100">
            등록된 구분이 없습니다.
          </p>
        ) : (
          <ul className="space-y-2">
            {categories.map(category => (
              <CategoryRow key={category.id} category={category} />
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

function NewCategoryForm({ nextOrder }: { nextOrder: number }) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    createNewsCategoryAction,
    {},
  )

  return (
    <form action={formAction} className="bg-white rounded-xl border border-gray-100 p-5">
      <h2 className="text-sm font-bold text-gray-700 mb-3">구분 추가</h2>
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex-1 min-w-[12rem]">
          <label htmlFor="new-label" className="block text-xs font-semibold text-gray-500 mb-1.5">
            구분 이름
          </label>
          <input
            id="new-label"
            name="label"
            type="text"
            required
            maxLength={30}
            placeholder="예: 캠페인"
            className={`${inputClass} w-full`}
          />
        </div>
        <div className="w-28">
          <label htmlFor="new-order" className="block text-xs font-semibold text-gray-500 mb-1.5">
            정렬 순서
          </label>
          <input
            id="new-order"
            name="order"
            type="number"
            defaultValue={nextOrder}
            className={`${inputClass} w-full`}
          />
        </div>
        <button
          type="submit"
          disabled={pending}
          className="px-6 py-2.5 rounded-lg bg-primary text-white font-bold hover:bg-primary-dark transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {pending ? '추가 중…' : '추가'}
        </button>
      </div>
      {state.error && <p className="text-sm text-red-600 mt-3">{state.error}</p>}
    </form>
  )
}

function CategoryRow({ category }: { category: NewsCategoryItem }) {
  const [editState, editAction, editPending] = useActionState<FormState, FormData>(
    updateNewsCategoryAction,
    {},
  )
  const [deleteState, deleteAction, deletePending] = useActionState<FormState, FormData>(
    deleteNewsCategoryAction,
    {},
  )
  const inUse = category.postCount > 0

  return (
    <li className="bg-white rounded-xl border border-gray-100 p-4">
      <div className="flex flex-wrap items-center gap-3">
        <form action={editAction} className="flex flex-wrap items-center gap-3 flex-1 min-w-0">
          <input type="hidden" name="id" value={category.id} />
          <input
            name="label"
            type="text"
            required
            maxLength={30}
            defaultValue={category.label}
            aria-label={`${category.label} 구분 이름`}
            className={`${inputClass} flex-1 min-w-[10rem] font-semibold`}
          />
          <input
            name="order"
            type="number"
            defaultValue={category.order}
            aria-label={`${category.label} 정렬 순서`}
            className={`${inputClass} w-24`}
          />
          <button
            type="submit"
            disabled={editPending}
            className="px-4 py-2.5 rounded-lg bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition-colors disabled:opacity-60"
          >
            {editPending ? '저장 중…' : '저장'}
          </button>
        </form>

        <span
          className={`text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${
            inUse ? 'bg-primary-light text-primary-dark' : 'bg-gray-100 text-gray-400'
          }`}
        >
          소식 {category.postCount}개
        </span>

        <form
          action={deleteAction}
          onSubmit={e => {
            if (!confirm(`'${category.label}' 구분을 삭제할까요?`)) e.preventDefault()
          }}
        >
          <input type="hidden" name="id" value={category.id} />
          <button
            type="submit"
            disabled={deletePending || inUse}
            title={inUse ? '이 구분이 붙은 소식이 있어 삭제할 수 없습니다' : '삭제'}
            className="px-4 py-2.5 rounded-lg text-red-600 font-semibold hover:bg-red-50 transition-colors disabled:text-gray-300 disabled:hover:bg-transparent disabled:cursor-not-allowed"
          >
            삭제
          </button>
        </form>
      </div>

      {(editState.error || deleteState.error) && (
        <p className="text-sm text-red-600 mt-3">{editState.error ?? deleteState.error}</p>
      )}
    </li>
  )
}
