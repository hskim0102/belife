'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { isAuthenticated } from '@/lib/auth'
import { updateThemeSettings } from '@/lib/repositories/theme'
import { clampBrightness, isThemeColor, isThemeKey, normalizeHex } from '@/lib/theme'

export interface ThemeFormState {
  error?: string
  saved?: boolean
}

export async function updateThemeAction(_prev: ThemeFormState, formData: FormData): Promise<ThemeFormState> {
  if (!(await isAuthenticated())) redirect('/admin/login')

  const raw = String(formData.get('theme') ?? '')
  if (!isThemeColor(raw)) return { error: '올바르지 않은 테마입니다.' }
  // 프리셋은 키 그대로, 직접 고른 색은 '#rrggbb' 로 통일해 저장한다.
  const color = isThemeKey(raw) ? raw : normalizeHex(raw)!

  const rawBrightness = Number(formData.get('brightness'))
  if (!Number.isFinite(rawBrightness)) return { error: '올바르지 않은 밝기 값입니다.' }

  await updateThemeSettings(color, clampBrightness(rawBrightness))
  // 테마는 루트 레이아웃에서 주입되므로 전체 레이아웃을 갱신한다.
  revalidatePath('/', 'layout')
  return { saved: true }
}
