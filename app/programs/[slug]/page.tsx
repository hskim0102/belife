// app/programs/[slug]/page.tsx
import { getProgramBySlug, getAllPrograms } from '@/lib/sanity/queries'
import { notFound } from 'next/navigation'
import { getCategoryLabel } from '@/lib/utils'
import { PortableText } from '@portabletext/react'
import Link from 'next/link'
import type { Metadata } from 'next'

export const revalidate = 60

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

const categoryStyles: Record<string, { badge: string; strip: string }> = {
  domestic: { badge: 'bg-emerald-100 text-emerald-700', strip: 'bg-gradient-to-br from-emerald-500 to-teal-600' },
  overseas: { badge: 'bg-blue-100 text-blue-700', strip: 'bg-gradient-to-br from-blue-500 to-indigo-600' },
  education: { badge: 'bg-amber-100 text-amber-700', strip: 'bg-gradient-to-br from-amber-500 to-orange-600' },
}

export default async function ProgramDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const program = await getProgramBySlug(slug)
  if (!program) notFound()

  const style = categoryStyles[program.category] ?? categoryStyles.domestic

  return (
    <>
      <div className={`${style.strip} px-6 py-16`}>
        <div className="max-w-3xl mx-auto">
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${style.badge} mb-4 inline-block`}>
            {getCategoryLabel(program.category)}
          </span>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">{program.name}</h1>
        </div>
      </div>

      <div className="py-14 px-6">
        <div className="max-w-3xl mx-auto">
          <p className="text-gray-600 leading-relaxed text-lg mb-12 border-l-4 border-primary pl-5">{program.description}</p>
          {program.body && (
            <div className="prose prose-lg max-w-none prose-headings:font-black prose-p:text-gray-700 prose-p:leading-relaxed">
              <PortableText value={program.body} />
            </div>
          )}
          <div className="mt-14 pt-8 border-t border-gray-100">
            <Link href="/programs" className="inline-flex items-center gap-2 text-primary font-bold text-sm hover:text-primary-dark transition-colors">
              ← 사업 목록으로 돌아가기
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}