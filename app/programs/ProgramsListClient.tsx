// app/programs/ProgramsListClient.tsx
'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Program } from '@/lib/sanity/types'
import { getCategoryLabel } from '@/lib/utils'
import { cn } from '@/lib/cn'

const tabs = [
  { key: 'all', label: '전체' },
  { key: 'domestic', label: '국내' },
  { key: 'overseas', label: '해외' },
  { key: 'education', label: '교육' },
]

const categoryColors: Record<string, string> = {
  domestic: 'bg-primary-lighter text-primary',
  overseas: 'bg-blue-100 text-blue-600',
  education: 'bg-yellow-100 text-yellow-700',
}

export function ProgramsListClient({ programs }: { programs: Program[] }) {
  const [active, setActive] = useState('all')
  const filtered = active === 'all' ? programs : programs.filter(p => p.category === active)

  return (
    <>
      <div className="flex gap-2 mb-10">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setActive(t.key)}
            className={cn(
              'px-5 py-2 rounded-full text-sm font-semibold transition-colors',
              active === t.key ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-primary-light'
            )}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
        {filtered.map(p => (
          <Link key={p._id} href={`/programs/${p.slug.current}`}>
            <div className="bg-white rounded-card-lg border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
              <div className="h-36 bg-primary-light flex items-center justify-center text-5xl">🏥</div>
              <div className="p-5">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${categoryColors[p.category]} mb-2 inline-block`}>
                  {getCategoryLabel(p.category)}
                </span>
                <h3 className="font-bold mb-1">{p.name}</h3>
                <p className="text-sm text-text-subtle leading-relaxed">{p.description}</p>
              </div>
            </div>
          </Link>
        ))}
        {filtered.length === 0 && (
          <p className="col-span-3 text-center text-text-subtle py-10">해당 사업이 없습니다.</p>
        )}
      </div>
    </>
  )
}
