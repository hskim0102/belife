import { describe, it, expect } from 'vitest'
import { parseSearchField, parseSearchQuery } from '@/lib/boardSearch'

describe('parseSearchField', () => {
  it('정의된 검색 범위는 그대로 쓴다', () => {
    expect(parseSearchField('title')).toBe('title')
    expect(parseSearchField('body')).toBe('body')
    expect(parseSearchField('all')).toBe('all')
  })

  it('알 수 없는 값이나 없는 값은 전체 검색으로 떨어진다', () => {
    expect(parseSearchField('writer')).toBe('all')
    expect(parseSearchField(undefined)).toBe('all')
  })
})

describe('parseSearchQuery', () => {
  it('앞뒤 공백을 걷어낸다', () => {
    expect(parseSearchQuery('  생명사랑 ')).toBe('생명사랑')
  })

  it('비어 있거나 공백뿐이면 검색하지 않는다', () => {
    expect(parseSearchQuery('')).toBeUndefined()
    expect(parseSearchQuery('   ')).toBeUndefined()
    expect(parseSearchQuery(undefined)).toBeUndefined()
  })

  it('지나치게 긴 검색어는 100자로 자른다', () => {
    expect(parseSearchQuery('가'.repeat(200))).toHaveLength(100)
  })
})
