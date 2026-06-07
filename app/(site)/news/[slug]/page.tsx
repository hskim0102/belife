import { getPostBySlug, getAllPostSlugs } from '@/lib/repositories/posts'
import { notFound } from 'next/navigation'
import { formatDate, getCategoryLabel } from '@/lib/utils'
import { sanitizePostBody } from '@/lib/sanitize'
import Link from 'next/link'
import type { Metadata } from 'next'

export const revalidate = 60

export async function generateStaticParams() {
  const slugs = await getAllPostSlugs()
  return slugs.map(slug => ({ slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const post = await getPostBySlug(slug)
  if (!post) return {}
  return { title: post.title, description: post.excerpt ?? undefined }
}

const categoryColors: Record<string, string> = {
  notice: 'bg-blue-100 text-blue-700',
  news: 'bg-emerald-100 text-emerald-700',
  event: 'bg-purple-100 text-purple-700',
}

export default async function NewsDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await getPostBySlug(slug)
  if (!post) notFound()

  return (
    <>
      <div className="bg-gradient-to-br from-primary-darker to-primary-dark px-6 py-16">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-2 mb-4">
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${categoryColors[post.category] ?? 'bg-white/20 text-white'}`}>
              {getCategoryLabel(post.category)}
            </span>
            <span className="text-white/50 text-sm">{formatDate(post.publishedAt)}</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white leading-tight">{post.title}</h1>
          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {post.tags.map(tag => (
                <span key={tag} className="text-xs font-semibold text-white bg-white/15 px-2.5 py-1 rounded-full">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="py-14 px-6">
        <div className="max-w-3xl mx-auto">
          {post.body && (
            <div
              className="prose prose-lg max-w-none prose-headings:font-black prose-p:text-gray-700 prose-p:leading-relaxed prose-img:rounded-xl prose-img:mx-auto"
              dangerouslySetInnerHTML={{ __html: sanitizePostBody(post.body) }}
            />
          )}
          <div className="mt-14 pt-8 border-t border-gray-100">
            <Link href="/news" className="inline-flex items-center gap-2 text-primary font-bold text-sm hover:text-primary-dark transition-colors">
              ← 목록으로 돌아가기
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
