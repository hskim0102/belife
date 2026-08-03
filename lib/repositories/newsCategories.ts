import 'server-only'
import type { QueryResultRow } from 'pg'
import { query, queryOne } from '@/lib/db'
import { ACTIVITY_TAGS } from '@/lib/boardCategories'

interface NewsCategoryRow extends QueryResultRow {
  id: number
  label: string
  sort_order: number
}

export interface NewsCategoryItem {
  id: number
  label: string
  order: number
  /** 이 구분이 붙은 소식(활동소식) 글 수 (목록 조회 시에만 채워진다) */
  postCount: number
}

const COLUMNS = `id, label, sort_order`

function toCategory(row: NewsCategoryRow, postCount = 0): NewsCategoryItem {
  return { id: row.id, label: row.label, order: row.sort_order, postCount }
}

/** 마이그레이션 미적용(테이블 없음) 시 폴백 */
function isMissingTable(err: unknown): boolean {
  return typeof err === 'object' && err !== null && (err as { code?: string }).code === '42P01'
}

/** 마이그레이션 전에도 화면이 비지 않도록 코드에 남겨둔 기본 구분으로 대체한다. */
function fallbackCategories(): NewsCategoryItem[] {
  return ACTIVITY_TAGS.map((label, i) => ({ id: -(i + 1), label, order: i, postCount: 0 }))
}

/** 정렬 순서대로 전체 구분 + 각 구분이 붙은 글 수 */
export async function getNewsCategories(): Promise<NewsCategoryItem[]> {
  try {
    const rows = await query<NewsCategoryRow & { post_count: string }>(
      `SELECT c.id, c.label, c.sort_order,
              (SELECT count(*) FROM posts p
                 WHERE p.category = 'activity' AND c.label = ANY(p.tags)) AS post_count
         FROM news_categories c
        ORDER BY c.sort_order, c.id`,
    )
    if (rows.length === 0) return fallbackCategories()
    return rows.map(r => toCategory(r, Number(r.post_count)))
  } catch (err) {
    if (isMissingTable(err)) return fallbackCategories()
    throw err
  }
}

/** 소식 작성/수정 폼의 분류 select 옵션(라벨 목록, 정렬 순서대로) */
export async function getNewsCategoryLabels(): Promise<string[]> {
  try {
    const rows = await query<{ label: string }>(
      `SELECT label FROM news_categories ORDER BY sort_order, id`,
    )
    if (rows.length === 0) return [...ACTIVITY_TAGS]
    return rows.map(r => r.label)
  } catch (err) {
    if (isMissingTable(err)) return [...ACTIVITY_TAGS]
    throw err
  }
}

export async function getNewsCategoryById(id: number): Promise<NewsCategoryItem | null> {
  try {
    const row = await queryOne<NewsCategoryRow>(
      `SELECT ${COLUMNS} FROM news_categories WHERE id = $1 LIMIT 1`,
      [id],
    )
    return row ? toCategory(row) : null
  } catch (err) {
    if (isMissingTable(err)) return null
    throw err
  }
}

export async function createNewsCategory(label: string, order: number): Promise<NewsCategoryItem> {
  const row = await queryOne<NewsCategoryRow>(
    `INSERT INTO news_categories (label, sort_order)
       VALUES ($1, $2)
       RETURNING ${COLUMNS}`,
    [label, order],
  )
  if (!row) throw new Error('구분 등록 실패 (데이터베이스 미연결)')
  return toCategory(row)
}

/**
 * 라벨/순서를 바꾼다. posts.tags 에는 라벨이 직접 저장되므로,
 * 라벨이 바뀌면 기존 활동소식 글의 태그도 함께 치환해 끊기지 않게 한다.
 */
export async function updateNewsCategory(
  id: number,
  label: string,
  order: number,
): Promise<NewsCategoryItem | null> {
  const current = await getNewsCategoryById(id)
  if (!current) return null

  const row = await queryOne<NewsCategoryRow>(
    `UPDATE news_categories
        SET label = $2, sort_order = $3, updated_at = now()
      WHERE id = $1
      RETURNING ${COLUMNS}`,
    [id, label, order],
  )
  if (!row) return null

  if (current.label !== label) {
    await query(
      `UPDATE posts
          SET tags = array_replace(tags, $1, $2)
        WHERE category = 'activity' AND $1 = ANY(tags)`,
      [current.label, label],
    )
  }
  return toCategory(row)
}

/** 해당 구분이 붙은 활동소식 글 수 */
export async function countPostsInNewsCategory(label: string): Promise<number> {
  const row = await queryOne<{ n: string }>(
    `SELECT count(*) AS n FROM posts WHERE category = 'activity' AND $1 = ANY(tags)`,
    [label],
  )
  return Number(row?.n ?? 0)
}

export async function deleteNewsCategory(id: number): Promise<void> {
  await query(`DELETE FROM news_categories WHERE id = $1`, [id])
}
