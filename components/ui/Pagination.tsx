import Link from 'next/link'

/** 한 번에 보여 주는 페이지 번호 개수(1~10, 11~20 …). */
export const PAGE_BLOCK_SIZE = 10

export interface PageBlock {
  /** 현재 블록에 그릴 페이지 번호들(예: 11 ~ 20) */
  pages: number[]
  /** 이전 블록의 마지막 페이지(없으면 null) */
  prevBlockPage: number | null
  /** 다음 블록의 첫 페이지(없으면 null) */
  nextBlockPage: number | null
}

/**
 * 현재 페이지가 속한 10개 단위 블록을 계산한다.
 * 예) 총 37쪽에서 15쪽을 보고 있으면 11~20 을 그리고 앞뒤 블록 이동점을 알려 준다.
 */
export function pageBlock(
  current: number,
  total: number,
  blockSize = PAGE_BLOCK_SIZE,
): PageBlock {
  const totalPages = Math.max(1, Math.trunc(total))
  const page = Math.min(Math.max(1, Math.trunc(current)), totalPages)
  const start = Math.floor((page - 1) / blockSize) * blockSize + 1
  const end = Math.min(start + blockSize - 1, totalPages)

  return {
    pages: Array.from({ length: end - start + 1 }, (_, i) => start + i),
    prevBlockPage: start > 1 ? start - 1 : null,
    nextBlockPage: end < totalPages ? end + 1 : null,
  }
}

const CELL = 'w-9 h-9 flex items-center justify-center rounded-md text-sm font-semibold transition-colors'
const ARROW = `${CELL} border border-gray-300 text-gray-500 hover:border-primary hover:text-primary-darker`

/**
 * 게시판 목록 공통 페이지네이션.
 * 페이지 번호를 10개씩 끊어 보여 주고, 그 앞뒤로만 ‹ › 로 넘어간다.
 * 페이지가 1쪽뿐이면 아무것도 그리지 않는다.
 */
export function Pagination({
  page,
  totalPages,
  hrefFor,
  className = '',
}: {
  page: number
  totalPages: number
  /** 해당 페이지로 가는 링크(필터·검색 같은 다른 쿼리는 호출 측에서 유지한다) */
  hrefFor: (page: number) => string
  className?: string
}) {
  if (totalPages <= 1) return null
  const { pages, prevBlockPage, nextBlockPage } = pageBlock(page, totalPages)

  return (
    <nav aria-label="페이지 이동" className={`flex flex-wrap justify-center items-center gap-1 ${className}`}>
      {prevBlockPage !== null && (
        <Link href={hrefFor(prevBlockPage)} className={ARROW} aria-label="이전 10페이지">
          ‹
        </Link>
      )}
      {pages.map(p => (
        <Link
          key={p}
          href={hrefFor(p)}
          aria-current={p === page ? 'page' : undefined}
          className={`${CELL} ${
            p === page
              ? 'bg-primary-dark text-white'
              : 'text-gray-600 hover:bg-gray-100 hover:text-primary-darker'
          }`}
        >
          {p}
        </Link>
      ))}
      {nextBlockPage !== null && (
        <Link href={hrefFor(nextBlockPage)} className={ARROW} aria-label="다음 10페이지">
          ›
        </Link>
      )}
    </nav>
  )
}
