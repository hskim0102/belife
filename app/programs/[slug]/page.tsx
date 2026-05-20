// app/programs/[slug]/page.tsx
import { getProgramBySlug, getAllPrograms } from '@/lib/sanity/queries'
import { notFound } from 'next/navigation'
import { getCategoryLabel } from '@/lib/utils'
import { PortableText } from '@portabletext/react'
import type { Metadata } from 'next'

export async function generateStaticParams() {
  const programs = await getAllPrograms()
  return programs.map(p => ({ slug: p.slug.current }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const program = await getProgramBySlug(slug)
  if (!program) return {}
  return { title: program.name }
}

export default async function ProgramDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const program = await getProgramBySlug(slug)
  if (!program) notFound()

  return (
    <div className="py-20 px-6">
      <div className="max-w-3xl mx-auto">
        <span className="text-xs font-semibold text-primary">{getCategoryLabel(program.category)}</span>
        <h1 className="text-4xl font-black mt-2 mb-6">{program.name}</h1>
        <p className="text-text-subtle leading-relaxed text-lg mb-10">{program.description}</p>
        {program.body && (
          <div className="prose prose-lg max-w-none text-text leading-relaxed">
            <PortableText value={program.body as Parameters<typeof PortableText>[0]['value']} />
          </div>
        )}
      </div>
    </div>
  )
}
