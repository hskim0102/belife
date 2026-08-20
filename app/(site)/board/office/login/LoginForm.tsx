'use client'

import { useActionState } from 'react'
import { officeLoginAction, type OfficeLoginState } from '../office-actions'

export function OfficeLoginForm({ next }: { next: string }) {
  const [state, formAction, pending] = useActionState<OfficeLoginState, FormData>(
    officeLoginAction,
    {},
  )

  return (
    <form action={formAction} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
      <input type="hidden" name="next" value={next} />
      <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-1.5">
        열람 비밀번호
      </label>
      <input
        id="password"
        name="password"
        type="password"
        required
        autoComplete="current-password"
        className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
      />
      {state.error && <p className="text-sm text-red-600 mt-3">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="mt-4 w-full px-6 py-3 rounded-lg bg-primary text-white font-bold hover:bg-primary-dark transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {pending ? '확인 중…' : '로그인'}
      </button>
    </form>
  )
}
