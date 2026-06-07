import type { Metadata } from 'next'
import Link from 'next/link'
import { createBoardPostAction } from '../../../actions'
import { PostForm } from '../PostForm'

export const metadata: Metadata = { title: '새 게시물' }

export default function NewBoardPostPage() {
  return (
    <div className="max-w-3xl">
      <Link href="/admin/board" className="text-sm text-gray-400 hover:text-primary transition-colors">
        ← 목록으로
      </Link>
      <h1 className="mt-3 mb-6 text-xl font-black text-gray-900">새 게시물 작성</h1>
      <PostForm action={createBoardPostAction} submitLabel="등록" />
    </div>
  )
}
