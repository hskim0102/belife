import 'server-only'
import type { QueryResultRow } from 'pg'
import { query, queryOne } from '@/lib/db'
import type { Post } from '@/lib/types'
import type { BoardSearchField } from '@/lib/boardSearch'

interface PostRow extends QueryResultRow {
  id: number
  slug: string
  title: string
  category: Post['category']
  published_at: Date
  thumbnail: string | null
  excerpt: string | null
  body: string | null
  tags: string[] | null
}

function toPost(row: PostRow): Post {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    category: row.category,
    publishedAt: row.published_at.toISOString(),
    thumbnail: row.thumbnail,
    excerpt: row.excerpt,
    body: row.body,
    tags: row.tags ?? [],
  }
}

export async function getRecentPosts(
  limit = 3,
  categories?: Post['category'][],
): Promise<Post[]> {
  const safeLimit = Math.max(1, Math.min(50, Math.trunc(limit)))
  const where = categories?.length ? `WHERE category = ANY($2)` : ''
  const args: unknown[] = categories?.length ? [safeLimit, categories] : [safeLimit]
  const rows = await query<PostRow>(
    `SELECT id, slug, title, category, published_at, thumbnail, excerpt, NULL::text AS body, tags
       FROM posts
       ${where}
       ORDER BY published_at DESC
       LIMIT $1`,
    args,
  )
  return rows.map(toPost)
}

export async function getAllPosts(): Promise<Post[]> {
  const rows = await query<PostRow>(
    `SELECT id, slug, title, category, published_at, thumbnail, excerpt, NULL::text AS body, tags
       FROM posts
       ORDER BY published_at DESC`,
  )
  return rows.map(toPost)
}

export async function getAllPostSlugs(): Promise<string[]> {
  const rows = await query<{ slug: string }>(`SELECT slug FROM posts`)
  return rows.map(r => r.slug)
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const row = await queryOne<PostRow>(
    `SELECT id, slug, title, category, published_at, thumbnail, excerpt, body, tags
       FROM posts
       WHERE slug = $1
       LIMIT 1`,
    [slug],
  )
  return row ? toPost(row) : null
}

export interface PostsPageParams {
  /** 단일 카테고리 필터. undefined면 (categories도 없을 때) 전체. */
  category?: Post['category']
  /** 복수 카테고리 필터(예: 소식 = ['notice','activity']). category보다 우선. */
  categories?: Post['category'][]
  /** 분류 태그(예: '가정방문'). 지정 시 해당 태그를 가진 글만. */
  tag?: string
  page?: number
  pageSize?: number
  /** 본문(body)까지 조회. 동영상 목록에서 유튜브 썸네일을 파생할 때만 켠다(기본 false). */
  includeBody?: boolean
  /** 검색어. 비어 있으면 검색하지 않는다. */
  q?: string
  /** 검색 범위(기본 'all' = 제목 + 내용). */
  searchField?: BoardSearchField
}

