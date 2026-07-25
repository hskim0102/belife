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

/**
 * 게시판 본문 첨부파일로 허용하는 확장자 → 저장할 Content-Type.
 *
 * 브라우저가 보내는 file.type 은 믿지 않는다. 한글(.hwp) 처럼 OS 마다 빈 값이나
 * application/octet-stream 으로 오는 형식이 있고, 반대로 확장자만 바꾼 HTML 을
 * text/html 로 올려 Blob 도메인에서 스크립트가 실행되게 만들 수도 있기 때문이다.
 * 확장자로 판단하고, 내려줄 Content-Type 도 이 표에서 고정한다.
 */
const ATTACHMENT_TYPES: Record<string, string> = {
  // 문서
  pdf: 'application/pdf',
  hwp: 'application/x-hwp',
  hwpx: 'application/hwp+zip',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  xls: 'application/vnd.ms-excel',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ppt: 'application/vnd.ms-powerpoint',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  csv: 'text/csv',
  // 이미지 (SVG 는 스크립트를 품을 수 있어 제외)
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  gif: 'image/gif',
  webp: 'image/webp',
  avif: 'image/avif',
}

export const ATTACHMENT_EXTENSIONS = Object.keys(ATTACHMENT_TYPES)

export interface UploadedFile {
  url: string
  pathname: string
  name: string
  size: number
}

/**
 * 게시판 본문 첨부파일 업로드. board/files/ 경로에 저장.
 * 검증 실패/미설정 시 UploadError 를 던진다.
 */
export async function uploadPostFile(file: File): Promise<UploadedFile> {
  if (!file || file.size === 0) {
    throw new UploadError('파일을 선택해 주세요.')
  }

  const dot = file.name.lastIndexOf('.')
  const ext = dot >= 0 ? file.name.slice(dot + 1).toLowerCase() : ''
  const contentType = ATTACHMENT_TYPES[ext]
  if (!contentType) {
    throw new UploadError(
      `첨부할 수 없는 형식입니다. (가능: ${ATTACHMENT_EXTENSIONS.join(', ')})`,
    )
  }
  if (file.size > MAX_BYTES) {
    throw new UploadError('첨부파일 용량은 8MB 이하여야 합니다.')
  }
  if (!hasToken()) {
    throw new UploadError(
      'BLOB_READ_WRITE_TOKEN 환경변수가 설정되지 않아 업로드할 수 없습니다. Vercel Blob 스토어를 연결해 주세요.',
    )
  }

  const result = await put(`board/files/attachment.${ext}`, file, {
    access: 'public',
    addRandomSuffix: true,
    contentType,
  })
  return { url: result.url, pathname: result.pathname, name: file.name, size: file.size }
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
