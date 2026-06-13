'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { isAuthenticated } from '@/lib/auth'
import {
  createMissionCard,
  updateMissionCard,
  deleteMissionCard,
  type MissionCardInput,
} from '@/lib/repositories/missionCards'
import type { FormState } from './actions'

function parseInput(formData: FormData): MissionCardInput | { error: string } {
  const title = String(formData.get('title') ?? '').trim()
  const description = String(formData.get('description') ?? '').trim()
  const iconEmoji = String(formData.get('iconEmoji') ?? '').trim()
  const orderRaw = Number(formData.get('order'))
  const enabled = formData.get('enabled') === 'on'
  const order = Number.isFinite(orderRaw) ? Math.trunc(orderRaw) : 0

  if (!title) return { error: '제목을 입력해 주세요.' }
  if (title.length > 50) return { error: '제목은 50자 이내로 입력해 주세요.' }
  if (!description) return { error: '설명을 입력해 주세요.' }
  if (description.length > 100) return { error: '설명은 100자 이내로 입력해 주세요.' }
  if (!iconEmoji) return { error: '아이콘을 입력해 주세요.' }

  return { title, description, iconEmoji, order, enabled }
}

async function requireAuth(): Promise<void> {
  if (!(await isAuthenticated())) redirect('/admin/login')
}

function refresh(): void {
  revalidatePath('/admin/mission-cards')
  revalidatePath('/', 'page')
}

export async function createMissionCardAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAuth()
  const parsed = parseInput(formData)
  if ('error' in parsed) return parsed

  await createMissionCard(parsed)
  refresh()
  redirect('/admin/mission-cards')
}

export async function updateMissionCardAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAuth()
  const id = Number(formData.get('id'))
  if (!Number.isInteger(id) || id <= 0) return { error: '잘못된 항목입니다.' }

  const parsed = parseInput(formData)
  if ('error' in parsed) return parsed

  const updated = await updateMissionCard(id, parsed)
  if (!updated) return { error: '존재하지 않는 항목입니다.' }

  refresh()
  redirect('/admin/mission-cards')
}

export async function deleteMissionCardAction(formData: FormData): Promise<void> {
  await requireAuth()
  const id = Number(formData.get('id'))
  if (Number.isInteger(id) && id > 0) {
    await deleteMissionCard(id)
    refresh()
  }
  redirect('/admin/mission-cards')
}
