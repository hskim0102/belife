import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getMenuPageById } from '@/lib/repositories/menuPages'
import { updateMenuPageAction } from '../../../../menu-page-actions'
import { MenuPageEditorForm } from '../../MenuPageEditorForm'

export const metadata: Metadata = { title: '메뉴 페이지 수정' }
export const dynamic = 'force-dynamic'

export default async function EditMenuPagePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const numericId = Number(id)
  if (!Number.isInteger(numericId) || numericId <= 0) notFound()

  const page = await getMenuPageById(numericId)
  if (!page) notFound()

  return (
    <div className="max-w-3xl">
      <Link href="/admin/pages" className="text-sm text-gray-400 hover:text-primary transition-colors">
        ← 목록으로
      </Link>
      <h1 className="mt-3 mb-6 text-xl font-black text-gray-900">메뉴 페이지 수정</h1>
      <MenuPageEditorForm action={updateMenuPageAction} page={page} submitLabel="수정" />
    </div>
  )
}
