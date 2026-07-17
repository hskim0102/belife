import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { PageHero } from '@/components/ui/PageHero'
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
      <PageHero label="About" title={page.title} icon="🌸" maxWidth="max-w-3xl" />

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
