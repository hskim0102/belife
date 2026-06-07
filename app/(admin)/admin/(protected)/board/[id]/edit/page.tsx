import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getBoardPostById } from '@/lib/repositories/board'
import { updateBoardPostAction } from '../../../../actions'
import { PostForm } from '../../PostForm'

export const metadata: Metadata = { title: '게시물 수정' }

function parseId(value: string): number | null {
  const id = Number(value)
  return Number.isInteger(id) && id > 0 ? id : null
}

export default async function EditBoardPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const numId = parseId(id)
  if (!numId) notFound()

  const post = await getBoardPostById(numId)
  if (!post) notFound()

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between">
        <Link href="/admin/board" className="text-sm text-gray-400 hover:text-primary transition-colors">
          ← 목록으로
        </Link>
        <Link
          href={`/board/${post.id}`}
          target="_blank"
          className="text-sm text-gray-400 hover:text-primary transition-colors"
        >
          게시물 보기 ↗
        </Link>
      </div>
      <h1 className="mt-3 mb-6 text-xl font-black text-gray-900">게시물 수정</h1>
      <PostForm action={updateBoardPostAction} post={post} submitLabel="수정 완료" />
    </div>
  )
}
