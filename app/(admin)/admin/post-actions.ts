'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { isAuthenticated } from '@/lib/auth'
import { createPost, updatePost, deletePost, getPostById, type PostInput } from '@/lib/repositories/posts'
import { sanitizePostBody } from '@/lib/sanitize'
import type { Post } from '@/lib/types'
import type { FormState } from './actions'

const VALID_CATEGORIES: Post['category'][] = [
  'notice', 'activity', 'photo', 'webzine', 'video', 'intro', 'press', 'award', 'calendar',
]

function parseCategory(value: FormDataEntryValue | null): Post['category'] {
  const v = String(value ?? '')
  return (VALID_CATEGORIES as string[]).includes(v) ? (v as Post['category']) : 'notice'
}

function plainText(html: string): string {
  return html.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim()
}

function parseInput(formData: FormData): (PostInput & { category: Post['category'] }) | { error: string } {
  const title = String(formData.get('title') ?? '').trim()
  const category = parseCategory(formData.get('category'))
  const rawBody = String(formData.get('body') ?? '')
  const body = sanitizePostBody(rawBody)
  const publishedAt = String(formData.get('publishedAt') ?? '').trim()

  if (!title) return { error: '제목을 입력해 주세요.' }
  if (title.length > 255) return { error: '제목은 255자 이내로 입력해 주세요.' }

  const text = plainText(body)
  const hasImage = /<img/i.test(body)
  if (!text && !hasImage) return { error: '내용을 입력해 주세요.' }
  if (!/^\d{4}-\d{2}-\d{2}/.test(publishedAt)) return { error: '발행일을 선택해 주세요.' }

  // 태그(쉼표 구분, 선택)
  const tags = String(formData.get('tags') ?? '')
    .split(',')
    .map(t => t.trim())
    .filter(Boolean)

  // 썸네일: 입력값 우선, 없으면 본문 첫 이미지 자동
  const thumbInput = String(formData.get('thumbnail') ?? '').trim()
  let thumbnail: string | null = thumbInput || null
  if (!thumbnail) {
    const m = body.match(/<img[^>]+src="([^"]+)"/i)
    thumbnail = m ? m[1] : null
  }

  // 요약: 입력값 우선, 없으면 본문 텍스트 160자 자동
  const excerptInput = String(formData.get('excerpt') ?? '').trim()
  const excerpt = excerptInput || text.slice(0, 160) || null

  return { category, title, body, thumbnail, excerpt, publishedAt, tags }
}

async function requireAuth(): Promise<void> {
  if (!(await isAuthenticated())) redirect('/admin/login')
}

/** 게시글 변경 시 영향받는 공개 경로 + 관리 경로 재검증 */
function refresh(category: Post['category'], slug?: string): void {
  revalidatePath('/admin/posts')
  revalidatePath('/', 'page')
  if (category === 'activity') {
    revalidatePath('/news')
    if (slug) revalidatePath(`/news/${slug}`)
  } else {
    revalidatePath('/board')
    revalidatePath(`/board/${category}`)
    if (slug) revalidatePath(`/board/${category}/${slug}`)
  }
}

export async function createPostAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAuth()
  const parsed = parseInput(formData)
  if ('error' in parsed) return parsed

  const post = await createPost(parsed)
  refresh(post.category, post.slug)
  redirect('/admin/posts')
}

export async function updatePostAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAuth()
  const id = Number(formData.get('id'))
  if (!Number.isInteger(id) || id <= 0) return { error: '잘못된 게시물입니다.' }

  const parsed = parseInput(formData)
  if ('error' in parsed) return parsed

  const updated = await updatePost(id, parsed)
  if (!updated) return { error: '존재하지 않는 게시물입니다.' }

  refresh(updated.category, updated.slug)
  redirect('/admin/posts')
}

export async function deletePostAction(formData: FormData): Promise<void> {
  await requireAuth()
  const id = Number(formData.get('id'))
  if (Number.isInteger(id) && id > 0) {
    const post = await getPostById(id)
    await deletePost(id)
    if (post) refresh(post.category, post.slug)
  }
  redirect('/admin/posts')
}
