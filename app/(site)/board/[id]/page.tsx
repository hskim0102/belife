import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getBoardPostById, incrementBoardPostViews } from '@/lib/repositories/board'
import { formatDate, getCategoryLabel } from '@/lib/utils'

// View counting must run on every visit.
export const dynamic = 'force-dynamic'

const categoryColors: Record<string, string> = {
  notice: 'bg-blue-100 text-blue-700',
  general: 'bg-gray-100 text-gray-600',
  faq: 'bg-purple-100 text-purple-700',
}

function parseId(value: string): number | null {
  const id = Number(value)
  return Number.isInteger(id) && id > 0 ? id : null
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const numId = parseId(id)
  if (!numId) return {}
  const post = await getBoardPostById(numId)
  return post ? { title: post.title } : {}
}

export default async function BoardDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const numId = parseId(id)
  if (!numId) notFound()

  const post = await getBoardPostById(numId)
  if (!post || !post.published) notFound()

  await incrementBoardPostViews(numId)

  return (
    <article className="py-12 px-6">
      <div className="max-w-3xl mx-auto">
        <Link href="/board" className="text-sm text-gray-400 hover:text-primary transition-colors">
          ← 게시판으로
        </Link>

        <div className="mt-4 pb-6 border-b-2 border-gray-900">
          <span
            className={`text-xs font-bold px-2.5 py-1 rounded-full ${
              categoryColors[post.category] ?? 'bg-gray-100 text-gray-600'
            }`}
          >
            {getCategoryLabel(post.category)}
          </span>
          <h1 className="mt-3 text-2xl md:text-3xl font-black text-gray-900 leading-snug">{post.title}</h1>
          <div className="mt-3 flex items-center gap-3 text-sm text-gray-400">
            <span>{post.author}</span>
            <span>·</span>
            <span>{formatDate(post.createdAt)}</span>
            <span>·</span>
            <span>조회 {post.views + 1}</span>
          </div>
        </div>

        <div className="py-8 whitespace-pre-wrap leading-relaxed text-gray-800 text-[15px] min-h-[200px]">
          {post.body}
        </div>

        <div className="pt-6 border-t border-gray-100">
          <Link
            href="/board"
            className="inline-flex items-center px-5 py-2.5 rounded-full bg-gray-100 text-gray-700 text-sm font-semibold hover:bg-gray-200 transition-colors"
          >
            목록으로
          </Link>
        </div>
      </div>
    </article>
  )
}
