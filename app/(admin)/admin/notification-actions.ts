'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { isAuthenticated } from '@/lib/auth'
import {
  createNotification,
  updateNotification,
  deleteNotification,
  type NotificationInput,
} from '@/lib/repositories/notifications'
import { sanitizePostBody } from '@/lib/sanitize'
import type { FormState } from './actions'

const VALID_TYPES = ['info', 'success', 'warning', 'error'] as const
const VALID_FREQUENCIES = ['always', 'daily'] as const

function parseType(value: FormDataEntryValue | null): NotificationInput['type'] {
  const v = String(value ?? '')
  return (VALID_TYPES as readonly string[]).includes(v) ? (v as NotificationInput['type']) : 'info'
}

function parseFrequency(value: FormDataEntryValue | null): NotificationInput['showFrequency'] {
  const v = String(value ?? '')
  return (VALID_FREQUENCIES as readonly string[]).includes(v) ? (v as NotificationInput['showFrequency']) : 'daily'
}

function parseInput(formData: FormData): NotificationInput | { error: string } {
  const title = String(formData.get('title') ?? '').trim()
  const rawBody = String(formData.get('body') ?? '')
  const body = sanitizePostBody(rawBody)
  const type = parseType(formData.get('type'))
  const showFrequency = parseFrequency(formData.get('showFrequency'))
  const enabled = formData.get('enabled') === 'on'
  const orderRaw = Number(formData.get('order'))
  const order = Number.isFinite(orderRaw) ? Math.trunc(orderRaw) : 0

  if (!title) return { error: '제목을 입력해 주세요.' }
  if (title.length > 100) return { error: '제목은 100자 이내로 입력해 주세요.' }

  return { title, body, type, enabled, showFrequency, order }
}

async function requireAuth(): Promise<void> {
  if (!(await isAuthenticated())) redirect('/admin/login')
}

function refresh(): void {
  revalidatePath('/admin/notifications')
  revalidatePath('/', 'layout')
}

export async function createNotificationAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAuth()
  const parsed = parseInput(formData)
  if ('error' in parsed) return parsed

  await createNotification(parsed)
  refresh()
  redirect('/admin/notifications')
}

export async function updateNotificationAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAuth()
  const id = Number(formData.get('id'))
  if (!Number.isInteger(id) || id <= 0) return { error: '잘못된 알림입니다.' }

  const parsed = parseInput(formData)
  if ('error' in parsed) return parsed

  const updated = await updateNotification(id, parsed)
  if (!updated) return { error: '존재하지 않는 알림입니다.' }

  refresh()
  redirect('/admin/notifications')
}

export async function deleteNotificationAction(formData: FormData): Promise<void> {
  await requireAuth()
  const id = Number(formData.get('id'))
  if (Number.isInteger(id) && id > 0) {
    await deleteNotification(id)
    refresh()
  }
  redirect('/admin/notifications')
}
