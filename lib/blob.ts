import 'server-only'
import crypto from 'node:crypto'
import { MAX_UPLOAD_BYTES, MAX_UPLOAD_LABEL } from '@/lib/uploadLimits'

// 업로드 파일 저장소. 원래 Vercel Blob 이었으나 Hobby 무료 한도 초과로 Cloudinary 로 옮겼다.
// 함수 이름과 반환 형태는 그대로 두어 호출부를 바꾸지 않는다.
// pathname 에는 Cloudinary public_id 를 담는다(삭제 시 사용).

// 상한은 lib/uploadLimits.ts 한 곳에서 관리한다(클라이언트 폼과 공유).
const MAX_BYTES = MAX_UPLOAD_BYTES
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif']

export class UploadError extends Error {}

const FOLDER = 'belife'

function hasToken(): boolean {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET,
  )
}

const MISSING_CONFIG =
  'CLOUDINARY_CLOUD_NAME / CLOUDINARY_API_KEY / CLOUDINARY_API_SECRET 환경변수가 설정되지 않아 업로드할 수 없습니다.'

/** Cloudinary 서명: 파라미터를 키 순으로 k=v&... 로 이어 붙이고 API secret 을 덧붙여 SHA-1. */
function sign(params: Record<string, string>): string {
  const toSign = Object.keys(params)
    .sort()
    .map(k => `${k}=${params[k]}`)
    .join('&')
  return crypto.createHash('sha1').update(toSign + process.env.CLOUDINARY_API_SECRET).digest('hex')
}

function endpoint(resourceType: 'image' | 'raw', action: 'upload' | 'destroy'): string {
  return `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/${resourceType}/${action}`
}

/** 충돌 방지용 짧은 무작위 접미사 (Blob 의 addRandomSuffix 대체) */
function randomSuffix(): string {
  return crypto.randomBytes(6).toString('hex')
}

async function uploadToCloudinary(
  file: File,
  publicId: string,
  resourceType: 'image' | 'raw',
): Promise<{ url: string; pathname: string }> {
  const params = { public_id: publicId, timestamp: String(Math.floor(Date.now() / 1000)) }
  const form = new FormData()
  form.append('file', file)
  for (const [k, v] of Object.entries(params)) form.append(k, v)
  form.append('api_key', process.env.CLOUDINARY_API_KEY!)
  form.append('signature', sign(params))

  const res = await fetch(endpoint(resourceType, 'upload'), { method: 'POST', body: form })
  const json = (await res.json().catch(() => ({}))) as { secure_url?: string; public_id?: string; error?: { message?: string } }
  if (!res.ok || !json.secure_url || !json.public_id) {
    throw new Error(`Cloudinary 업로드 실패: ${json.error?.message ?? res.status}`)
  }
  // raw 는 public_id 에 확장자가 포함되므로 삭제 시 구분할 수 있게 접두어를 붙인다.
  return { url: json.secure_url, pathname: resourceType === 'raw' ? `raw:${json.public_id}` : json.public_id }
}

/** 이미지 public_id: belife/<폴더>/<이름>-<무작위>. 확장자는 Cloudinary 가 붙인다. */
function imagePublicId(folder: string, base: string): string {
  return `${FOLDER}/${folder}/${base}-${randomSuffix()}`
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
    throw new UploadError(`이미지 용량은 ${MAX_UPLOAD_LABEL} 이하여야 합니다.`)
  }
  if (!hasToken()) {
    throw new UploadError(MISSING_CONFIG)
  }

  // 반환된 pathname(public_id)은 슬라이드 삭제 시 원본 정리에 쓰인다.
  return uploadToCloudinary(file, imagePublicId('hero', 'slide'), 'image')
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
    throw new UploadError(`이미지 용량은 ${MAX_UPLOAD_LABEL} 이하여야 합니다.`)
  }
  if (!hasToken()) {
    throw new UploadError(MISSING_CONFIG)
  }

  return uploadToCloudinary(file, imagePublicId('board/uploads', 'img'), 'image')
}

/**
 * '오시는 길' 약도 이미지 업로드. location/ 경로에 저장.
 * 검증 실패/미설정 시 UploadError 를 던진다.
 */
export async function uploadLocationImage(file: File): Promise<UploadedImage> {
  if (!file || file.size === 0) {
    throw new UploadError('이미지 파일을 선택해 주세요.')
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new UploadError('JPG, PNG, WEBP, AVIF, GIF 형식의 이미지만 업로드할 수 있습니다.')
  }
  if (file.size > MAX_BYTES) {
    throw new UploadError(`이미지 용량은 ${MAX_UPLOAD_LABEL} 이하여야 합니다.`)
  }
  if (!hasToken()) {
    throw new UploadError(MISSING_CONFIG)
  }

  return uploadToCloudinary(file, imagePublicId('location', 'map'), 'image')
}

/**
 * 게시판 본문 첨부파일로 허용하는 확장자 (값은 해당 형식의 Content-Type).
 *
 * 브라우저가 보내는 file.type 은 믿지 않는다. 한글(.hwp) 처럼 OS 마다 빈 값이나
 * application/octet-stream 으로 오는 형식이 있고, 반대로 확장자만 바꾼 HTML 을
 * 올려 저장소 도메인에서 스크립트가 실행되게 만들 수도 있기 때문이다. 확장자로 판단한다.
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
  if (!ATTACHMENT_TYPES[ext]) {
    throw new UploadError(
      `첨부할 수 없는 형식입니다. (가능: ${ATTACHMENT_EXTENSIONS.join(', ')})`,
    )
  }
  if (file.size > MAX_BYTES) {
    throw new UploadError(`첨부파일 용량은 ${MAX_UPLOAD_LABEL} 이하여야 합니다.`)
  }
  if (!hasToken()) {
    throw new UploadError(MISSING_CONFIG)
  }

  // Cloudinary 는 raw 파일을 application/octet-stream 으로 내려주므로 확장자를 속인 HTML 도
  // 브라우저에서 실행되지 않는다. 확장자 허용 목록(위) 검사는 그대로 유지한다.
  const result = await uploadToCloudinary(file, `${FOLDER}/board/files/attachment-${randomSuffix()}.${ext}`, 'raw')
  return { ...result, name: file.name, size: file.size }
}

/** 업로드했던 파일을 지운다(실패는 무시). Vercel Blob 시절 경로는 belife/ 로 시작하지 않으므로 건너뛴다. */
export async function deleteHeroImage(pathname: string | null): Promise<void> {
  if (!pathname || !hasToken()) return
  const raw = pathname.startsWith('raw:')
  const publicId = raw ? pathname.slice(4) : pathname
  if (!publicId.startsWith(`${FOLDER}/`)) return
  try {
    const params = { public_id: publicId, timestamp: String(Math.floor(Date.now() / 1000)) }
    const form = new FormData()
    for (const [k, v] of Object.entries(params)) form.append(k, v)
    form.append('api_key', process.env.CLOUDINARY_API_KEY!)
    form.append('signature', sign(params))
    await fetch(endpoint(raw ? 'raw' : 'image', 'destroy'), { method: 'POST', body: form })
  } catch {
    // The DB row is already gone; a dangling blob is not worth failing the request.
  }
}
