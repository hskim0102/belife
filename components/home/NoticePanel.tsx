'use client'
import Link from 'next/link'
import { useState } from 'react'
import type { Post } from '@/lib/types'
import { formatDate } from '@/lib/utils'

const tabs = ['공지사항', '소식', '보도자료'] as const
type Tab = typeof tabs[number]

interface NoticePanelProps {
  noticePost: Post[]
  newsPost: Post[]
  pressPost: Post[]
}

export function NoticePanel({ noticePost, newsPost, pressPost }: NoticePanelProps) {
  const [activeTab, setActiveTab] = useState<Tab>('공지사항')

  const items = {
    '공지사항': noticePost,
    '소식': newsPost,
    '보도자료': pressPost,
  }

  const currentItems = items[activeTab]
  const isToday = (dateStr: string) => {
    const today = new Date().toISOString().split('T')[0]
    const itemDate = dateStr.split('T')[0]
    return itemDate === today
  }

  return (
    <div className="bg-white">
      <div className="flex border-b border-gray-200">
        {tabs.map(tab => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-4 text-sm font-bold border-b-2 -mb-[1px] transition-colors ${
              activeTab === tab
                ? 'text-primary-darker border-primary-darker'
                : 'text-gray-400 border-transparent hover:text-gray-600'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
      <ul>
        {currentItems.length === 0 ? (
          <li className="flex items-center justify-center px-5 py-8 text-gray-400 text-sm">
            등록된 게시물이 없습니다.
          </li>
        ) : (
          currentItems.map(item => (
            <li
              key={item.id}
              className="flex items-start gap-3 px-5 py-3.5 border-b border-gray-100 hover:bg-primary-light transition-colors"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-primary-darker flex-shrink-0 mt-1.5" />
              <Link href={`/board/${item.category}/${item.slug}`} className="flex-1 min-w-0">
                <p className="text-sm text-gray-700 leading-snug line-clamp-1">
                  {item.title}
                  {isToday(item.publishedAt) && <span className="ml-1.5 text-[10px] font-bold text-red-500">N</span>}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">{formatDate(item.publishedAt).replace(/-/g, '.')}</p>
              </Link>
            </li>
          ))
        )}
      </ul>
      <div className="p-4">
        <Link
          href={activeTab === '공지사항' ? '/board/notice' : activeTab === '소식' ? '/news' : '/board/press'}
          className="block text-center text-xs text-gray-400 font-semibold hover:text-primary-darker transition-colors"
        >
          전체 보기 →
        </Link>
      </div>
    </div>
  )
}
