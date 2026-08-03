'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { isAuthenticated } from '@/lib/auth'
import {
  createNewsCategory,
  updateNewsCategory,
  deleteNewsCategory,
  getNewsCategoryById,
  countPostsInNewsCategory,
} from '@/lib/repositories/newsCategories'
import type { FormState } from './actions'

async function requireAuth(): Promise<void> {
  if (!(await isAuthenticated())) redirect('/admin/login')
}

function refresh(): void {
  revalidatePath('/admin/news')
  revalidatePath('/admin/news/categories')
  revalidatePath('/news')
}

function parseLabel(formData: FormData): string | { error: string } {
  const label = String(formData.get('label') ?? '').trim()
  if (!label) return { error: '구분 이름을 입력해 주세요.' }
  if (label.length > 30) return { error: '구분 이름은 30자 이내로 입력해 주세요.' }
  return label
}

function parseOrder(formData: FormData): number {
  const raw = Number(formData.get('order'))
  return Number.isFinite(raw) ? Math.trunc(raw) : 0
}

/** 라벨 UNIQUE 위반(23505) 시 안내 메시지로 변환한다. */
function isDuplicateLabel(err: unknown): boolean {
  return typeof err === 'object' && err !== null && (err as { code?: string }).code === '23505'
}

export async function createNewsCategoryAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAuth()
  const label = parseLabel(formData)
  if (typeof label !== 'string') return label

  try {
    await createNewsCategory(label, parseOrder(formData))
  } catch (err) {
    if (isDuplicateLabel(err)) return { error: `'${label}' 구분이 이미 있습니다.` }
    throw err
  }
  refresh()
  redirect('/admin/news/categories')
}

export async function updateNewsCategoryAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAuth()
  const id = Number(formData.get('id'))
  if (!Number.isInteger(id) || id <= 0) return { error: '잘못된 항목입니다.' }

  const label = parseLabel(formData)
  if (typeof label !== 'string') return label

  let updated
  try {
    updated = await updateNewsCategory(id, label, parseOrder(formData))
  } catch (err) {
    if (isDuplicateLabel(err)) return { error: `'${label}' 구분이 이미 있습니다.` }
    throw err
  }
  if (!updated) return { error: '존재하지 않는 구분입니다.' }

  refresh()
  redirect('/admin/news/categories')
}

/**
 * 이 구분이 붙은 소식이 있으면 삭제하지 않는다.
 * 지우면 해당 글의 분류가 사라지므로, 먼저 다른 구분으로 바꾸도록 안내한다.
 */
export async function deleteNewsCategoryAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAuth()
  const id = Number(formData.get('id'))
  if (!Number.isInteger(id) || id <= 0) return { error: '잘못된 항목입니다.' }

  const category = await getNewsCategoryById(id)
  if (!category) return { error: '존재하지 않는 구분입니다.' }

  const count = await countPostsInNewsCategory(category.label)
  if (count > 0) {
    return {
      error: `'${category.label}' 구분이 붙은 소식이 ${count}개 있어 삭제할 수 없습니다. 해당 소식의 구분을 먼저 바꿔 주세요.`,
    }
  }

  await deleteNewsCategory(id)
  refresh()
  redirect('/admin/news/categories')
}
