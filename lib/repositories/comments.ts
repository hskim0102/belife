import 'server-only'
import type { QueryResultRow } from 'pg'
import { query, queryOne } from '@/lib/db'

export interface Comment {
  id: number
  post_id: number
  author: string
  email: string
  content: string
  password: string
  created_at: string
  updated_at: string
}

interface CommentRow extends QueryResultRow {
  id: number
  post_id: number
  author: string
  email: string
  content: string
  password: string
  created_at: Date
  updated_at: Date
}

function toComment(row: CommentRow): Comment {
  return {
    id: row.id,
    post_id: row.post_id,
    author: row.author,
    email: row.email,
    content: row.content,
    password: row.password,
    created_at: row.created_at.toISOString(),
    updated_at: row.updated_at.toISOString(),
  }
}

export async function getCommentsByPostId(postId: number): Promise<Comment[]> {
  const rows = await query<CommentRow>(
    `SELECT id, post_id, author, email, content, password, created_at, updated_at
       FROM comments
       WHERE post_id = $1
       ORDER BY created_at DESC`,
    [postId],
  )
  return rows.map(toComment)
}

export async function getCommentCountByPostId(postId: number): Promise<number> {
  const rows = await query<{ count: number }>(
    `SELECT COUNT(*)::int AS count FROM comments WHERE post_id = $1`,
    [postId],
  )
  return rows[0]?.count ?? 0
}

export async function createComment(
  postId: number,
  author: string,
  email: string,
  content: string,
  password: string,
): Promise<Comment | null> {
  const row = await queryOne<CommentRow>(
    `INSERT INTO comments (post_id, author, email, content, password)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, post_id, author, email, content, password, created_at, updated_at`,
    [postId, author, email, content, password],
  )
  return row ? toComment(row) : null
}

export async function deleteComment(id: number, password: string): Promise<boolean> {
  const rows = await query<{ id: number }>(
    `DELETE FROM comments WHERE id = $1 AND password = $2 RETURNING id`,
    [id, password],
  )
  return rows.length > 0
}

export async function getComment(id: number): Promise<Comment | null> {
  const row = await queryOne<CommentRow>(
    `SELECT id, post_id, author, email, content, password, created_at, updated_at
       FROM comments
       WHERE id = $1
       LIMIT 1`,
    [id],
  )
  return row ? toComment(row) : null
}

export async function verifyCommentPassword(id: number, password: string): Promise<boolean> {
  const row = await queryOne<{ id: number }>(
    `SELECT id FROM comments WHERE id = $1 AND password = $2`,
    [id, password],
  )
  return row !== null
}
