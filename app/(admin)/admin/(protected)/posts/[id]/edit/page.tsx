import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPostById } from '@/lib/repositories/posts'
import { updatePostAction } from '../../../../post-actions'
import { PostEditorForm } from '../../PostEditorForm'
import { BOARD_CATEGORIES } from '@/lib/boardCategories'

export const metadata: Metadata = { title: '게시물 수정' }

const boardOptions = BOARD_CATEGORIES.map(c => ({ value: c.key, label: c.label }))

function parseId(value: string): number | null {
  const id = Number(value)
  return Number.isInteger(id) && id > 0 ? id : null
}

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const numId = parseId(id)
  if (!numId) notFound()

  const post = await getPostById(numId)
  if (!post) notFound()

  const viewHref = `/board/${post.category}/${post.slug}`

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between">
        <Link href="/admin/posts" className="text-sm text-gray-400 hover:text-primary transition-colors">
          ← 목록으로
        </Link>
        <Link href={viewHref} target="_blank" className="text-sm text-gray-400 hover:text-primary transition-colors">
          게시물 보기 ↗
        </Link>
      </div>
      <h1 className="mt-3 mb-6 text-xl font-black text-gray-900">게시물 수정</h1>
      <PostEditorForm
        action={updatePostAction}
        post={post}
        submitLabel="수정 완료"
        categoryOptions={boardOptions}
      />
    </div>
  )
}
