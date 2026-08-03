/**
 * 게시물 본문(HTML/텍스트)에서 유튜브 영상 ID를 찾아내는 유틸.
 * 관리자가 본문에 유튜브 링크를 넣으면 동영상 게시물 상세에서 플레이어로 재생한다.
 */

// 유튜브 영상 ID는 11자리 [A-Za-z0-9_-]
const ID = '([A-Za-z0-9_-]{11})'
const PATTERNS: RegExp[] = [
  new RegExp(`youtube\\.com/watch\\?[^"'\\s<>]*?[?&]?v=${ID}`, 'i'),
  new RegExp(`youtu\\.be/${ID}`, 'i'),
  new RegExp(`youtube\\.com/embed/${ID}`, 'i'),
  new RegExp(`youtube\\.com/shorts/${ID}`, 'i'),
  new RegExp(`youtube\\.com/live/${ID}`, 'i'),
]

/** 문자열(본문 HTML 등)에서 첫 유튜브 영상 ID를 추출한다. 없으면 null. */
export function extractYouTubeId(source: string | null | undefined): string | null {
  if (!source) return null
  for (const re of PATTERNS) {
    const m = source.match(re)
    if (m?.[1]) return m[1]
  }
  return null
}

/** 임베드용 유튜브 URL (privacy-enhanced 도메인 사용) */
export function youTubeEmbedUrl(id: string): string {
  return `https://www.youtube-nocookie.com/embed/${id}`
}

/** 목록 카드용 유튜브 썸네일 이미지 URL (항상 존재하는 hqdefault 사용) */
export function youTubeThumbnailUrl(id: string): string {
  return `https://img.youtube.com/vi/${id}/hqdefault.jpg`
}
