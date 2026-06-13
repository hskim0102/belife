'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { isAuthenticated } from '@/lib/auth'
import {
  createMilestone,
  updateMilestone,
  deleteMilestone,
  type MilestoneInput,
} from '@/lib/repositories/misc'
import type { FormState } from './actions'

function parseInput(formData: FormData): MilestoneInput | { error: string } {
  const year = Math.trunc(Number(formData.get('year')))
  const month = Math.trunc(Number(formData.get('month')))
  const content = String(formData.get('content') ?? '').trim()

  if (!Number.isInteger(year) || year < 1900 || year > 2200) return { error: '연도를 올바르게 입력해 주세요.' }
  if (!Number.isInteger(month) || month < 1 || month > 12) return { error: '월은 1~12 사이로 입력해 주세요.' }
  if (!content) return { error: '내용을 입력해 주세요.' }
  if (content.length > 500) return { error: '내용은 500자 이내로 입력해 주세요.' }

  return { year, month, content }
}

async function requireAuth(): Promise<void> {
  if (!(await isAuthenticated())) redirect('/admin/login')
}

function refresh(): void {
  revalidatePath('/admin/milestones')
  revalidatePath('/intro/history')
}

export async function createMilestoneAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAuth()
  const parsed = parseInput(formData)
  if ('error' in parsed) return parsed

  await createMilestone(parsed)
  refresh()
  redirect('/admin/milestones')
}

export async function updateMilestoneAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAuth()
  const id = Number(formData.get('id'))
  if (!Number.isInteger(id) || id <= 0) return { error: '잘못된 항목입니다.' }

  const parsed = parseInput(formData)
  if ('error' in parsed) return parsed

  const updated = await updateMilestone(id, parsed)
  if (!updated) return { error: '존재하지 않는 항목입니다.' }

  refresh()
  redirect('/admin/milestones')
}

export async function deleteMilestoneAction(formData: FormData): Promise<void> {
  await requireAuth()
  const id = Number(formData.get('id'))
  if (Number.isInteger(id) && id > 0) {
    await deleteMilestone(id)
    refresh()
  }
  redirect('/admin/milestones')
}
