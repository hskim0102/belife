import Link from 'next/link'
import { redirect } from 'next/navigation'
import { isAuthenticated } from '@/lib/auth'
import { logoutAction } from '../actions'

export default async function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  if (!(await isAuthenticated())) {
    redirect('/admin/login')
  }

  return (
    <>
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/admin/posts" className="font-black text-gray-900">
              관리자
            </Link>
            <nav className="flex items-center gap-4 text-sm">
              <Link href="/admin/news" className="text-gray-600 hover:text-primary font-semibold transition-colors">
                소식
              </Link>
              <Link href="/admin/posts" className="text-gray-600 hover:text-primary font-semibold transition-colors">
                게시판 글
              </Link>
              <Link href="/admin/programs" className="text-gray-600 hover:text-primary font-semibold transition-colors">
                사업
              </Link>
              <Link href="/admin/hero" className="text-gray-600 hover:text-primary font-semibold transition-colors">
                메인 배너
              </Link>
              <Link href="/admin/pages" className="text-gray-600 hover:text-primary font-semibold transition-colors">
                메뉴 페이지
              </Link>
              <Link href="/admin/members" className="text-gray-600 hover:text-primary font-semibold transition-colors">
                함께하는 사람들
              </Link>
              <Link href="/admin/milestones" className="text-gray-600 hover:text-primary font-semibold transition-colors">
                발자취
              </Link>
              <Link href="/admin/notifications" className="text-gray-600 hover:text-primary font-semibold transition-colors">
                팝업 알림
              </Link>
              <Link href="/admin/mission-cards" className="text-gray-600 hover:text-primary font-semibold transition-colors">
                소명 카드
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <Link href="/" className="text-gray-400 hover:text-gray-700 transition-colors" target="_blank">
              사이트 보기 ↗
            </Link>
            <form action={logoutAction}>
              <button type="submit" className="text-gray-500 hover:text-red-600 font-semibold transition-colors">
                로그아웃
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-6 py-8">{children}</main>
    </>
  )
}
