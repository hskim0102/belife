'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { isAuthenticated } from '@/lib/auth'
import {
  createMember,
  updateMember,
  deleteMember,
  type MemberInput,
} from '@/lib/repositories/misc'
import { getMemberGroups } from '@/lib/repositories/memberGroups'
import type { FormState } from './actions'

async function parseInput(formData: FormData): Promise<MemberInput | { error: string }> {
  const groupRaw = String(formData.get('group') ?? '').trim()
  if (!groupRaw) return { error: '구분을 선택해 주세요.' }
  // 구분은 관리자가 편집하므로 고정 목록이 아니라 저장된 값과 대조한다.
  const groups = await getMemberGroups()
  if (!groups.some(g => g.key === groupRaw)) return { error: '존재하지 않는 구분입니다.' }
  const name = String(formData.get('name') ?? '').trim()
  const position = String(formData.get('position') ?? '').trim()
  const orderRaw = Number(formData.get('order'))
  const order = Number.isFinite(orderRaw) ? Math.trunc(orderRaw) : 0

  if (!name) return { error: '이름을 입력해 주세요.' }
  if (name.length > 100) return { error: '이름은 100자 이내로 입력해 주세요.' }
  if (position.length > 200) return { error: '직책은 200자 이내로 입력해 주세요.' }

  return { group: groupRaw, name, position: position || null, order }
}

async function requireAuth(): Promise<void> {
  if (!(await isAuthenticated())) redirect('/admin/login')
}

function refresh(): void {
  revalidatePath('/admin/members')
  revalidatePath('/intro/people')
}

export async function createMemberAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAuth()
  const parsed = await parseInput(formData)
  if ('error' in parsed) return parsed

  await createMember(parsed)
  refresh()
  redirect('/admin/members')
}

export async function updateMemberAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAuth()
  const id = Number(formData.get('id'))
  if (!Number.isInteger(id) || id <= 0) return { error: '잘못된 항목입니다.' }

  const parsed = await parseInput(formData)
  if ('error' in parsed) return parsed

  const updated = await updateMember(id, parsed)
  if (!updated) return { error: '존재하지 않는 항목입니다.' }

  refresh()
  redirect('/admin/members')
}

export async function deleteMemberAction(formData: FormData): Promise<void> {
  await requireAuth()
  const id = Number(formData.get('id'))
  if (Number.isInteger(id) && id > 0) {
    await deleteMember(id)
    refresh()
  }
  redirect('/admin/members')
}
