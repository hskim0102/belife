import type { MemberGroup } from '@/lib/types'

/** 함께하는 사람들 구분. 공개 페이지와 관리자 화면이 공유한다. */
export const MEMBER_GROUPS: { key: MemberGroup; label: string }[] = [
  { key: 'board', label: '이사회' },
  { key: 'auditor', label: '감사' },
  { key: 'advisor', label: '자문위원' },
  { key: 'staff', label: '상근자' },
]

export const MEMBER_GROUP_KEYS = MEMBER_GROUPS.map(g => g.key)

export function isMemberGroup(value: string): value is MemberGroup {
  return (MEMBER_GROUP_KEYS as string[]).includes(value)
}

export function getMemberGroupLabel(key: MemberGroup): string {
  return MEMBER_GROUPS.find(g => g.key === key)?.label ?? key
}
