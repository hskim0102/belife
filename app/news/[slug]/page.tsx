// app/news/[slug]/page.tsx
import { getPostBySlug, getAllPosts } from '@/lib/sanity/queries'
import { notFound } from 'next/navigation'
import { PortableText } from '@portabletext/react'
import { formatDate, getCategoryLabel } from '@/lib/utils'
import Link from 'next/link'
import type { Metadata } from 'next'

export const revalidate = 60

export async function generateStaticParams() {
  const posts = await getAllPosts()
  return posts.map(p => ({ slug: p.slug.current }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const post = await getPostBySlug(slug)
  if (!post) return {}
  return { title: post.title, description: post.excerpt }
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
        </div>
      </div>

      <div className="py-14 px-6">
        <div className="max-w-3xl mx-auto">
          {post.body && (
            <div className="prose prose-lg max-w-none prose-headings:font-black prose-p:text-gray-700 prose-p:leading-relaxed">
              <PortableText value={post.body} />
            </div>
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