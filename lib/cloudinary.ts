// Cloudinary 이미지 URL 에 변환 파라미터를 붙이는 도우미. 서버·클라이언트 공용.
//
// 업로드된 이미지 URL 은 .../image/upload/v123/belife/... 형태다.
// upload/ 바로 뒤에 f_auto(WebP/AVIF 자동), q_auto(화질 자동), w_<폭>(c_limit: 원본보다 키우지 않음)
// 을 끼워 넣으면 Cloudinary 가 변환본을 만들어 CDN 에 캐시한다.
// Cloudinary 이미지가 아니면(로컬 정적 파일, YouTube 썸네일 등) 그대로 돌려준다.

const UPLOAD_RE = /^(https:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\/)(.+)$/

export function isCloudinaryImage(src: string): boolean {
  return UPLOAD_RE.test(src)
}

export function cloudinaryUrl(src: string, width?: number): string {
  const m = src.match(UPLOAD_RE)
  if (!m) return src
  const params = ['f_auto', 'q_auto', ...(width ? ['c_limit', `w_${width}`] : [])]
  return `${m[1]}${params.join(',')}/${m[2]}`
}
