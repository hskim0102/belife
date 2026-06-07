import 'server-only'
import { put, del } from '@vercel/blob'

const MAX_BYTES = 8 * 1024 * 1024 // 8 MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif']

export class UploadError extends Error {}

function hasToken(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN)
}

export interface UploadedImage {
  url: string
  pathname: string
}

/**
 * Upload an image File (from a form submission) to Vercel Blob.
 * Throws UploadError with a user-facing message on validation/config failures.
 */
export async function uploadHeroImage(file: File): Promise<UploadedImage> {
  if (!file || file.size === 0) {
    throw new UploadError('이미지 파일을 선택해 주세요.')
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new UploadError('JPG, PNG, WEBP, AVIF, GIF 형식의 이미지만 업로드할 수 있습니다.')
  }
  if (file.size > MAX_BYTES) {
    throw new UploadError('이미지 용량은 8MB 이하여야 합니다.')
  }
  if (!hasToken()) {
    throw new UploadError(
      'BLOB_READ_WRITE_TOKEN 환경변수가 설정되지 않아 업로드할 수 없습니다. Vercel Blob 스토어를 연결해 주세요.',
    )
  }

  const ext = file.name.includes('.') ? file.name.slice(file.name.lastIndexOf('.')) : ''
  // addRandomSuffix avoids collisions; the returned pathname is stored for later deletion.
  const result = await put(`hero/slide${ext}`, file, {
    access: 'public',
    addRandomSuffix: true,
    contentType: file.type,
  })

  return { url: result.url, pathname: result.pathname }
}

/**
 * 게시판 본문(tiptap 에디터) 이미지 업로드. board/uploads/ 경로에 저장.
 * 검증 실패/미설정 시 UploadError 를 던진다.
 */
export async function uploadPostImage(file: File): Promise<UploadedImage> {
  if (!file || file.size === 0) {
    throw new UploadError('이미지 파일을 선택해 주세요.')
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new UploadError('JPG, PNG, WEBP, AVIF, GIF 형식의 이미지만 업로드할 수 있습니다.')
  }
  if (file.size > MAX_BYTES) {
    throw new UploadError('이미지 용량은 8MB 이하여야 합니다.')
  }
  if (!hasToken()) {
    throw new UploadError(
      'BLOB_READ_WRITE_TOKEN 환경변수가 설정되지 않아 업로드할 수 없습니다. Vercel Blob 스토어를 연결해 주세요.',
    )
  }

  const ext = file.name.includes('.') ? file.name.slice(file.name.lastIndexOf('.')) : ''
  const result = await put(`board/uploads/img${ext}`, file, {
    access: 'public',
    addRandomSuffix: true,
    contentType: file.type,
  })
  return { url: result.url, pathname: result.pathname }
}

/** Best-effort delete of a previously uploaded Blob file. Ignores failures. */
export async function deleteHeroImage(pathname: string | null): Promise<void> {
  if (!pathname || !hasToken()) return
  try {
    await del(pathname)
  } catch {
    // The DB row is already gone; a dangling blob is not worth failing the request.
  }
}
