'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { isAuthenticated } from '@/lib/auth'
import { updateThemeSettings } from '@/lib/repositories/theme'
import { clampBrightness, isThemeKey } from '@/lib/theme'

export interface ThemeFormState {
  error?: string
  saved?: boolean
}

export async function updateThemeAction(_prev: ThemeFormState, formData: FormData): Promise<ThemeFormState> {
  if (!(await isAuthenticated())) redirect('/admin/login')

  const key = String(formData.get('theme') ?? '')
  if (!isThemeKey(key)) return { error: '올바르지 않은 테마입니다.' }

  const rawBrightness = Number(formData.get('brightness'))
  if (!Number.isFinite(rawBrightness)) return { error: '올바르지 않은 밝기 값입니다.' }

  await updateThemeSettings(key, clampBrightness(rawBrightness))
  // 테마는 루트 레이아웃에서 주입되므로 전체 레이아웃을 갱신한다.
  revalidatePath('/', 'layout')
  return { saved: true }
}
