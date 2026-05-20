// app/not-found.tsx
import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-5 px-6 text-center">
      <div className="w-20 h-20 rounded-full bg-primary-light flex items-center justify-center mb-2">
        <span className="text-primary text-3xl font-black">404</span>
      </div>
      <h1 className="text-2xl font-black text-gray-900">페이지를 찾을 수 없습니다</h1>
      <p className="text-gray-500 max-w-sm">요청하신 페이지가 존재하지 않거나 이동된 것 같습니다.</p>
      <Link href="/" className="inline-block bg-primary text-white font-bold px-7 py-3 rounded-full text-sm hover:bg-primary-dark transition-colors mt-2">
        홈으로 돌아가기
      </Link>
    </div>
  )
}