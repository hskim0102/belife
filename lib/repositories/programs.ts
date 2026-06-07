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
