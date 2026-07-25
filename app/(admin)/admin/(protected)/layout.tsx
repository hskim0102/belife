import Link from 'next/link'
import { redirect } from 'next/navigation'
import { isAuthenticated } from '@/lib/auth'
import { logoutAction } from '../actions'
import { AdminNav } from './AdminNav'

export default async function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  if (!(await isAuthenticated())) {
    redirect('/admin/login')
  }

  return (
    <>
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6">
          <div className="h-14 flex items-center justify-between gap-4">
            <Link href="/admin/posts" className="font-black text-gray-900">
              관리자
            </Link>
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
          <AdminNav />
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-6 py-8">{children}</main>
    </>
  )
}
