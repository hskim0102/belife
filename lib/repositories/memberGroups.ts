import 'server-only'
import type { QueryResultRow } from 'pg'
import { query, queryOne } from '@/lib/db'
import { DEFAULT_MEMBER_GROUPS, makeGroupKey } from '@/lib/members'

interface MemberGroupRow extends QueryResultRow {
  id: number
  group_key: string
  label: string
  sort_order: number
}

export interface MemberGroupItem {
  id: number
  key: string
  label: string
  order: number
  /** 이 구분에 속한 멤버 수 (목록 조회 시에만 채워진다) */
  memberCount: number
}

const COLUMNS = `id, group_key, label, sort_order`

function toGroup(row: MemberGroupRow, memberCount = 0): MemberGroupItem {
  return { id: row.id, key: row.group_key, label: row.label, order: row.sort_order, memberCount }
}

/** 마이그레이션 미적용(테이블 없음) 시 폴백 */
function isMissingTable(err: unknown): boolean {
  return typeof err === 'object' && err !== null && (err as { code?: string }).code === '42P01'
}

/** 마이그레이션 전에도 화면이 비지 않도록 코드에 남겨둔 기본 구분으로 대체한다. */
function fallbackGroups(): MemberGroupItem[] {
  return DEFAULT_MEMBER_GROUPS.map((g, i) => ({
    id: -(i + 1),
    key: g.key,
    label: g.label,
    order: i,
    memberCount: 0,
  }))
}

/** 정렬 순서대로 전체 구분 + 각 구분의 멤버 수 */
export async function getMemberGroups(): Promise<MemberGroupItem[]> {
  try {
    const rows = await query<MemberGroupRow & { member_count: string }>(
      `SELECT g.id, g.group_key, g.label, g.sort_order, count(m.id) AS member_count
         FROM member_groups g
         LEFT JOIN members m ON m.group_name = g.group_key
        GROUP BY g.id
        ORDER BY g.sort_order, g.id`,
    )
    if (rows.length === 0) return fallbackGroups()
    return rows.map(r => toGroup(r, Number(r.member_count)))
  } catch (err) {
    if (isMissingTable(err)) return fallbackGroups()
    throw err
  }
}

export async function getMemberGroupById(id: number): Promise<MemberGroupItem | null> {
  try {
    const row = await queryOne<MemberGroupRow>(
      `SELECT ${COLUMNS} FROM member_groups WHERE id = $1 LIMIT 1`,
      [id],
    )
    return row ? toGroup(row) : null
  } catch (err) {
    if (isMissingTable(err)) return null
    throw err
  }
}

export async function createMemberGroup(label: string, order: number): Promise<MemberGroupItem> {
  const existing = await query<{ group_key: string }>(`SELECT group_key FROM member_groups`)
  const key = makeGroupKey(label, existing.map(r => r.group_key))
  const row = await queryOne<MemberGroupRow>(
    `INSERT INTO member_groups (group_key, label, sort_order)
       VALUES ($1, $2, $3)
       RETURNING ${COLUMNS}`,
    [key, label, order],
  )
  if (!row) throw new Error('구분 등록 실패 (데이터베이스 미연결)')
  return toGroup(row)
}

/** 라벨과 순서만 바꾼다. 키는 그대로 두어 소속된 멤버가 끊기지 않게 한다. */
export async function updateMemberGroup(
  id: number,
  label: string,
  order: number,
): Promise<MemberGroupItem | null> {
  const row = await queryOne<MemberGroupRow>(
    `UPDATE member_groups
        SET label = $2, sort_order = $3, updated_at = now()
      WHERE id = $1
      RETURNING ${COLUMNS}`,
    [id, label, order],
  )
  return row ? toGroup(row) : null
}

/** 해당 구분에 속한 멤버 수 */
export async function countMembersInGroup(key: string): Promise<number> {
  const row = await queryOne<{ n: string }>(
    `SELECT count(*) AS n FROM members WHERE group_name = $1`,
    [key],
  )
  return Number(row?.n ?? 0)
}

export async function deleteMemberGroup(id: number): Promise<void> {
  await query(`DELETE FROM member_groups WHERE id = $1`, [id])
}
