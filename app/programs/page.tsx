// app/programs/page.tsx
import type { Metadata } from 'next'
import { getAllPrograms } from '@/lib/sanity/queries'
import { ProgramsListClient } from './ProgramsListClient'

export const metadata: Metadata = { title: '사업' }

export const revalidate = 60

export default async function ProgramsPage() {
  const programs = await getAllPrograms()
  return (
    <div className="py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-black mb-12">주요 사업</h1>
        <ProgramsListClient programs={programs} />
      </div>
    </div>
  )
}
