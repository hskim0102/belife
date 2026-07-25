import { getProgramBySlug, getAllProgramSlugs } from '@/lib/repositories/programs'
import { getMenuPageBySlug } from '@/lib/repositories/menuPages'
import { sanitizePostBody } from '@/lib/sanitize'
import { PageHero } from '@/components/ui/PageHero'
import type { MenuPage } from '@/lib/types'
import { notFound } from 'next/navigation'
import { getCategoryLabel } from '@/lib/utils'
import Link from 'next/link'
import type { Metadata } from 'next'

function ProgramBodyView({ html }: { html: string | null }) {
  if (!html) return <p className="text-gray-400">본문이 없습니다.</p>
  const sanitized = sanitizePostBody(html)
  return (
    <div
      className="prose prose-lg max-w-none prose-headings:font-black prose-p:text-gray-700 prose-p:leading-relaxed prose-img:rounded-xl prose-img:mx-auto"
      dangerouslySetInnerHTML={{ __html: sanitized }}
    />
  )
}

export const revalidate = 60

export async function generateStaticParams() {
  const slugs = await getAllProgramSlugs()
  return slugs.map(slug => ({ slug }))
}

/** 사업(programs) 메뉴에 관리자가 등록한 CMS 페이지. 사업 상세가 아닐 때 폴백. */
async function getProgramsMenuPage(slug: string): Promise<MenuPage | null> {
  const page = await getMenuPageBySlug(slug)
  return page && page.menu === 'programs' && page.published ? page : null
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const program = await getProgramBySlug(slug)
  if (program) return { title: program.name }
  const page = await getProgramsMenuPage(slug)
  if (page) return { title: page.title }
  return {}
}

/** 상단 배너는 테마 색을 따르고, 분류는 배지 색으로만 구분한다. */
const HERO_STRIP = 'bg-gradient-to-br from-primary-dark via-primary to-primary-darker'

const categoryStyles: Record<string, { badge: string }> = {
  domestic: { badge: 'bg-emerald-100 text-emerald-700' },
  overseas: { badge: 'bg-teal-100 text-teal-700' },
  education: { badge: 'bg-amber-100 text-amber-700' },
}

function MenuPageView({ page }: { page: MenuPage }) {
  return (
    <>
      <PageHero label="Programs" title={page.title} icon="🌏" maxWidth="max-w-3xl" />

      <div className="py-14 px-6">
        <div className="max-w-3xl mx-auto">
          {page.body ? (
            <div
              className="prose prose-lg max-w-none prose-headings:font-black prose-p:text-gray-700 prose-p:leading-relaxed prose-img:rounded-xl prose-img:mx-auto"
              dangerouslySetInnerHTML={{ __html: sanitizePostBody(page.body) }}
            />
          ) : (
            <p className="text-gray-400">본문이 없습니다.</p>
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

export default async function ProgramDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const program = await getProgramBySlug(slug)
  if (!program) {
    const page = await getProgramsMenuPage(slug)
    if (page) return <MenuPageView page={page} />
    notFound()
  }

  const style = categoryStyles[program.category] ?? categoryStyles.domestic

  return (
    <>
      <div className={`${HERO_STRIP} px-6 py-16`}>
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
          <ProgramBodyView html={program.body} />
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
