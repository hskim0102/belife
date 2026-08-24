import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Pagination, pageBlock } from '@/components/ui/Pagination'

describe('pageBlock', () => {
  it('총 페이지가 한 블록 안이면 전부 보여 주고 앞뒤 이동은 없다', () => {
    expect(pageBlock(1, 7)).toEqual({
      pages: [1, 2, 3, 4, 5, 6, 7],
      prevBlockPage: null,
      nextBlockPage: null,
    })
  })

  it('첫 블록에서는 다음 블록으로만 넘어갈 수 있다', () => {
    const { pages, prevBlockPage, nextBlockPage } = pageBlock(1, 37)
    expect(pages).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
    expect(prevBlockPage).toBeNull()
    expect(nextBlockPage).toBe(11)
  })

  it('가운데 블록은 앞뒤 블록의 경계 페이지를 가리킨다', () => {
    const { pages, prevBlockPage, nextBlockPage } = pageBlock(15, 37)
    expect(pages).toEqual([11, 12, 13, 14, 15, 16, 17, 18, 19, 20])
    expect(prevBlockPage).toBe(10)
    expect(nextBlockPage).toBe(21)
  })

  it('마지막 블록은 남은 페이지까지만 그린다', () => {
    const { pages, nextBlockPage } = pageBlock(35, 37)
    expect(pages).toEqual([31, 32, 33, 34, 35, 36, 37])
    expect(nextBlockPage).toBeNull()
  })

  it('범위를 벗어난 현재 페이지는 마지막 페이지로 맞춘다', () => {
    expect(pageBlock(99, 12).pages).toEqual([11, 12])
    expect(pageBlock(0, 5).pages).toEqual([1, 2, 3, 4, 5])
  })
})

describe('Pagination', () => {
  const hrefFor = (p: number) => (p > 1 ? `/board/notice?page=${p}` : '/board/notice')

  it('페이지가 한 쪽뿐이면 아무것도 그리지 않는다', () => {
    const { container } = render(<Pagination page={1} totalPages={1} hrefFor={hrefFor} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('현재 페이지를 aria-current 로 표시한다', () => {
    render(<Pagination page={3} totalPages={5} hrefFor={hrefFor} />)
    expect(screen.getByRole('link', { name: '3' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('link', { name: '1' })).not.toHaveAttribute('aria-current')
  })

  it('페이지 링크에 hrefFor 가 만든 주소를 쓴다', () => {
    render(<Pagination page={1} totalPages={5} hrefFor={hrefFor} />)
    expect(screen.getByRole('link', { name: '4' })).toHaveAttribute('href', '/board/notice?page=4')
  })

  it('10페이지를 넘으면 다음 블록 이동 버튼이 나온다', () => {
    render(<Pagination page={1} totalPages={25} hrefFor={hrefFor} />)
    expect(screen.getByRole('link', { name: '다음 10페이지' })).toHaveAttribute(
      'href',
      '/board/notice?page=11',
    )
    expect(screen.queryByRole('link', { name: '이전 10페이지' })).toBeNull()
  })
})
