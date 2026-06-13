'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { isAuthenticated } from '@/lib/auth'
import {
  createProgram,
  updateProgram,
  deleteProgram,
  getProgramById,
  type ProgramInput,
} from '@/lib/repositories/programs'
import { sanitizePostBody } from '@/lib/sanitize'
import type { Program } from '@/lib/types'
import type { FormState } from './actions'

const VALID_CATEGORIES: Program['category'][] = ['domestic', 'overseas', 'education']

function parseCategory(value: FormDataEntryValue | null): Program['category'] {
  const v = String(value ?? '')
  return (VALID_CATEGORIES as string[]).includes(v) ? (v as Program['category']) : 'domestic'
}

function plainText(html: string): string {
  return html.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim()
}

function parseInput(formData: FormData): ProgramInput | { error: string } {
  const name = String(formData.get('name') ?? '').trim()
  const category = parseCategory(formData.get('category'))
  const description = String(formData.get('description') ?? '').trim()
  const rawBody = String(formData.get('body') ?? '')
  const body = sanitizePostBody(rawBody)
  const orderRaw = Number(formData.get('order'))
  const order = Number.isFinite(orderRaw) ? Math.trunc(orderRaw) : 0

  if (!name) return { error: '사업명을 입력해 주세요.' }
  if (name.length > 100) return { error: '사업명은 100자 이내로 입력해 주세요.' }
  if (!description) return { error: '사업 설명을 입력해 주세요.' }
  if (description.length > 300) return { error: '사업 설명은 300자 이내로 입력해 주세요.' }

  const hasImage = /<img/i.test(body)
  const text = plainText(body)
  if (!text && !hasImage) return { error: '본문 내용을 입력해 주세요.' }

  // 썸네일: 입력값 우선, 없으면 본문 첫 이미지 자동
  const thumbInput = String(formData.get('thumbnail') ?? '').trim()
  let thumbnail: string | null = thumbInput || null
  if (!thumbnail) {
    const m = body.match(/<img[^>]+src="([^"]+)"/i)
    thumbnail = m ? m[1] : null
  }

  return { name, category, description, body, thumbnail, order }
}

async function requireAuth(): Promise<void> {
  if (!(await isAuthenticated())) redirect('/admin/login')
}

function refresh(slug?: string): void {
  revalidatePath('/admin/programs')
  revalidatePath('/', 'page')
  revalidatePath('/programs')
  if (slug) revalidatePath(`/programs/${slug}`)
}

export async function createProgramAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAuth()
  const parsed = parseInput(formData)
  if ('error' in parsed) return parsed

  const program = await createProgram(parsed)
  refresh(program.slug)
  redirect('/admin/programs')
}

export async function updateProgramAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAuth()
  const id = Number(formData.get('id'))
  if (!Number.isInteger(id) || id <= 0) return { error: '잘못된 사업입니다.' }

  const parsed = parseInput(formData)
  if ('error' in parsed) return parsed

  const updated = await updateProgram(id, parsed)
  if (!updated) return { error: '존재하지 않는 사업입니다.' }

  refresh(updated.slug)
  redirect('/admin/programs')
}

export async function deleteProgramAction(formData: FormData): Promise<void> {
  await requireAuth()
  const id = Number(formData.get('id'))
  let slug: string | undefined
  if (Number.isInteger(id) && id > 0) {
    const program = await getProgramById(id)
    slug = program?.slug
    await deleteProgram(id)
    if (program) refresh(program.slug)
  }
  redirect('/admin/programs')
}
