import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { isAuthenticated } from '@/lib/auth'
import { LoginForm } from './LoginForm'

export const metadata: Metadata = { title: '로그인' }

export default async function LoginPage() {
  if (await isAuthenticated()) {
    redirect('/admin/posts')
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-black text-gray-900">관리자 로그인</h1>
          <p className="mt-2 text-sm text-gray-400">아름다운생명사랑 게시판 관리</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
          <LoginForm />
        </div>
      </div>
    </div>
  )
}
