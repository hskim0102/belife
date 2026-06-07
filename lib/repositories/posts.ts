import 'server-only'
import type { QueryResultRow } from 'pg'
import { query, queryOne } from '@/lib/db'
import type { Post } from '@/lib/types'

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
}

export interface PostsPage {
  posts: Post[]
  total: number
  page: number
  pageSize: number
  totalPages: number
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
  const where = conds.length ? `WHERE ${conds.join(' AND ')}` : ''

  const totalRows = await query<{ n: number }>(
    `SELECT count(*)::int AS n FROM posts ${where}`,
    args,
  )
  const total = totalRows[0]?.n ?? 0
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const safePage = Math.min(page, totalPages)
  const offset = (safePage - 1) * pageSize

  const rows = await query<PostRow>(
    `SELECT id, slug, title, category, published_at, thumbnail, excerpt, NULL::text AS body, tags
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

/** 활동소식 분류 태그 목록과 글 수(탭 구성용). 글 많은 순. */
export async function getActivityTagCounts(): Promise<{ tag: string; count: number }[]> {
  const rows = await query<{ tag: string; count: number }>(
    `SELECT unnest(tags) AS tag, count(*)::int AS count
       FROM posts
      WHERE category = 'activity' AND cardinality(tags) > 0
      GROUP BY tag
      ORDER BY count DESC, tag`,
  )
  return rows.map(r => ({ tag: r.tag, count: r.count }))
}
