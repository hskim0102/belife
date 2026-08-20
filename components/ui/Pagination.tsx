import Link from 'next/link'

/** 현재 페이지 주변 + 처음/끝을 포함한 페이지 토큰(숫자 또는 '…') 생성. */
export function pageWindow(current: number, total: number): (number | '…')[] {
  const span = 2
  const pages = new Set<number>([1, total])
  for (let p = current - span; p <= current + span; p++) {
    if (p >= 1 && p <= total) pages.add(p)
  }
  const sorted = [...pages].sort((a, b) => a - b)
  const out: (number | '…')[] = []
  let prev = 0
  for (const p of sorted) {
    if (p - prev > 1) out.push('…')
    out.push(p)
    prev = p
  }
  return out
}

/**
 * 게시판 목록 공통 페이지네이션.
 * 페이지가 1쪽뿐이면 아무것도 그리지 않는다.
 */
export function Pagination({
  page,
  totalPages,
  hrefFor,
}: {
  page: number
  totalPages: number
  /** 해당 페이지로 가는 링크(필터 같은 다른 쿼리는 호출 측에서 유지한다) */
  hrefFor: (page: number) => string
}) {
  if (totalPages <= 1) return null

  return (
    <div className="flex justify-center items-center gap-1 mt-12">
      {page > 1 && (
        <Link
          href={hrefFor(page - 1)}
          className="h-10 px-3 flex items-center justify-center rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
          aria-label="이전 페이지"
        >
          ←
        </Link>
      )}
      {pageWindow(page, totalPages).map((p, idx) =>
        p === '…' ? (
          <span key={`gap-${idx}`} className="w-10 h-10 flex items-center justify-center text-gray-300">
            …
          </span>
        ) : (
          <Link
            key={p}
            href={hrefFor(p)}
            className={`w-10 h-10 flex items-center justify-center rounded-lg text-sm font-semibold transition-colors ${
              p === page ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {p}
          </Link>
        ),
      )}
      {page < totalPages && (
        <Link
          href={hrefFor(page + 1)}
          className="h-10 px-3 flex items-center justify-center rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
          aria-label="다음 페이지"
        >
          →
        </Link>
      )}
    </div>
  )
}