export interface PostsPage {
  posts: Post[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

/** 사용자 입력의 LIKE 와일드카드(%, _)를 무력화한 부분일치 패턴. */
function likePattern(term: string): string {
  return `%${term.replace(/[\\%_]/g, ch => `\\${ch}`)}%`
}

/**
 * 본문 검색 대상 표현식.
 * body 는 에디터가 만든 HTML 이라 태그를 공백으로 걷어내고 요약(excerpt)과 함께 본다.
 * (태그를 남겨두면 'p', 'img' 같은 짧은 검색어가 모든 글에 걸린다.)
 */
const CONTENT_TEXT = `(coalesce(excerpt, '') || ' ' || regexp_replace(coalesce(body, ''), '<[^>]*>', ' ', 'g'))`

/** 검색 범위에 맞는 WHERE 조건. placeholder 는 이미 likePattern 을 거친 인자. */
function searchCondition(placeholder: string, field: BoardSearchField): string {
  const title = `title ILIKE ${placeholder}`
  const content = `${CONTENT_TEXT} ILIKE ${placeholder}`
  if (field === 'title') return title
  if (field === 'body') return content
  return `(${title} OR ${content})`
}

/** 카테고리/태그로 필터링하고 페이지 단위로 잘라 게시글을 반환. */
export async function getPostsPage(params: PostsPageParams = {}): Promise<PostsPage> {
  const pageSize = Math.max(1, Math.min(60, Math.trunc(params.pageSize ?? 12)))
  const page = Math.max(1, Math.trunc(params.page ?? 1))

  const conds: string[] = []
  const args: unknown[] = []
  if (params.categories?.length) {
    args.push(params.categories)
    conds.push(`category = ANY($${args.length})`)
  } else if (params.category) {
    args.push(params.category)
    conds.push(`category = $${args.length}`)
  }
  if (params.tag) {
    args.push([params.tag])
    conds.push(`tags @> $${args.length}`)
  }
  const q = params.q?.trim()
  if (q) {
    args.push(likePattern(q))
    conds.push(searchCondition(`$${args.length}`, params.searchField ?? 'all'))
  }
  const where = conds.length ? `WHERE ${conds.join(' AND ')}` : ''

  const totalRows = await query<{ n: number }>(
    `SELECT count(*)::int AS n FROM posts ${where}`,
    args,
  )
  const total = totalRows[0]?.n ?? 0
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const safePage = Math.min(page, totalPages)
  const offset = (safePage - 1) * pageSize

  const bodySelect = params.includeBody ? 'body' : 'NULL::text AS body'
  const rows = await query<PostRow>(
    `SELECT id, slug, title, category, published_at, thumbnail, excerpt, ${bodySelect}, tags
       FROM posts ${where}
       ORDER BY published_at DESC
       LIMIT $${args.length + 1} OFFSET $${args.length + 2}`,
    [...args, pageSize, offset],
  )

  return { posts: rows.map(toPost), total, page: safePage, pageSize, totalPages }
}

/** 주어진 카테고리들의 글 수를 한 번에 집계({ category: count }). */
export async function getCategoryCounts(
  categories: Post['category'][],
): Promise<Record<string, number>> {
  if (!categories.length) return {}
  const rows = await query<{ category: string; n: number }>(
    `SELECT category, count(*)::int AS n
       FROM posts
      WHERE category = ANY($1)
      GROUP BY category`,
    [categories],
  )
  return Object.fromEntries(rows.map(r => [r.category, r.n]))
}

/** news_categories 마이그레이션 미적용(테이블 없음) 판별 */
function isMissingTable(err: unknown): boolean {
  return typeof err === 'object' && err !== null && (err as { code?: string }).code === '42P01'
}

const TAG_COUNTS = `
  SELECT unnest(tags) AS tag, count(*)::int AS count
    FROM posts
   WHERE category = $1 AND cardinality(tags) > 0
   GROUP BY tag`

/**
 * 한 게시판(카테고리)의 분류 태그 목록과 글 수(필터 탭 구성용).
 *
 * 활동소식은 구분 관리(news_categories)에서 정한 정렬 순서를 따르고,
 * 구분에 등록되지 않은 태그(과거 데이터)는 뒤에 글 많은 순으로 붙는다.
 * 그 외 게시판(자료실 등)의 분류는 별도 관리 화면이 없으므로 글 많은 순이다.
 */
export async function getBoardTagCounts(
  category: Post['category'],
): Promise<{ tag: string; count: number }[]> {
  if (category !== 'activity') {
    const rows = await query<{ tag: string; count: number }>(
      `${TAG_COUNTS} ORDER BY count DESC, tag`,
      [category],
    )
    return rows.map(r => ({ tag: r.tag, count: r.count }))
  }
  try {
    const rows = await query<{ tag: string; count: number }>(
      `SELECT t.tag, t.count
         FROM (${TAG_COUNTS}) t
         LEFT JOIN news_categories c ON c.label = t.tag
        ORDER BY (c.id IS NULL), c.sort_order, c.id, t.count DESC, t.tag`,
      [category],
    )
    return rows.map(r => ({ tag: r.tag, count: r.count }))
  } catch (err) {
    if (!isMissingTable(err)) throw err
    const rows = await query<{ tag: string; count: number }>(
      `${TAG_COUNTS} ORDER BY count DESC, tag`,
      [category],
    )
    return rows.map(r => ({ tag: r.tag, count: r.count }))
  }
}

/** 활동소식 분류 태그 목록과 글 수. */
export function getActivityTagCounts(): Promise<{ tag: string; count: number }[]> {
  return getBoardTagCounts('activity')
}

// ── 관리자 CRUD (게시판 글 작성/수정/삭제) ──────────────────────────────────

const POST_COLUMNS = `id, slug, title, category, published_at, thumbnail, excerpt, body, tags`

export interface PostInput {
  category: Post['category']
  title: string
  body: string
  thumbnail: string | null
  excerpt: string | null
  /** YYYY-MM-DD 또는 ISO 문자열 */
  publishedAt: string
  tags: string[]
}

export async function getPostById(id: number): Promise<Post | null> {
  const row = await queryOne<PostRow>(
    `SELECT ${POST_COLUMNS} FROM posts WHERE id = $1 LIMIT 1`,
    [id],
  )
  return row ? toPost(row) : null
}

/** 관리자 작성 글의 고유 slug 생성: <category>-<base36 시각><난수>. 크롤링 slug와 충돌하지 않음. */
function generateSlug(category: string): string {
  const ts = Date.now().toString(36)
  const rand = Math.floor(Math.random() * 1296).toString(36).padStart(2, '0')
  return `${category}-${ts}${rand}`
}

export async function createPost(input: PostInput): Promise<Post> {
  let slug = generateSlug(input.category)
  // 만일의 slug 충돌에 대비해 몇 차례 재시도.
  for (let attempt = 0; attempt < 5; attempt++) {
    const existing = await queryOne<{ id: number }>(`SELECT id FROM posts WHERE slug = $1`, [slug])
    if (!existing) break
    slug = generateSlug(input.category)
  }
  const row = await queryOne<PostRow>(
    `INSERT INTO posts (slug, title, category, published_at, thumbnail, excerpt, body, tags)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING ${POST_COLUMNS}`,
    [
      slug,
      input.title,
      input.category,
      input.publishedAt,
      input.thumbnail,
      input.excerpt,
      input.body,
      input.tags,
    ],
  )
  if (!row) throw new Error('게시글 생성 실패 (데이터베이스 미연결)')
  return toPost(row)
}

export async function updatePost(id: number, input: PostInput): Promise<Post | null> {
  const row = await queryOne<PostRow>(
    `UPDATE posts
        SET title = $2, category = $3, published_at = $4,
            thumbnail = $5, excerpt = $6, body = $7, tags = $8
      WHERE id = $1
      RETURNING ${POST_COLUMNS}`,
    [
      id,
      input.title,
      input.category,
      input.publishedAt,
      input.thumbnail,
      input.excerpt,
      input.body,
      input.tags,
    ],
  )
  return row ? toPost(row) : null
}

export async function deletePost(id: number): Promise<void> {
  await query(`DELETE FROM posts WHERE id = $1`, [id])
}
