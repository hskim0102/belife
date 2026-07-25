import { cn } from '@/lib/cn'

/**
 * 섹션과 섹션 사이를 구분하는 장식 구분자.
 * 양쪽으로 흐려지는 가는 선과 가운데 점으로 배경을 가리지 않게 은은하게 표현한다.
 */
export function SectionDivider({ className }: { className?: string }) {
  return (
    <div className={cn('max-w-6xl mx-auto flex items-center gap-4', className)} aria-hidden="true">
      <span className="h-px flex-1 bg-gradient-to-r from-transparent to-primary-muted" />
      <span className="flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-primary-muted" />
        <span className="w-2.5 h-2.5 rounded-full bg-primary" />
        <span className="w-1.5 h-1.5 rounded-full bg-primary-muted" />
      </span>
      <span className="h-px flex-1 bg-gradient-to-l from-transparent to-primary-muted" />
    </div>
  )
}
