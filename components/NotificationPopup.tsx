'use client'

import { useState, useEffect } from 'react'

interface NotificationProps {
  id: number
  title: string
  body: string | null
  type: 'info' | 'success' | 'warning' | 'error'
  showFrequency: 'always' | 'daily'
}

type IconType = 'info' | 'success' | 'warning' | 'error'

function IconComponent({ type }: { type: IconType }) {
  const iconProps = 'w-6 h-6'

  switch (type) {
    case 'info':
      return (
        <svg className={iconProps} fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
      )
    case 'success':
      return (
        <svg className={iconProps} fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      )
    case 'warning':
      return (
        <svg className={iconProps} fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      )
    case 'error':
      return (
        <svg className={iconProps} fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
      )
  }
}

const typeStyles = {
  info: {
    bg: 'bg-emerald-50',
    border: 'border-emerald-100',
    title: 'text-emerald-800',
    body: 'text-emerald-700',
    button: 'bg-emerald-500 hover:bg-emerald-600',
    icon: 'text-emerald-500',
    headerBorder: 'border-emerald-100',
  },
  success: {
    bg: 'bg-teal-50',
    border: 'border-teal-100',
    title: 'text-teal-800',
    body: 'text-teal-700',
    button: 'bg-teal-500 hover:bg-teal-600',
    icon: 'text-teal-500',
    headerBorder: 'border-teal-100',
  },
  warning: {
    bg: 'bg-orange-50',
    border: 'border-orange-100',
    title: 'text-orange-800',
    body: 'text-orange-700',
    button: 'bg-orange-500 hover:bg-orange-600',
    icon: 'text-orange-500',
    headerBorder: 'border-orange-100',
  },
  error: {
    bg: 'bg-rose-50',
    border: 'border-rose-100',
    title: 'text-rose-800',
    body: 'text-rose-700',
    button: 'bg-rose-500 hover:bg-rose-600',
    icon: 'text-rose-500',
    headerBorder: 'border-rose-100',
  },
}

export function NotificationPopup({ notification }: { notification: NotificationProps | null }) {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (!notification) return

    // 노출 빈도에 따라 localStorage 처리
    const today = new Date().toISOString().split('T')[0]
    const key = `notif-${notification.id}-${today}`

    if (notification.showFrequency === 'daily') {
      // 하루에 한 번만: 오늘 본 알림이면 스킵
      if (localStorage.getItem(key)) return
    }

    // 팝업 표시
    const timer = setTimeout(() => {
      setIsOpen(true)
      // 하루에 한 번 옵션일 때만 localStorage에 기록
      if (notification.showFrequency === 'daily') {
        localStorage.setItem(key, '1')
      }
    }, 500) // 500ms 딜레이

    return () => clearTimeout(timer)
  }, [notification])

  if (!notification || !isOpen) return null

  const style = typeStyles[notification.type]
  const sanitized = notification.body

  return (
    <>
      {/* 배경 오버레이 */}
      <div
        className="fixed inset-0 bg-black/30 z-40 transition-opacity"
        onClick={() => setIsOpen(false)}
        aria-hidden
      />

      {/* 팝업 */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-50 animate-in fade-in zoom-in-95 duration-200">
        <div className={`rounded-3xl border-2 ${style.bg} ${style.border} overflow-hidden shadow-xl`}>
          {/* 헤더 */}
          <div className={`flex items-start justify-between gap-4 px-6 py-5 border-b-2 ${style.headerBorder}`}>
            <div className="flex items-start gap-3">
              <div className={`mt-0.5 ${style.icon}`}>
                <IconComponent type={notification.type} />
              </div>
              <h2 className={`text-lg font-black ${style.title}`}>{notification.title}</h2>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
              aria-label="닫기"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* 본문 */}
          {sanitized && (
            <div className="px-6 py-4">
              <div
                className={`prose prose-sm max-w-none ${style.body} prose-p:my-2 prose-p:leading-relaxed prose-img:rounded-lg prose-img:my-2`}
                dangerouslySetInnerHTML={{ __html: sanitized }}
              />
            </div>
          )}

          {/* 버튼 */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 bg-white/40">
            <button
              onClick={() => setIsOpen(false)}
              className={`px-5 py-2.5 rounded-xl ${style.button} text-white font-bold text-sm transition-colors`}
            >
              닫기
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
