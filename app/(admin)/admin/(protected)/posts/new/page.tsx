import type { Metadata } from 'next'
import Link from 'next/link'
import { createPostAction } from '../../../post-actions'
import { PostEditorForm } from '../PostEditorForm'
import { BOARD_CATEGORIES } from '@/lib/boardCategories'

export const metadata: Metadata = { title: '새 게시물' }

const boardOptions = BOARD_CATEGORIES.map(c => ({ value: c.key, label: c.label }))

export default function NewPostPage() {
  return (
    <div className="max-w-3xl">
      <Link href="/admin/posts" className="text-sm text-gray-400 hover:text-primary transition-colors">
        ← 목록으로
      </Link>
      <h1 className="mt-3 mb-6 text-xl font-black text-gray-900">새 게시물 작성</h1>
      <PostEditorForm action={createPostAction} submitLabel="등록" categoryOptions={boardOptions} />
    </div>
  )
}
