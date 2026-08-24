import { Pagination } from '@/components/ui/Pagination'
import { BoardSearch } from '@/components/board/BoardSearch'
import type { BoardSearchField } from '@/lib/boardSearch'

/**
 * 게시판 목록 하단 공통 영역 — 페이지 번호(가운데) + 검색창(오른쪽) + 건수 안내.
 * 모든 게시판이 같은 모양을 쓰도록 한곳에 모아 둔다.
 */
export function BoardListFooter({
  page,
  totalPages,
  total,
  hrefFor,
  searchAction,
  searchField,
  searchQuery,
  searchKeep,
}: {
  page: number
  totalPages: number
  total: number
  /** 해당 페이지로 가는 링크(현재 필터·검색어를 유지해야 한다) */
  hrefFor: (page: number) => string
  /** 검색 결과를 받을 목록 경로(예: /board/notice) */
  searchAction: string
  searchField: BoardSearchField
  searchQuery?: string
  /** 검색해도 유지할 다른 쿼리(예: 분류 태그) */
  searchKeep?: Record<string, string | undefined>
}) {
  return (
    <div className="mt-12 pt-8 border-t border-gray-100">
      {/* 페이지 번호는 항상 화면 가운데. 10개를 다 펼치면 검색창과 한 줄에 들어가지 않아 줄을 나눈다. */}
      <Pagination page={page} totalPages={totalPages} hrefFor={hrefFor} />

      <div className={`flex justify-center sm:justify-end ${totalPages > 1 ? 'mt-6' : ''}`}>
        <BoardSearch
          action={searchAction}
          field={searchField}
          query={searchQuery}
          keep={searchKeep}
        />
      </div>

      <p className="text-center text-xs text-gray-400 mt-6">
        총 {total}개 · {page}/{totalPages} 페이지
      </p>
    </div>
  )
}
