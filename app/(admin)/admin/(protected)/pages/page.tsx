import type { Metadata } from 'next'
import Link from 'next/link'
import { getAllMenuPages } from '@/lib/repositories/menuPages'
import { MENUS, getMenuLabel, isMenuKey, menuPageHref } from '@/lib/menus'
import { formatDate } from '@/lib/utils'
import type { MenuKey } from '@/lib/types'
import { RowActions } from '@/components/admin/RowActions'
import { deleteMenuPageAction } from '../../menu-page-actions'

export const metadata: Metadata = { title: '메뉴 페이지 관리' }
export const dynamic = 'force-dynamic'

const filters: { key: 'all' | MenuKey; label: string }[] = [
  { key: 'all', label: '전체' },
  ...MENUS.map(m => ({ key: m.key, label: m.label })),
]

export default async function AdminMenuPagesPage({
  searchParams,
}: {
  searchParams: Promise<{ menu?: string }>
}) {
  const sp = await searchParams
  const menu = isMenuKey(sp.menu ?? '') ? (sp.menu as MenuKey) : undefined
  const pages = await getAllMenuPages(menu)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-black text-gray-900">메뉴 페이지 관리</h1>
          <p className="text-sm text-gray-400 mt-1">
            &ldquo;아름다운생명사랑은&rdquo; · &ldquo;사업 소개&rdquo; 메뉴의 하위 페이지를 등록·수정합니다. 총 {pages.length}개
          </p>
        </div>
        <Link
          href="/admin/pages/new"
          className="inline-flex items-center px-4 py-2 rounded-lg bg-primary text-white text-sm font-bold hover:bg-primary-dark transition-colors"
        >
          + 새 페이지
        </Link>
      </div>

      {/* 메뉴 필터 */}
      <div className="flex flex-wrap gap-1.5 mb-5">
        {filters.map(f => {
          const active = (f.key === 'all' && !menu) || f.key === menu
          const href = f.key === 'all' ? '/admin/pages' : `/admin/pages?menu=${f.key}`
          return (
            <Link
              key={f.key}
              href={href}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                active ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {f.label}
            </Link>
          )
        })}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-left text-gray-500">
              <th className="px-4 py-3 font-semibold w-16">번호</th>
              <th className="px-4 py-3 font-semibold w-44">메뉴</th>
              <th className="px-4 py-3 font-semibold">메뉴명(제목)</th>
              <th className="px-4 py-3 font-semibold w-16">순서</th>
              <th className="px-4 py-3 font-semibold w-20">노출</th>
              <th className="px-4 py-3 font-semibold w-28">수정일</th>
              <th className="px-4 py-3 font-semibold w-32 text-right">관리</th>
            </tr>
          </thead>
          <tbody>
            {pages.map(page => (
              <tr key={page.id} className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors">
                <td className="px-4 py-3 text-gray-400">{page.id}</td>
                <td className="px-4 py-3">
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                    {getMenuLabel(page.menu)}
                  </span>
                </td>
                <td className="px-4 py-3 max-w-0">
                  <Link
                    href={`/admin/pages/${page.id}/edit`}
                    className="block truncate font-medium text-gray-900 hover:text-primary transition-colors"
                  >
                    {page.title}
                  </Link>
                </td>
                <td className="px-4 py-3 text-gray-400">{page.order}</td>
                <td className="px-4 py-3">
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      page.published ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    {page.published ? '노출' : '숨김'}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-400">{formatDate(page.updatedAt)}</td>
                <td className="px-4 py-3">
                  <RowActions
                    id={page.id}
                    title={page.title}
                    viewHref={menuPageHref(page.menu, page.slug)}
                    editHref={`/admin/pages/${page.id}/edit`}
                    deleteAction={deleteMenuPageAction}
                  />
                </td>
              </tr>
            ))}
            {pages.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-16 text-center text-gray-400">
                  등록된 페이지가 없습니다. &ldquo;+ 새 페이지&rdquo;로 첫 메뉴 페이지를 만들어 보세요.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
