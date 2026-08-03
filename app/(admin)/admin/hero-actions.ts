'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { isAuthenticated } from '@/lib/auth'
import { uploadHeroImage, deleteHeroImage, UploadError } from '@/lib/blob'
import {
  createHeroSlide,
  deleteHeroSlide,
  getHeroSlideById,
  setHeroSlidePublished,
  moveHeroSlide,
  updateHeroSlideText,
} from '@/lib/repositories/heroSlides'
import type { FormState } from './actions'

async function requireAuth(): Promise<void> {
  if (!(await isAuthenticated())) {
    redirect('/admin/login')
  }
}

function refreshHero(): void {
  revalidatePath('/admin/hero')
  revalidatePath('/', 'page')
}

export async function uploadHeroSlideAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAuth()

  const file = formData.get('image')
  const alt = String(formData.get('alt') ?? '').trim()
  const title = String(formData.get('title') ?? '').trim()
  const subtitle = String(formData.get('subtitle') ?? '').trim()

  if (!(file instanceof File)) {
    return { error: '이미지 파일을 선택해 주세요.' }
  }

  let uploaded
  try {
    uploaded = await uploadHeroImage(file)
  } catch (err) {
    if (err instanceof UploadError) return { error: err.message }
    return { error: '이미지 업로드 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.' }
  }

  await createHeroSlide({
    imageUrl: uploaded.url,
    alt: alt || '메인 배너 이미지',
    title: title || null,
    subtitle: subtitle || null,
    blobPathname: uploaded.pathname,
  })

  refreshHero()
  redirect('/admin/hero')
}

/** 기존 슬라이드의 메인 문구(제목·설명)·대체 텍스트 수정 */
export async function updateHeroSlideTextAction(formData: FormData): Promise<void> {
  await requireAuth()
  const id = Number(formData.get('id'))
  if (Number.isInteger(id) && id > 0) {
    await updateHeroSlideText(id, {
      title: String(formData.get('title') ?? ''),
      subtitle: String(formData.get('subtitle') ?? ''),
      alt: String(formData.get('alt') ?? ''),
    })
    refreshHero()
  }
  redirect('/admin/hero')
}

export async function deleteHeroSlideAction(formData: FormData): Promise<void> {
  await requireAuth()
  const id = Number(formData.get('id'))
  if (Number.isInteger(id) && id > 0) {
    const slide = await getHeroSlideById(id)
    await deleteHeroSlide(id)
    if (slide) await deleteHeroImage(slide.blobPathname)
    refreshHero()
  }
  redirect('/admin/hero')
}

export async function toggleHeroSlideAction(formData: FormData): Promise<void> {
  await requireAuth()
  const id = Number(formData.get('id'))
  const published = formData.get('published') === 'true'
  if (Number.isInteger(id) && id > 0) {
    await setHeroSlidePublished(id, published)
    refreshHero()
  }
  redirect('/admin/hero')
}

export async function moveHeroSlideAction(formData: FormData): Promise<void> {
  await requireAuth()
  const id = Number(formData.get('id'))
  const direction = formData.get('direction') === 'up' ? 'up' : 'down'
  if (Number.isInteger(id) && id > 0) {
    await moveHeroSlide(id, direction)
    refreshHero()
  }
  redirect('/admin/hero')
}
