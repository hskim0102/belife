import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { SectionLabel } from '@/components/ui/SectionLabel'
import { getMenuPageBySlug } from '@/lib/repositories/menuPages'
import { sanitizePostBody } from '@/lib/sanitize'

export const revalidate = 60

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const page = await getMenuPageBySlug(slug)
  if (!page || page.menu !== 'intro' || !page.published) return {}
  return { title: page.title }
}

export default async function IntroMenuPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const page = await getMenuPageBySlug(slug)
  if (!page || page.menu !== 'intro' || !page.published) notFound()

  return (
    <>
      <div className="bg-gradient-to-br from-primary-darker to-primary-dark px-6 py-16">
        <div className="max-w-3xl mx-auto">
          <SectionLabel>About</SectionLabel>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">{page.title}</h1>
        </div>
      </div>

      <div className="py-16 px-6">
        <div className="max-w-3xl mx-auto">
          {page.body ? (
            <div
              className="prose prose-lg max-w-none prose-headings:font-black prose-p:text-gray-700 prose-p:leading-relaxed prose-img:rounded-xl prose-img:mx-auto"
              dangerouslySetInnerHTML={{ __html: sanitizePostBody(page.body) }}
            />
          ) : (
            <p className="text-gray-400">본문이 없습니다.</p>
          )}
        </div>
      </div>
    </>
  )
}
