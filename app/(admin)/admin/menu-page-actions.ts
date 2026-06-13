'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { isAuthenticated } from '@/lib/auth'
import {
  createMenuPage,
  updateMenuPage,
  deleteMenuPage,
  getMenuPageById,
  type MenuPageInput,
} from '@/lib/repositories/menuPages'
import { sanitizePostBody } from '@/lib/sanitize'
import { isMenuKey, menuPageHref } from '@/lib/menus'
import type { MenuKey } from '@/lib/types'
import type { FormState } from './actions'

function plainText(html: string): string {
  return html.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim()
}

function parseInput(formData: FormData): MenuPageInput | { error: string } {
  const menuRaw = String(formData.get('menu') ?? '')
  const menu: MenuKey = isMenuKey(menuRaw) ? menuRaw : 'intro'
  const title = String(formData.get('title') ?? '').trim()
  const body = sanitizePostBody(String(formData.get('body') ?? ''))
  const orderRaw = Number(formData.get('order'))
  const order = Number.isFinite(orderRaw) ? Math.trunc(orderRaw) : 0
  const published = formData.get('published') === 'on'

  if (!title) return { error: '메뉴명을 입력해 주세요.' }
  if (title.length > 100) return { error: '메뉴명은 100자 이내로 입력해 주세요.' }

  const hasImage = /<img/i.test(body)
  if (!plainText(body) && !hasImage) return { error: '내용을 입력해 주세요.' }

  return { menu, title, body, order, published }
}

async function requireAuth(): Promise<void> {
  if (!(await isAuthenticated())) redirect('/admin/login')
}

/** 메뉴 페이지 변경 시 네비게이션(전 페이지)과 해당 공개 경로 재검증 */
function refresh(menu: MenuKey, slug?: string): void {
  revalidatePath('/admin/pages')
  // 헤더 네비게이션은 모든 공개 페이지에 들어가므로 레이아웃 단위로 재검증.
  revalidatePath('/', 'layout')
  if (slug) revalidatePath(menuPageHref(menu, slug))
}

export async function createMenuPageAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAuth()
  const parsed = parseInput(formData)
  if ('error' in parsed) return parsed

  const page = await createMenuPage(parsed)
  refresh(page.menu, page.slug)
  redirect('/admin/pages')
}

export async function updateMenuPageAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAuth()
  const id = Number(formData.get('id'))
  if (!Number.isInteger(id) || id <= 0) return { error: '잘못된 페이지입니다.' }

  const existing = await getMenuPageById(id)
  if (!existing) return { error: '존재하지 않는 페이지입니다.' }

  const parsed = parseInput(formData)
  if ('error' in parsed) return parsed

  // 메뉴 대표 페이지(slug=메뉴 키)는 경로가 고정이므로 메뉴를 옮길 수 없다.
  if (existing.slug === existing.menu && parsed.menu !== existing.menu) {
    return { error: '대표 페이지는 다른 메뉴로 이동할 수 없습니다.' }
  }

  const updated = await updateMenuPage(id, parsed)
  if (!updated) return { error: '존재하지 않는 페이지입니다.' }

  refresh(updated.menu, updated.slug)
  redirect('/admin/pages')
}

export async function deleteMenuPageAction(formData: FormData): Promise<void> {
  await requireAuth()
  const id = Number(formData.get('id'))
  if (Number.isInteger(id) && id > 0) {
    const page = await getMenuPageById(id)
    await deleteMenuPage(id)
    if (page) refresh(page.menu, page.slug)
  }
  redirect('/admin/pages')
}
