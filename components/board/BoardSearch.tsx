import Form from 'next/form'
import { BOARD_SEARCH_FIELDS, type BoardSearchField } from '@/lib/boardSearch'

/**
 * 게시판 목록 검색창(범위 선택 + 검색어 + 검색 버튼).
 *
 * next/form 이라 자바스크립트가 없어도 그냥 GET 폼으로 동작하고,
 * 켜져 있으면 전체 새로고침 없이 목록만 바뀐다.
 * 검색하면 항상 1페이지부터 보게 되므로 page 는 일부러 넘기지 않는다.
 */
export function BoardSearch({
  action,
  field,
  query = '',
  keep,
  className = '',
}: {
  /** 결과를 받을 목록 경로(예: /board/notice) */
  action: string
  field: BoardSearchField
  query?: string
  /** 검색해도 유지할 다른 쿼리(예: 분류 태그). 값이 없는 항목은 빠진다. */
  keep?: Record<string, string | undefined>
  className?: string
}) {
  return (
    <Form action={action} className={`flex items-stretch gap-1.5 ${className}`}>
      {Object.entries(keep ?? {}).map(([name, value]) =>
        value ? <input key={name} type="hidden" name={name} value={value} /> : null,
      )}

      <label className="sr-only" htmlFor="board-search-field">
        검색 범위
      </label>
      <select
        id="board-search-field"
        name="sf"
        defaultValue={field}
        className="h-10 rounded-md border border-gray-300 bg-white px-2 text-sm text-gray-700 focus:border-primary focus:outline-none"
      >
        {BOARD_SEARCH_FIELDS.map(f => (
          <option key={f.value} value={f.value}>
            {f.label}
          </option>
        ))}
      </select>

      <label className="sr-only" htmlFor="board-search-query">
        검색어
      </label>
      <input
        id="board-search-query"
        type="search"
        name="q"
        defaultValue={query}
        placeholder="검색어를 입력하세요"
        className="h-10 w-44 sm:w-56 rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-800 placeholder:text-gray-400 focus:border-primary focus:outline-none"
      />

      <button
        type="submit"
        aria-label="검색"
        className="h-10 w-10 shrink-0 flex items-center justify-center rounded-md bg-primary text-white hover:bg-primary-dark transition-colors"
      >
        <svg
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          className="w-4.5 h-4.5"
          aria-hidden="true"
        >
          <circle cx="9" cy="9" r="5.5" />
          <path d="M13.5 13.5 L17.5 17.5" />
        </svg>
      </button>
    </Form>
  )
}
