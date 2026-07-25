'use client'

import { useActionState } from 'react'
import type { MemberGroupItem } from '@/lib/repositories/memberGroups'
import type { FormState } from '../../../actions'
import {
  createMemberGroupAction,
  updateMemberGroupAction,
  deleteMemberGroupAction,
} from '../../../member-group-actions'

const inputClass =
  'px-4 py-2.5 rounded-lg border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors'

export function MemberGroupManager({ groups }: { groups: MemberGroupItem[] }) {
  const nextOrder = groups.length > 0 ? Math.max(...groups.map(g => g.order)) + 1 : 0

  return (
    <div className="space-y-8">
      <NewGroupForm nextOrder={nextOrder} />

      <div>
        <h2 className="text-sm font-bold text-gray-700 mb-3">
          등록된 구분 <span className="font-normal text-gray-400">· {groups.length}개</span>
        </h2>
        {groups.length === 0 ? (
          <p className="text-sm text-gray-400 py-8 text-center bg-white rounded-xl border border-gray-100">
            등록된 구분이 없습니다.
          </p>
        ) : (
          <ul className="space-y-2">
            {groups.map(group => (
              <GroupRow key={group.id} group={group} />
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

function NewGroupForm({ nextOrder }: { nextOrder: number }) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    createMemberGroupAction,
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
            placeholder="예: 후원회"
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

function GroupRow({ group }: { group: MemberGroupItem }) {
  const [editState, editAction, editPending] = useActionState<FormState, FormData>(
    updateMemberGroupAction,
    {},
  )
  const [deleteState, deleteAction, deletePending] = useActionState<FormState, FormData>(
    deleteMemberGroupAction,
    {},
  )
  const inUse = group.memberCount > 0

  return (
    <li className="bg-white rounded-xl border border-gray-100 p-4">
      <div className="flex flex-wrap items-center gap-3">
        <form action={editAction} className="flex flex-wrap items-center gap-3 flex-1 min-w-0">
          <input type="hidden" name="id" value={group.id} />
          <input
            name="label"
            type="text"
            required
            maxLength={30}
            defaultValue={group.label}
            aria-label={`${group.label} 구분 이름`}
            className={`${inputClass} flex-1 min-w-[10rem] font-semibold`}
          />
          <input
            name="order"
            type="number"
            defaultValue={group.order}
            aria-label={`${group.label} 정렬 순서`}
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
          멤버 {group.memberCount}명
        </span>

        <form
          action={deleteAction}
          onSubmit={e => {
            if (!confirm(`'${group.label}' 구분을 삭제할까요?`)) e.preventDefault()
          }}
        >
          <input type="hidden" name="id" value={group.id} />
          <button
            type="submit"
            disabled={deletePending || inUse}
            title={inUse ? '소속된 멤버가 있어 삭제할 수 없습니다' : '삭제'}
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
