/**
 * 함께하는 사람들 '구분'의 기본값.
 *
 * 실제 목록은 member_groups 테이블에서 관리자가 추가/수정/삭제한다.
 * 여기 있는 값은 마이그레이션 시드와, 테이블 조회 실패 시 폴백으로만 쓰인다.
 */
export const DEFAULT_MEMBER_GROUPS: { key: string; label: string }[] = [
  { key: 'board', label: '이사회' },
  { key: 'auditor', label: '감사' },
  { key: 'advisor', label: '자문위원' },
  { key: 'staff', label: '상근자' },
]

/** 구분 목록에서 키 → 라벨 조회용 맵을 만든다. */
export function memberGroupLabelMap(groups: { key: string; label: string }[]): Map<string, string> {
  return new Map(groups.map(g => [g.key, g.label]))
}

/**
 * 라벨에서 영문 키를 만든다. 한글 라벨은 영문으로 남는 글자가 없어 'group' 계열이 되며,
 * 키는 화면에 노출되지 않고 members.group_name 참조용으로만 쓰인다.
 */
export function makeGroupKey(label: string, taken: Iterable<string>): string {
  const takenSet = new Set(taken)
  const base =
    label
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'group'
  if (!takenSet.has(base)) return base
  let n = 2
  while (takenSet.has(`${base}-${n}`)) n++
  return `${base}-${n}`
}
