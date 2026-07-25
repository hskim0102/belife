'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

/** 스크롤해도 화면 우측 하단에 계속 따라다니는 후원신청 고정 버튼. */
export function FloatingSupportButton() {
  const pathname = usePathname()
  // 후원 페이지에서는 중복이므로 숨긴다.
  if (pathname.startsWith('/support')) return null

  return (
    <Link
      href="/support"
      aria-label="후원신청 페이지로 이동"
      className="fixed bottom-6 right-6 z-50 inline-flex items-center gap-2.5 bg-gradient-to-br from-primary to-primary-dark text-white text-lg font-bold pl-6 pr-7 py-4 rounded-full shadow-lg shadow-primary/40 hover:from-primary-dark hover:to-primary-darker hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/50 transition-all"
    >
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
      </svg>
      후원신청
    </Link>
  )
}
