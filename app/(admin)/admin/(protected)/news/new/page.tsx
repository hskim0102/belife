import type { Metadata } from 'next'
import Link from 'next/link'
import { createPostAction } from '../../../post-actions'
import { PostEditorForm } from '../../posts/PostEditorForm'
import { getNewsCategoryLabels } from '@/lib/repositories/newsCategories'

export const metadata: Metadata = { title: '새 활동소식' }
export const dynamic = 'force-dynamic'

const newsOption = [{ value: 'activity', label: '활동소식' }]

export default async function NewNewsPage() {
  const tagOptions = await getNewsCategoryLabels()
  return (
    <div className="max-w-3xl">
      <Link href="/admin/news" className="text-sm text-gray-400 hover:text-primary transition-colors">
        ← 목록으로
      </Link>
      <h1 className="mt-3 mb-6 text-xl font-black text-gray-900">새 활동소식 작성</h1>
      <PostEditorForm
        action={createPostAction}
        submitLabel="등록"
        categoryOptions={newsOption}
        cancelHref="/admin/news"
        categoryLabel="구분"
        tagOptions={tagOptions}
      />
    </div>
  )
}
