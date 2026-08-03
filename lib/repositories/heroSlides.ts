import 'server-only'
import type { QueryResultRow } from 'pg'
import { query, queryOne } from '@/lib/db'
import type { HeroSlide } from '@/lib/types'

interface HeroSlideRow extends QueryResultRow {
  id: number
  image_url: string
  alt: string
  title: string | null
  subtitle: string | null
  sort_order: number
  published: boolean
  blob_pathname: string | null
  created_at: Date
  updated_at: Date
}

function toHeroSlide(row: HeroSlideRow): HeroSlide {
  return {
    id: row.id,
    imageUrl: row.image_url,
    alt: row.alt,
    title: row.title,
    subtitle: row.subtitle,
    order: row.sort_order,
    published: row.published,
    blobPathname: row.blob_pathname,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  }
}

const COLUMNS = `id, image_url, alt, title, subtitle, sort_order, published, blob_pathname, created_at, updated_at`

/** 빈 문자열은 NULL 로 저장해 폴백이 동작하게 한다. */
function nullify(v: string): string | null {
  const t = v.trim()
  return t.length > 0 ? t : null
}

/** Published slides for the public home page, in display order. */
export async function getPublishedHeroSlides(): Promise<HeroSlide[]> {
  const rows = await query<HeroSlideRow>(
    `SELECT ${COLUMNS} FROM hero_slides WHERE published = TRUE ORDER BY sort_order, id`,
  )
  return rows.map(toHeroSlide)
}

/** All slides for the admin screen, in display order. */
export async function getAllHeroSlides(): Promise<HeroSlide[]> {
  const rows = await query<HeroSlideRow>(
    `SELECT ${COLUMNS} FROM hero_slides ORDER BY sort_order, id`,
  )
  return rows.map(toHeroSlide)
}

export async function getHeroSlideById(id: number): Promise<HeroSlide | null> {
  const row = await queryOne<HeroSlideRow>(
    `SELECT ${COLUMNS} FROM hero_slides WHERE id = $1 LIMIT 1`,
    [id],
  )
  return row ? toHeroSlide(row) : null
}

export interface NewHeroSlide {
  imageUrl: string
  alt: string
  title?: string | null
  subtitle?: string | null
  blobPathname: string | null
}

/** Append a slide to the end of the ordering. */
export async function createHeroSlide(input: NewHeroSlide): Promise<HeroSlide> {
  const row = await queryOne<HeroSlideRow>(
    `INSERT INTO hero_slides (image_url, alt, title, subtitle, blob_pathname, sort_order)
       VALUES ($1, $2, $3, $4, $5, COALESCE((SELECT MAX(sort_order) + 1 FROM hero_slides), 0))
       RETURNING ${COLUMNS}`,
    [input.imageUrl, input.alt, input.title ?? null, input.subtitle ?? null, input.blobPathname],
  )
  if (!row) throw new Error('Failed to create hero slide (database unavailable)')
  return toHeroSlide(row)
}

/** 슬라이드의 메인 문구(제목·설명)와 대체 텍스트를 수정한다. */
export async function updateHeroSlideText(
  id: number,
  input: { title: string; subtitle: string; alt: string },
): Promise<void> {
  await query(
    `UPDATE hero_slides SET title = $2, subtitle = $3, alt = $4 WHERE id = $1`,
    [id, nullify(input.title), nullify(input.subtitle), input.alt.trim() || '메인 배너 이미지'],
  )
}

export async function deleteHeroSlide(id: number): Promise<void> {
  await query(`DELETE FROM hero_slides WHERE id = $1`, [id])
}

export async function setHeroSlidePublished(id: number, published: boolean): Promise<void> {
  await query(`UPDATE hero_slides SET published = $2 WHERE id = $1`, [id, published])
}

export async function updateHeroSlideAlt(id: number, alt: string): Promise<void> {
  await query(`UPDATE hero_slides SET alt = $2 WHERE id = $1`, [id, alt])
}

/**
 * Swap the sort_order of a slide with its neighbour in the given direction.
 * Runs in a single statement set so ordering stays consistent.
 */
export async function moveHeroSlide(id: number, direction: 'up' | 'down'): Promise<void> {
  const current = await queryOne<{ sort_order: number }>(
    `SELECT sort_order FROM hero_slides WHERE id = $1`,
    [id],
  )
  if (!current) return

  const neighbour = await queryOne<{ id: number; sort_order: number }>(
    direction === 'up'
      ? `SELECT id, sort_order FROM hero_slides WHERE sort_order < $1 ORDER BY sort_order DESC LIMIT 1`
      : `SELECT id, sort_order FROM hero_slides WHERE sort_order > $1 ORDER BY sort_order ASC LIMIT 1`,
    [current.sort_order],
  )
  if (!neighbour) return

  // Swap the two sort_order values. Cast the params to int so Postgres does not
  // infer them as text inside the CASE expression.
  await query(
    `UPDATE hero_slides SET sort_order = CASE
        WHEN id = $1 THEN $4::int
        WHEN id = $2 THEN $3::int
      END
      WHERE id IN ($1, $2)`,
    [id, neighbour.id, current.sort_order, neighbour.sort_order],
  )
}
