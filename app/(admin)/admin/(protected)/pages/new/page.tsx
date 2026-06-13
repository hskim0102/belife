import type { Metadata } from 'next'
import Link from 'next/link'
import { createMenuPageAction } from '../../../menu-page-actions'
import { MenuPageEditorForm } from '../MenuPageEditorForm'

export const metadata: Metadata = { title: '새 메뉴 페이지' }

export default function NewMenuPagePage() {
  return (
    <div className="max-w-3xl">
      <Link href="/admin/pages" className="text-sm text-gray-400 hover:text-primary transition-colors">
        ← 목록으로
      </Link>
      <h1 className="mt-3 mb-6 text-xl font-black text-gray-900">새 메뉴 페이지 등록</h1>
      <MenuPageEditorForm action={createMenuPageAction} submitLabel="등록" />
    </div>
  )
}
