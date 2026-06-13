import 'server-only'
import type { QueryResultRow } from 'pg'
import { query, queryOne } from '@/lib/db'
import type { Program } from '@/lib/types'

interface ProgramRow extends QueryResultRow {
  id: number
  slug: string
  name: string
  category: Program['category']
  sort_order: number
  thumbnail: string | null
  description: string
  body: string | null
}

function toProgram(row: ProgramRow): Program {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    category: row.category,
    order: row.sort_order,
    thumbnail: row.thumbnail,
    description: row.description,
    body: row.body,
  }
}

export async function getAllPrograms(): Promise<Program[]> {
  const rows = await query<ProgramRow>(
    `SELECT id, slug, name, category, sort_order, thumbnail, description, NULL::text AS body
       FROM programs
       ORDER BY sort_order ASC, id ASC`,
  )
  return rows.map(toProgram)
}

export async function getAllProgramSlugs(): Promise<string[]> {
  const rows = await query<{ slug: string }>(`SELECT slug FROM programs`)
  return rows.map(r => r.slug)
}

export async function getProgramBySlug(slug: string): Promise<Program | null> {
  const row = await queryOne<ProgramRow>(
    `SELECT id, slug, name, category, sort_order, thumbnail, description, body
       FROM programs
       WHERE slug = $1
       LIMIT 1`,
    [slug],
  )
  return row ? toProgram(row) : null
}

// ── 관리자 CRUD (사업 관리) ──────────────────────────────────

const PROGRAM_COLUMNS = `id, slug, name, category, sort_order, thumbnail, description, body`

export interface ProgramInput {
  name: string
  category: Program['category']
  description: string
  body: string | null
  thumbnail: string | null
  order: number
}

export async function getProgramById(id: number): Promise<Program | null> {
  const row = await queryOne<ProgramRow>(
    `SELECT ${PROGRAM_COLUMNS} FROM programs WHERE id = $1 LIMIT 1`,
    [id],
  )
  return row ? toProgram(row) : null
}

/** 관리자 등록 사업의 고유 slug: prog-<base36 시각><난수>. 기존 slug와 충돌하지 않음. */
function generateSlug(): string {
  const ts = Date.now().toString(36)
  const rand = Math.floor(Math.random() * 1296).toString(36).padStart(2, '0')
  return `prog-${ts}${rand}`
}

export async function createProgram(input: ProgramInput): Promise<Program> {
  let slug = generateSlug()
  // 만일의 slug 충돌에 대비해 몇 차례 재시도.
  for (let attempt = 0; attempt < 5; attempt++) {
    const existing = await queryOne<{ id: number }>(`SELECT id FROM programs WHERE slug = $1`, [slug])
    if (!existing) break
    slug = generateSlug()
  }
  const row = await queryOne<ProgramRow>(
    `INSERT INTO programs (slug, name, category, description, body, thumbnail, sort_order)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING ${PROGRAM_COLUMNS}`,
    [slug, input.name, input.category, input.description, input.body, input.thumbnail, input.order],
  )
  if (!row) throw new Error('사업 등록 실패 (데이터베이스 미연결)')
  return toProgram(row)
}

export async function updateProgram(id: number, input: ProgramInput): Promise<Program | null> {
  const row = await queryOne<ProgramRow>(
    `UPDATE programs
        SET name = $2, category = $3, description = $4, body = $5, thumbnail = $6, sort_order = $7
      WHERE id = $1
      RETURNING ${PROGRAM_COLUMNS}`,
    [id, input.name, input.category, input.description, input.body, input.thumbnail, input.order],
  )
  return row ? toProgram(row) : null
}

export async function deleteProgram(id: number): Promise<void> {
  await query(`DELETE FROM programs WHERE id = $1`, [id])
}
