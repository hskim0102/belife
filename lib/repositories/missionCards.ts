import 'server-only'
import type { QueryResultRow } from 'pg'
import { query, queryOne } from '@/lib/db'

interface MissionCardRow extends QueryResultRow {
  id: number
  title: string
  description: string
  icon_emoji: string
  sort_order: number
  enabled: boolean
  created_at: Date
  updated_at: Date
}

export interface MissionCard {
  id: number
  title: string
  description: string
  iconEmoji: string
  order: number
  enabled: boolean
  createdAt: string
  updatedAt: string
}

const MISSION_CARD_COLUMNS = `id, title, description, icon_emoji, sort_order, enabled, created_at, updated_at`

function toMissionCard(row: MissionCardRow): MissionCard {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    iconEmoji: row.icon_emoji,
    order: row.sort_order,
    enabled: row.enabled,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  }
}

/** 마이그레이션 미적용 시 폴백 */
function isMissingTable(err: unknown): boolean {
  return typeof err === 'object' && err !== null && (err as { code?: string }).code === '42P01'
}

async function safeQuery<T extends QueryResultRow>(sql: string, params?: ReadonlyArray<unknown>): Promise<T[]> {
  try {
    return await query<T>(sql, params)
  } catch (err) {
    if (isMissingTable(err)) return []
    throw err
  }
}

async function safeQueryOne<T extends QueryResultRow>(sql: string, params?: ReadonlyArray<unknown>): Promise<T | null> {
  const rows = await safeQuery<T>(sql, params)
  return rows[0] ?? null
}

/** 공개 사이트용: 활성화된 카드들 */
export async function getEnabledMissionCards(): Promise<MissionCard[]> {
  const rows = await safeQuery<MissionCardRow>(
    `SELECT ${MISSION_CARD_COLUMNS} FROM mission_cards
      WHERE enabled
      ORDER BY sort_order, id`,
  )
  return rows.map(toMissionCard)
}

/** 관리자 목록용: 모든 카드 */
export async function getAllMissionCards(): Promise<MissionCard[]> {
  const rows = await safeQuery<MissionCardRow>(
    `SELECT ${MISSION_CARD_COLUMNS} FROM mission_cards
      ORDER BY sort_order, id`,
  )
  return rows.map(toMissionCard)
}

export async function getMissionCardById(id: number): Promise<MissionCard | null> {
  const row = await safeQueryOne<MissionCardRow>(
    `SELECT ${MISSION_CARD_COLUMNS} FROM mission_cards WHERE id = $1 LIMIT 1`,
    [id],
  )
  return row ? toMissionCard(row) : null
}

export interface MissionCardInput {
  title: string
  description: string
  iconEmoji: string
  order: number
  enabled: boolean
}

export async function createMissionCard(input: MissionCardInput): Promise<MissionCard> {
  const row = await queryOne<MissionCardRow>(
    `INSERT INTO mission_cards (title, description, icon_emoji, sort_order, enabled)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING ${MISSION_CARD_COLUMNS}`,
    [input.title, input.description, input.iconEmoji, input.order, input.enabled],
  )
  if (!row) throw new Error('소명 카드 등록 실패 (데이터베이스 미연결)')
  return toMissionCard(row)
}

export async function updateMissionCard(id: number, input: MissionCardInput): Promise<MissionCard | null> {
  const row = await queryOne<MissionCardRow>(
    `UPDATE mission_cards
        SET title = $2, description = $3, icon_emoji = $4, sort_order = $5, enabled = $6, updated_at = now()
      WHERE id = $1
      RETURNING ${MISSION_CARD_COLUMNS}`,
    [id, input.title, input.description, input.iconEmoji, input.order, input.enabled],
  )
  return row ? toMissionCard(row) : null
}

export async function deleteMissionCard(id: number): Promise<void> {
  try {
    await query(`DELETE FROM mission_cards WHERE id = $1`, [id])
  } catch (err) {
    if (!isMissingTable(err)) throw err
  }
}
