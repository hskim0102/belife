// app/programs/ProgramsListClient.tsx
'use client'
import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Program } from '@/lib/types'
import { getCategoryLabel } from '@/lib/utils'
import { cn } from '@/lib/cn'

const tabs = [
  { key: 'all', label: '전체' },
  { key: 'domestic', label: '국내' },
  { key: 'overseas', label: '해외' },
  { key: 'education', label: '교육' },
]

const categoryStyles: Record<string, { badge: string; strip: string; icon: string }> = {
  domestic: { badge: 'bg-emerald-100 text-emerald-700', strip: 'bg-gradient-to-br from-emerald-100 to-emerald-300', icon: '🏥' },
  overseas: { badge: 'bg-teal-100 text-teal-700', strip: 'bg-gradient-to-br from-teal-100 to-teal-300', icon: '🌏' },
  education: { badge: 'bg-amber-100 text-amber-700', strip: 'bg-gradient-to-br from-amber-100 to-amber-300', icon: '📚' },
}

export function ProgramsListClient({
  programs,
  initialCategory = 'all',
}: {
  programs: Program[]
  initialCategory?: string
}) {
  const [active, setActive] = useState(initialCategory)
  // URL 쿼리(?category=)가 바뀌면(예: 상단 메뉴에서 클릭) 활성 탭을 동기화한다.
  const [prevInitial, setPrevInitial] = useState(initialCategory)
  if (initialCategory !== prevInitial) {
    setPrevInitial(initialCategory)
    setActive(initialCategory)
  }
  const filtered = active === 'all' ? programs : programs.filter(p => p.category === active)

  return (
    <>
      <div className="flex flex-wrap gap-2 mb-10">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setActive(t.key)}
            className={cn(
              'px-5 py-2.5 rounded-full text-sm font-bold transition-all',
              active === t.key
                ? 'bg-primary text-white shadow-sm'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            )}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
        {filtered.map(p => {
          const style = categoryStyles[p.category] ?? categoryStyles.domestic
          return (
            <Link key={p.id} href={`/programs/${p.slug}`}>
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 h-full flex flex-col">
                <div className={`relative h-36 ${style.strip} flex items-center justify-center text-5xl overflow-hidden`}>
                  {p.thumbnail ? (
                    <Image
                      src={p.thumbnail}
                      alt={p.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    style.icon
                  )}
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${style.badge} mb-3 inline-block w-fit`}>
                    {getCategoryLabel(p.category)}
                  </span>
                  <h3 className="font-bold text-gray-900 mb-2">{p.name}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed line-clamp-3">{p.description}</p>
                </div>
              </div>
            </Link>
          )
        })}
        {filtered.length === 0 && (
          <div className="col-span-full text-center py-16">
            <p className="text-gray-400">해당 사업이 없습니다.</p>
          </div>
        )}
      </div>
    </>
  )
}