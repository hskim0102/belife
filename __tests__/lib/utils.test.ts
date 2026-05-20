import { describe, it, expect } from 'vitest'
import { formatDate, getCategoryLabel } from '@/lib/utils'

describe('formatDate', () => {
  it('ISO 날짜를 한국 형식으로 변환한다', () => {
    expect(formatDate('2025-05-20T00:00:00Z')).toBe('2025. 05. 20')
  })
  it('한 자리 월/일을 0 패딩한다', () => {
    expect(formatDate('2025-01-05T00:00:00Z')).toBe('2025. 01. 05')
  })
})

describe('getCategoryLabel', () => {
  it('notice → 공지사항', () => {
    expect(getCategoryLabel('notice')).toBe('공지사항')
  })
  it('domestic → 국내', () => {
    expect(getCategoryLabel('domestic')).toBe('국내')
  })
  it('알 수 없는 카테고리는 그대로 반환', () => {
    expect(getCategoryLabel('unknown')).toBe('unknown')
  })
})
