'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { verifyPassword, startSession, endSession, isAuthenticated } from '@/lib/auth'
import {
  createBoardPost,
  updateBoardPost,
  deleteBoardPost,
  type BoardPostInput,
} from '@/lib/repositories/board'
import type { BoardCategory } from '@/lib/types'

export interface FormState {
  error?: string
}

function parseCategory(value: FormDataEntryValue | null): BoardCategory {
  return value === 'notice' || value === 'faq' ? value : 'general'
}

function parseInput(formData: FormData): BoardPostInput | { error: string } {
  const title = String(formData.get('title') ?? '').trim()
  const body = String(formData.get('body') ?? '').trim()
  const author = String(formData.get('author') ?? '').trim() || '관리자'

  if (!title) return { error: '제목을 입력해 주세요.' }
  if (title.length > 255) return { error: '제목은 255자 이내로 입력해 주세요.' }
  if (!body) return { error: '내용을 입력해 주세요.' }

  return {
    title,
    body,
    author,
    category: parseCategory(formData.get('category')),
    pinned: formData.get('pinned') === 'on',
    published: formData.get('published') === 'on',
  }
}

async function requireAuth(): Promise<void> {
  if (!(await isAuthenticated())) {
    redirect('/admin/login')
  }
}

// --- Auth ---------------------------------------------------------------

export async function loginAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const password = String(formData.get('password') ?? '')
  if (!password || !verifyPassword(password)) {
    return { error: '비밀번호가 올바르지 않습니다.' }
  }
  await startSession()
  redirect('/admin/board')
}

export async function logoutAction(): Promise<void> {
  await endSession()
  redirect('/admin/login')
}

// --- Board CRUD ---------------------------------------------------------

export async function createBoardPostAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAuth()
  const parsed = parseInput(formData)
  if ('error' in parsed) return parsed

  await createBoardPost(parsed)
  revalidatePath('/admin/board')
  revalidatePath('/board')
  redirect('/admin/board')
}

export async function updateBoardPostAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAuth()
  const id = Number(formData.get('id'))
  if (!Number.isInteger(id) || id <= 0) return { error: '잘못된 게시물입니다.' }

  const parsed = parseInput(formData)
  if ('error' in parsed) return parsed

  const updated = await updateBoardPost(id, parsed)
  if (!updated) return { error: '존재하지 않는 게시물입니다.' }

  revalidatePath('/admin/board')
  revalidatePath('/board')
  revalidatePath(`/board/${id}`)
  redirect('/admin/board')
}

export async function deleteBoardPostAction(formData: FormData): Promise<void> {
  await requireAuth()
  const id = Number(formData.get('id'))
  if (Number.isInteger(id) && id > 0) {
    await deleteBoardPost(id)
    revalidatePath('/admin/board')
    revalidatePath('/board')
  }
  redirect('/admin/board')
}
