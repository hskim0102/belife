import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { canViewOffice } from '@/lib/auth'
import { getPostBySlug } from '@/lib/repositories/posts'
import { sanitizePostBody } from '@/lib/sanitize'
import { formatDate } from '@/lib/utils'
import { PageHero } from '@/components/ui/PageHero'

// 열람 권한이 없는 사람에게는 제목도 보이면 안 되므로 메타데이터도 감춘다.
export const metadata: Metadata = { title: '사무국', robots: { index: false, follow: false } }
export const dynamic = 'force-dynamic'

export default async function OfficePostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  if (!(await canViewOffice())) {
    redirect(`/board/office/login?next=${encodeURIComponent(`/board/office/${slug}`)}`)
  }

  const post = await getPostBySlug(slug)
  if (!post || post.category !== 'office') notFound()

  return (
    <>
      <PageHero maxWidth="max-w-3xl">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-white/20 text-white">사무국</span>
          <span className="text-white/50 text-sm">{formatDate(post.publishedAt)}</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-black text-white leading-tight">{post.title}</h1>
      </PageHero>

      <div className="py-14 px-6">
        <div className="max-w-3xl mx-auto">
          {post.body ? (
            <div
              className="prose prose-lg max-w-none prose-headings:font-black prose-p:text-gray-700 prose-p:leading-relaxed prose-img:rounded-xl prose-img:mx-auto"
              dangerouslySetInnerHTML={{ __html: sanitizePostBody(post.body) }}
            />
          ) : (
            <p className="text-gray-400">본문이 없습니다.</p>
          )}

          <div className="mt-12 pt-6 border-t border-gray-100">
            <Link
              href="/board/office"
              className="text-sm font-semibold text-gray-500 hover:text-primary-darker transition-colors"
            >
              ← 사무국 목록으로
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
