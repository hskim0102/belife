'use client'

import { useActionState } from 'react'
import { loginAction, type FormState } from '../actions'

const initialState: FormState = {}

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, initialState)

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-1.5">
          비밀번호
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          autoFocus
          required
          className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
        />
      </div>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="w-full py-2.5 rounded-lg bg-primary text-white font-bold hover:bg-primary-dark transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {pending ? '확인 중…' : '로그인'}
      </button>
    </form>
  )
}
