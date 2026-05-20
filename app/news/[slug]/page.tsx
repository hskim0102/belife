// app/news/[slug]/page.tsx
import { getPostBySlug, getAllPosts } from '@/lib/sanity/queries'
import { notFound } from 'next/navigation'
import { PortableText } from '@portabletext/react'
import { formatDate, getCategoryLabel } from '@/lib/utils'
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

export default async function NewsDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await getPostBySlug(slug)
  if (!post) notFound()

  return (
    <div className="py-20 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-sm font-semibold text-primary">{getCategoryLabel(post.category)}</span>
          <span className="text-sm text-text-subtle">{formatDate(post.publishedAt)}</span>
        </div>
        <h1 className="text-3xl font-black mb-10 leading-tight">{post.title}</h1>
        {post.body && (
          <div className="prose prose-lg max-w-none text-text leading-relaxed">
            <PortableText value={post.body} />
          </div>
        )}
      </div>
    </div>
  )
}
