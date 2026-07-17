import { getPostBySlug } from '@/lib/repositories/posts'
import { notFound } from 'next/navigation'
import { formatDate } from '@/lib/utils'
import { sanitizePostBody } from '@/lib/sanitize'
import { getBoardCategory, isBoardCategory } from '@/lib/boardCategories'
import Link from 'next/link'
import type { Metadata } from 'next'
import { CommentSection } from '@/components/board/CommentSection'
import { PageHero } from '@/components/ui/PageHero'

export const revalidate = 60

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string; slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const post = await getPostBySlug(slug)
  if (!post) return {}
  return { title: post.title, description: post.excerpt ?? undefined }
}

export default async function BoardDetailPage({
  params,
}: {
  params: Promise<{ category: string; slug: string }>
}) {
  const { category, slug } = await params
  if (!isBoardCategory(category)) notFound()
  const post = await getPostBySlug(slug)
  // slug 는 유니크하지만, 카테고리 경로와 글의 실제 카테고리가 일치해야 정상 URL.
  if (!post || post.category !== category) notFound()
  const cat = getBoardCategory(category)!

  return (
    <>
      <PageHero maxWidth="max-w-3xl">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-white/20 text-white">
            {cat.label}
          </span>
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

          <CommentSection postId={post.id} />

          <div className="mt-14 pt-8 border-t border-gray-100">
            <Link
              href={`/board/${category}`}
              className="inline-flex items-center gap-2 text-primary font-bold text-sm hover:text-primary-dark transition-colors"
            >
              ← {cat.label} 목록으로
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
