import Link from 'next/link'
import { BOARD_CATEGORIES } from '@/lib/boardCategories'

/**
 * 게시판 목록 상단의 형제 게시판 이동 칩.
 * 모든 게시판(사무국 포함)이 같은 줄을 쓰도록 컴포넌트로 뺐다.
 */
export function BoardNav({ current }: { current: string }) {
  return (
    <div className="flex flex-wrap gap-2">
      <Link
        href="/board"
        className="px-4 py-2 rounded-full text-sm font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
      >
        게시판 홈
      </Link>
      {BOARD_CATEGORIES.map(c => (
        <Link
          key={c.key}
          href={`/board/${c.key}`}
          className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
            c.key === current ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          {c.label}
          {/* 로그인해야 볼 수 있는 게시판임을 미리 알린다 */}
          {c.requiresLogin && <span className="ml-1 opacity-70">🔒</span>}
        </Link>
      ))}
    </div>
  )
}
