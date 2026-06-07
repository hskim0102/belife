import 'server-only'
import type { QueryResultRow } from 'pg'
import { query, queryOne } from '@/lib/db'
import type { BoardPost, BoardCategory } from '@/lib/types'

interface BoardPostRow extends QueryResultRow {
  id: number
  category: BoardCategory
  title: string
  author: string
  body: string
  pinned: boolean
  published: boolean
  views: number
  created_at: Date
  updated_at: Date
}

function toBoardPost(row: BoardPostRow): BoardPost {
  return {
    id: row.id,
    category: row.category,
    title: row.title,
    author: row.author,
    body: row.body,
    pinned: row.pinned,
    published: row.published,
    views: row.views,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  }
}

const COLUMNS = `id, category, title, author, body, pinned, published, views, created_at, updated_at`

export interface ListOptions {
  page?: number
  pageSize?: number
  category?: BoardCategory
  /** Include unpublished rows (admin only). Defaults to false. */
  includeUnpublished?: boolean
}

export interface PagedBoardPosts {
  items: BoardPost[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export async function listBoardPosts(opts: ListOptions = {}): Promise<PagedBoardPosts> {
  const page = Math.max(1, Math.trunc(opts.page ?? 1))
  const pageSize = Math.max(1, Math.min(100, Math.trunc(opts.pageSize ?? 10)))
  const offset = (page - 1) * pageSize

  const conditions: string[] = []
  const params: unknown[] = []

  if (!opts.includeUnpublished) {
    conditions.push(`published = TRUE`)
  }
  if (opts.category) {
    params.push(opts.category)
    conditions.push(`category = $${params.length}`)
  }
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''

  const totalRow = await queryOne<{ count: number }>(
    `SELECT COUNT(*)::int AS count FROM board_posts ${where}`,
    params,
  )
  const total = totalRow?.count ?? 0

  const rows = await query<BoardPostRow>(
    `SELECT ${COLUMNS}
       FROM board_posts
       ${where}
       ORDER BY pinned DESC, created_at DESC
       LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
    [...params, pageSize, offset],
  )

  return {
    items: rows.map(toBoardPost),
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  }
}

export async function getBoardPostById(id: number): Promise<BoardPost | null> {
  const row = await queryOne<BoardPostRow>(
    `SELECT ${COLUMNS} FROM board_posts WHERE id = $1 LIMIT 1`,
    [id],
  )
  return row ? toBoardPost(row) : null
}

export interface BoardPostInput {
  category: BoardCategory
  title: string
  author: string
  body: string
  pinned: boolean
  published: boolean
}

export async function createBoardPost(input: BoardPostInput): Promise<BoardPost> {
  const row = await queryOne<BoardPostRow>(
    `INSERT INTO board_posts (category, title, author, body, pinned, published)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING ${COLUMNS}`,
    [input.category, input.title, input.author, input.body, input.pinned, input.published],
  )
  // queryOne only returns null when DATABASE_URL is unset; guard for types.
  if (!row) throw new Error('Failed to create board post (database unavailable)')
  return toBoardPost(row)
}

export async function updateBoardPost(id: number, input: BoardPostInput): Promise<BoardPost | null> {
  const row = await queryOne<BoardPostRow>(
    `UPDATE board_posts
        SET category = $2, title = $3, author = $4, body = $5, pinned = $6, published = $7
      WHERE id = $1
      RETURNING ${COLUMNS}`,
    [id, input.category, input.title, input.author, input.body, input.pinned, input.published],
  )
  return row ? toBoardPost(row) : null
}

export async function deleteBoardPost(id: number): Promise<void> {
  await query(`DELETE FROM board_posts WHERE id = $1`, [id])
}

export async function incrementBoardPostViews(id: number): Promise<void> {
  await query(`UPDATE board_posts SET views = views + 1 WHERE id = $1`, [id])
}
