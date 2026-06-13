// app/programs/page.tsx
import type { Metadata } from 'next'
import { getAllPrograms } from '@/lib/repositories/programs'
import { ProgramsListClient } from './ProgramsListClient'
import { SectionLabel } from '@/components/ui/SectionLabel'

export const metadata: Metadata = { title: '사업 소개' }

export const revalidate = 60

export default async function ProgramsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>
}) {
  const { category } = await searchParams
  const programs = await getAllPrograms()
  const initialCategory =
    category === 'domestic' || category === 'overseas' || category === 'education' ? category : 'all'
  return (
    <>
      <div className="bg-gradient-to-br from-primary-darker to-primary-dark px-6 py-16">
        <div className="max-w-6xl mx-auto">
          <SectionLabel>Programs</SectionLabel>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">주요 사업</h1>
        </div>
      </div>

      <div className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <ProgramsListClient programs={programs} initialCategory={initialCategory} />
        </div>
      </div>
    </>
  )
}