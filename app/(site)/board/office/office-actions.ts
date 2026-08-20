'use server'

import { redirect } from 'next/navigation'
import { startOfficeSession, endOfficeSession, verifyOfficePassword } from '@/lib/auth'

export interface OfficeLoginState {
  error?: string
}

/** 사무국 게시판 열람 로그인. 비밀번호 하나로 문을 연다(회원 시스템 없음). */
export async function officeLoginAction(
  _prev: OfficeLoginState,
  formData: FormData,
): Promise<OfficeLoginState> {
  const password = String(formData.get('password') ?? '')
  if (!password || !verifyOfficePassword(password)) {
    return { error: '비밀번호가 올바르지 않습니다.' }
  }
  await startOfficeSession()

  // 로그인 후 돌아갈 곳. 열린 리다이렉트를 막기 위해 /board/office 하위 경로만 허용한다.
  const raw = String(formData.get('next') ?? '')
  const next = raw.startsWith('/board/office') && !raw.startsWith('//') ? raw : '/board/office'
  redirect(next)
}

export async function officeLogoutAction(): Promise<void> {
  await endOfficeSession()
  redirect('/board')
}
