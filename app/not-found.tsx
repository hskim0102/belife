// app/not-found.tsx
import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6 px-6">
      <h1 className="text-6xl font-black text-primary-lighter">404</h1>
      <p className="text-text-subtle">페이지를 찾을 수 없습니다.</p>
      <Link href="/" className="text-primary font-semibold hover:underline">홈으로 돌아가기</Link>
    </div>
  )
}
