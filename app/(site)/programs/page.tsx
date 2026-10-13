// app/programs/page.tsx
import type { Metadata } from 'next'
import { getCachedPrograms } from '@/lib/cache'
import { ProgramsListClient } from './ProgramsListClient'
import { PageHero } from '@/components/ui/PageHero'

export const metadata: Metadata = { title: '사업 소개' }

// 관리자 화면에서 고치면 revalidatePath·updateTag 로 즉시 갱신되므로, 시간 기반 재생성은 길게 둔다.
export const revalidate = 3600

export default async function ProgramsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>
}) {
  const { category } = await searchParams
  const programs = await getCachedPrograms()
  const initialCategory =
    category === 'domestic' || category === 'overseas' || category === 'education' ? category : 'all'
  return (
    <>
      <PageHero
        label="Programs"
        title="주요 사업"
        subtitle="국내외에서 생명을 살리는 아름다운생명사랑의 주요 사업을 소개합니다."
        icon="🌏"
      />

      <div className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <ProgramsListClient programs={programs} initialCategory={initialCategory} />
        </div>
      </div>
    </>
  )
}