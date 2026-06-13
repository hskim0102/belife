import 'server-only'
import type { QueryResultRow } from 'pg'
import { query, queryOne } from '@/lib/db'
import type { Notification } from '@/lib/types'

interface NotificationRow extends QueryResultRow {
  id: number
  title: string
  body: string | null
  type: Notification['type']
  enabled: boolean
  show_frequency: Notification['showFrequency']
  sort_order: number
  created_at: Date
  updated_at: Date
}

const NOTIFICATION_COLUMNS = `id, title, body, type, enabled, show_frequency, sort_order, created_at, updated_at`

function toNotification(row: NotificationRow): Notification {
  return {
    id: row.id,
    title: row.title,
    body: row.body,
    type: row.type,
    enabled: row.enabled,
    showFrequency: row.show_frequency,
    order: row.sort_order,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  }
}

/** 마이그레이션 미적용 시 폴백: 테이블 없을 때 빈 결과 반환 */
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

/** 공개 사이트용: 활성화된 첫 번째 알림 (가장 먼저 설정된 것부터) */
export async function getActiveNotification(): Promise<Notification | null> {
  const row = await safeQueryOne<NotificationRow>(
    `SELECT ${NOTIFICATION_COLUMNS} FROM notifications
      WHERE enabled
      ORDER BY sort_order, id
      LIMIT 1`,
  )
  return row ? toNotification(row) : null
}

/** 관리자 목록용: 모든 알림 */
export async function getAllNotifications(): Promise<Notification[]> {
  const rows = await safeQuery<NotificationRow>(
    `SELECT ${NOTIFICATION_COLUMNS} FROM notifications
      ORDER BY sort_order, id`,
  )
  return rows.map(toNotification)
}

export async function getNotificationById(id: number): Promise<Notification | null> {
  const row = await safeQueryOne<NotificationRow>(
    `SELECT ${NOTIFICATION_COLUMNS} FROM notifications WHERE id = $1 LIMIT 1`,
    [id],
  )
  return row ? toNotification(row) : null
}

export interface NotificationInput {
  title: string
  body: string | null
  type: Notification['type']
  enabled: boolean
  showFrequency: Notification['showFrequency']
  order: number
}

export async function createNotification(input: NotificationInput): Promise<Notification> {
  const row = await queryOne<NotificationRow>(
    `INSERT INTO notifications (title, body, type, enabled, show_frequency, sort_order)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING ${NOTIFICATION_COLUMNS}`,
    [input.title, input.body, input.type, input.enabled, input.showFrequency, input.order],
  )
  if (!row) throw new Error('알림 등록 실패 (데이터베이스 미연결)')
  return toNotification(row)
}

export async function updateNotification(id: number, input: NotificationInput): Promise<Notification | null> {
  const row = await queryOne<NotificationRow>(
    `UPDATE notifications
        SET title = $2, body = $3, type = $4, enabled = $5, show_frequency = $6, sort_order = $7, updated_at = now()
      WHERE id = $1
      RETURNING ${NOTIFICATION_COLUMNS}`,
    [id, input.title, input.body, input.type, input.enabled, input.showFrequency, input.order],
  )
  return row ? toNotification(row) : null
}

export async function deleteNotification(id: number): Promise<void> {
  try {
    await query(`DELETE FROM notifications WHERE id = $1`, [id])
  } catch (err) {
    if (!isMissingTable(err)) throw err
  }
}
