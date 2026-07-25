'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { isAuthenticated } from '@/lib/auth'
import {
  createMemberGroup,
  updateMemberGroup,
  deleteMemberGroup,
  getMemberGroupById,
  countMembersInGroup,
} from '@/lib/repositories/memberGroups'
import type { FormState } from './actions'

async function requireAuth(): Promise<void> {
  if (!(await isAuthenticated())) redirect('/admin/login')
}

function refresh(): void {
  revalidatePath('/admin/members')
  revalidatePath('/admin/members/groups')
  revalidatePath('/intro/people')
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

export async function createMemberGroupAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAuth()
  const label = parseLabel(formData)
  if (typeof label !== 'string') return label

  await createMemberGroup(label, parseOrder(formData))
  refresh()
  redirect('/admin/members/groups')
}

export async function updateMemberGroupAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAuth()
  const id = Number(formData.get('id'))
  if (!Number.isInteger(id) || id <= 0) return { error: '잘못된 항목입니다.' }

  const label = parseLabel(formData)
  if (typeof label !== 'string') return label

  const updated = await updateMemberGroup(id, label, parseOrder(formData))
  if (!updated) return { error: '존재하지 않는 구분입니다.' }

  refresh()
  redirect('/admin/members/groups')
}

/**
 * 구분에 속한 멤버가 있으면 삭제하지 않는다.
 * 지우면 그 멤버들이 공개 페이지에서 사라져 버리기 때문에, 먼저 옮기도록 안내한다.
 */
export async function deleteMemberGroupAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAuth()
  const id = Number(formData.get('id'))
  if (!Number.isInteger(id) || id <= 0) return { error: '잘못된 항목입니다.' }

  const group = await getMemberGroupById(id)
  if (!group) return { error: '존재하지 않는 구분입니다.' }

  const count = await countMembersInGroup(group.key)
  if (count > 0) {
    return {
      error: `'${group.label}'에 속한 멤버가 ${count}명 있어 삭제할 수 없습니다. 해당 멤버의 구분을 먼저 바꿔 주세요.`,
    }
  }

  await deleteMemberGroup(id)
  refresh()
  redirect('/admin/members/groups')
}
