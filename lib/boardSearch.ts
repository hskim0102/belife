/**
 * 게시판 목록 검색(제목/내용)의 공용 정의.
 *
 * 서버 컴포넌트(페이지)와 클라이언트로 넘어갈 수 있는 검색 폼이 함께 쓰므로
 * server-only 인 repositories 가 아니라 여기에 둔다.
 */

export const BOARD_SEARCH_FIELDS = [
  { value: 'all', label: '전체' },
  { value: 'title', label: '제목' },
  { value: 'body', label: '내용' },
] as const

export type BoardSearchField = (typeof BOARD_SEARCH_FIELDS)[number]['value']

/** 검색어 최대 길이(그 이상은 잘라서 쓴다). */
const MAX_QUERY_LENGTH = 100

/** ?sf= 값을 검색 범위로 해석. 알 수 없는 값은 '전체'. */
export function parseSearchField(value: string | undefined): BoardSearchField {
  return BOARD_SEARCH_FIELDS.some(f => f.value === value)
    ? (value as BoardSearchField)
    : 'all'
}

/** ?q= 값을 검색어로 정규화. 공백뿐이면 undefined(검색 안 함). */
export function parseSearchQuery(value: string | undefined): string | undefined {
  const q = (value ?? '').trim().slice(0, MAX_QUERY_LENGTH)
  return q || undefined
}
