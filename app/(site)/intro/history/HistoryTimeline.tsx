'use client'

import { useState } from 'react'
import type { Milestone } from '@/lib/types'

interface MonthGroup {
  month: number
  items: Milestone[]
}

interface YearGroup {
  year: number
  months: MonthGroup[]
  count: number
}

/** 연도 내림차순, 연도 안에서는 월 오름차순으로 묶는다. 같은 달의 항목은 한 묶음이 된다. */
function groupByYear(milestones: Milestone[]): YearGroup[] {
  const years = new Map<number, Map<number, Milestone[]>>()

  for (const m of milestones) {
    if (!years.has(m.year)) years.set(m.year, new Map())
    const months = years.get(m.year)!
    if (!months.has(m.month)) months.set(m.month, [])
    months.get(m.month)!.push(m)
  }

  return [...years.entries()]
    .sort(([a], [b]) => b - a)
    .map(([year, months]) => ({
      year,
      count: [...months.values()].reduce((sum, items) => sum + items.length, 0),
      months: [...months.entries()]
        .sort(([a], [b]) => a - b)
        .map(([month, items]) => ({ month, items })),
    }))
}

export function HistoryTimeline({ milestones }: { milestones: Milestone[] }) {
  const years = groupByYear(milestones)
  // 가장 최근 연도만 펼친 상태로 시작한다.
  const [openYears, setOpenYears] = useState<number[]>(years.length > 0 ? [years[0].year] : [])

  const toggle = (year: number) =>
    setOpenYears(open => (open.includes(year) ? open.filter(y => y !== year) : [...open, year]))

  if (years.length === 0) {
    return <p className="text-gray-400">등록된 발자취가 없습니다.</p>
  }

  return (
    // 연도 사이에 간격을 두면 좌측 타임라인 선이 끊기므로, 여백은 각 행 안쪽에서 준다.
    <div>
      {years.map(({ year, months, count }) => {
        const isOpen = openYears.includes(year)
        const panelId = `history-${year}`
        return (
          <div key={year} className="relative pl-8 border-l-2 border-primary-lighter">
            <span
              className={`absolute left-0 top-4 w-5 h-5 -translate-x-1/2 rounded-full border-4 border-white shadow-sm transition-colors ${
                isOpen ? 'bg-primary' : 'bg-primary-muted'
              }`}
              aria-hidden="true"
            />

            <h2>
              <button
                type="button"
                onClick={() => toggle(year)}
                aria-expanded={isOpen}
                aria-controls={panelId}
                className="w-full flex items-center gap-3 py-3 pr-2 text-left cursor-pointer group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-lg"
              >
                <span className="text-2xl font-black text-primary-dark">{year}</span>
                <span className="text-xs font-bold text-primary-dark bg-primary-light px-2.5 py-1 rounded-full">
                  {count}건
                </span>
                <svg
                  className={`w-5 h-5 ml-auto text-primary transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </h2>

            {/* 0fr → 1fr 로 늘려 높이를 부드럽게 펼친다. 접힌 내용도 DOM에는 남겨 둔다. */}
            <div
              id={panelId}
              aria-hidden={isOpen ? undefined : true}
              className={`grid transition-all duration-300 ease-in-out ${
                isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
              }`}
            >
              <div className="overflow-hidden">
                <ul className="space-y-4 pb-6 pt-1">
                  {months.map(({ month, items }) => (
                    // 모바일: 월과 내용을 세로로 쌓아 내용 폭을 넓힌다. sm↑: 좌우 배치.
                    <li key={month} className="flex flex-col sm:flex-row sm:gap-4">
                      <span className="shrink-0 mb-1.5 sm:mb-0 sm:w-11 pt-0.5 text-sm font-bold text-primary sm:text-right">
                        {month}월
                      </span>
                      <ul className="flex-1 space-y-2">
                        {items.map(item => (
                          <li
                            key={item.id}
                            className="text-sm leading-relaxed text-gray-600 before:content-['·'] before:mr-2 before:text-primary-muted before:font-bold"
                          >
                            {item.content}
                          </li>
                        ))}
                      </ul>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
