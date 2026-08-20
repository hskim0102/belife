'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { isAuthenticated } from '@/lib/auth'
import { uploadLocationImage, UploadError } from '@/lib/blob'
import {
  DEFAULT_LOCATION,
  getLocationSettings,
  updateLocationSettings,
} from '@/lib/repositories/location'

export interface LocationFormState {
  error?: string
  saved?: boolean
}

/**
 * 지도 embed 주소는 iframe 의 src 로 그대로 들어가므로 구글 지도 embed 만 허용한다.
 * (임의의 주소를 넣어 다른 사이트를 페이지 안에 띄우지 못하게 막는다)
 */
const ALLOWED_MAP_PREFIX = 'https://www.google.com/maps/embed'

/** 붙여넣은 값이 iframe 태그 전체여도 src 만 뽑아 쓴다. */
function extractMapSrc(raw: string): string {
  const trimmed = raw.trim()
  if (!trimmed) return ''
  const match = trimmed.match(/src\s*=\s*["']([^"']+)["']/i)
  return (match ? match[1] : trimmed).trim()
}

export async function updateLocationAction(
  _prev: LocationFormState,
  formData: FormData,
): Promise<LocationFormState> {
  if (!(await isAuthenticated())) redirect('/admin/login')

  const text = (name: string) => String(formData.get(name) ?? '').trim()

  const address = text('address')
  const mapQuery = text('mapQuery')
  if (!address) return { error: '주소를 입력해 주세요.' }
  if (!mapQuery) return { error: '지도 검색용 주소를 입력해 주세요.' }

  const mapEmbed = extractMapSrc(text('mapEmbed'))
  if (mapEmbed && !mapEmbed.startsWith(ALLOWED_MAP_PREFIX)) {
    return {
      error: `지도 주소는 '${ALLOWED_MAP_PREFIX}…' 형식이어야 합니다. 구글 지도의 '지도 퍼가기'에서 복사한 주소를 붙여넣어 주세요.`,
    }
  }

  // 새 약도 이미지를 올렸을 때만 교체하고, 아니면 기존 이미지를 유지한다.
  const current = await getLocationSettings()
  let mapImage = current.mapImage
  const file = formData.get('mapImageFile')
  if (file instanceof File && file.size > 0) {
    try {
      const uploaded = await uploadLocationImage(file)
      mapImage = uploaded.url
    } catch (err) {
      if (err instanceof UploadError) return { error: err.message }
      return { error: '이미지 업로드 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.' }
    }
  }

  await updateLocationSettings({
    heroSubtitle: text('heroSubtitle') || DEFAULT_LOCATION.heroSubtitle,
    address,
    mapQuery,
    mapEmbed: mapEmbed || DEFAULT_LOCATION.mapEmbed,
    transitBody: text('transitBody'),
    carBody: text('carBody'),
    mapImage,
    mapImageAlt: text('mapImageAlt') || DEFAULT_LOCATION.mapImageAlt,
  })

  revalidatePath('/intro/location')
  revalidatePath('/admin/location')
  return { saved: true }
}
