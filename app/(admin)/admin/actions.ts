'use server'

import { redirect } from 'next/navigation'
import { verifyPassword, startSession, endSession } from '@/lib/auth'

export interface FormState {
  error?: string
}

// --- Auth ---------------------------------------------------------------

export async function loginAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const password = String(formData.get('password') ?? '')
  if (!password || !verifyPassword(password)) {
    return { error: '비밀번호가 올바르지 않습니다.' }
  }
  await startSession()
  redirect('/admin/posts')
}

export async function logoutAction(): Promise<void> {
  await endSession()
  redirect('/admin/login')
}
