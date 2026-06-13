import 'server-only'
import type { QueryResultRow } from 'pg'
import { query, queryOne } from '@/lib/db'
import type { MenuKey, MenuPage } from '@/lib/types'

interface MenuPageRow extends QueryResultRow {
  id: number
  menu: MenuKey
  slug: string
  title: string
  body: string | null
  sort_order: number
  published: boolean
  created_at: Date
  updated_at: Date
}

const MENU_PAGE_COLUMNS = `id, menu, slug, title, body, sort_order, published, created_at, updated_at`

/** 42P01: relation does not exist — 마이그레이션(006_menu_pages.sql) 적용 전에도 사이트가 동작하도록 빈 결과로 폴백. */
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

function toMenuPage(row: MenuPageRow): MenuPage {
  return {
    id: row.id,
    menu: row.menu,
    slug: row.slug,
    title: row.title,
    body: row.body,
    order: row.sort_order,
    published: row.published,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  }
}

/** 네비게이션용: 공개된 메뉴 페이지를 메뉴·정렬 순으로 반환(본문 제외). */
export async function getPublishedMenuPages(): Promise<MenuPage[]> {
  const rows = await safeQuery<MenuPageRow>(
    `SELECT id, menu, slug, title, NULL::text AS body, sort_order, published, created_at, updated_at
       FROM menu_pages
      WHERE published
      ORDER BY menu, sort_order, id`,
  )
  return rows.map(toMenuPage)
}

/** 관리자 목록용: 모든 메뉴 페이지(비공개 포함, 본문 제외). */
export async function getAllMenuPages(menu?: MenuKey): Promise<MenuPage[]> {
  const where = menu ? `WHERE menu = $1` : ''
  const rows = await safeQuery<MenuPageRow>(
    `SELECT id, menu, slug, title, NULL::text AS body, sort_order, published, created_at, updated_at
       FROM menu_pages
       ${where}
      ORDER BY menu, sort_order, id`,
    menu ? [menu] : undefined,
  )
  return rows.map(toMenuPage)
}

export async function getMenuPageBySlug(slug: string): Promise<MenuPage | null> {
  const row = await safeQueryOne<MenuPageRow>(
    `SELECT ${MENU_PAGE_COLUMNS} FROM menu_pages WHERE slug = $1 LIMIT 1`,
    [slug],
  )
  return row ? toMenuPage(row) : null
}

export async function getMenuPageById(id: number): Promise<MenuPage | null> {
  const row = await safeQueryOne<MenuPageRow>(
    `SELECT ${MENU_PAGE_COLUMNS} FROM menu_pages WHERE id = $1 LIMIT 1`,
    [id],
  )
  return row ? toMenuPage(row) : null
}

export interface MenuPageInput {
  menu: MenuKey
  title: string
  body: string
  order: number
  published: boolean
}

/** 관리자 등록 페이지의 고유 slug: page-<base36 시각><난수>. 고정 경로(people 등)와 충돌하지 않음. */
function generateSlug(): string {
  const ts = Date.now().toString(36)
  const rand = Math.floor(Math.random() * 1296).toString(36).padStart(2, '0')
  return `page-${ts}${rand}`
}

export async function createMenuPage(input: MenuPageInput): Promise<MenuPage> {
  let slug = generateSlug()
  // 만일의 slug 충돌에 대비해 몇 차례 재시도.
  for (let attempt = 0; attempt < 5; attempt++) {
    const existing = await queryOne<{ id: number }>(`SELECT id FROM menu_pages WHERE slug = $1`, [slug])
    if (!existing) break
    slug = generateSlug()
  }
  const row = await queryOne<MenuPageRow>(
    `INSERT INTO menu_pages (menu, slug, title, body, sort_order, published)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING ${MENU_PAGE_COLUMNS}`,
    [input.menu, slug, input.title, input.body, input.order, input.published],
  )
  if (!row) throw new Error('메뉴 페이지 생성 실패 (데이터베이스 미연결)')
  return toMenuPage(row)
}

export async function updateMenuPage(id: number, input: MenuPageInput): Promise<MenuPage | null> {
  const row = await queryOne<MenuPageRow>(
    `UPDATE menu_pages
        SET menu = $2, title = $3, body = $4, sort_order = $5, published = $6, updated_at = now()
      WHERE id = $1
      RETURNING ${MENU_PAGE_COLUMNS}`,
    [id, input.menu, input.title, input.body, input.order, input.published],
  )
  return row ? toMenuPage(row) : null
}

export async function deleteMenuPage(id: number): Promise<void> {
  await query(`DELETE FROM menu_pages WHERE id = $1`, [id])
}
