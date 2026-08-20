import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { canViewOffice } from '@/lib/auth'
import { PageHero } from '@/components/ui/PageHero'
import { OfficeLoginForm } from './LoginForm'

export const metadata: Metadata = { title: '사무국 로그인' }
export const dynamic = 'force-dynamic'

export default async function OfficeLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>
}) {
  if (await canViewOffice()) redirect('/board/office')

  const { next } = await searchParams
  // 열린 리다이렉트 방지: 사무국 게시판 안쪽 경로만 되돌려준다.
  const safeNext = next?.startsWith('/board/office') && !next.startsWith('//') ? next : '/board/office'

  return (
    <>
      <PageHero label="Board" title="사무국" icon="🗂️" maxWidth="max-w-md" />

      <div className="py-16 px-6">
        <div className="max-w-md mx-auto">
          <p className="text-sm text-gray-500 leading-relaxed mb-5">
            사무국 게시판은 내부 자료 공간입니다. 열람 비밀번호를 입력해 주세요.
            <br />
            <span className="text-gray-400">
              별도 열람 비밀번호(OFFICE_PASSWORD)를 정하지 않았다면 관리자 비밀번호로 들어갑니다.
            </span>
          </p>
          <OfficeLoginForm next={safeNext} />
          <div className="mt-6 text-center">
            <Link href="/board" className="text-sm text-gray-400 hover:text-primary-darker transition-colors">
              ← 게시판 홈으로
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
