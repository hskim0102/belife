import type { ReactElement } from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render as rtlRender, screen } from '@testing-library/react'
import { Footer } from '@/components/layout/Footer'
import { NavMenuProvider } from '@/components/layout/NavMenuContext'

vi.mock('next/navigation', () => ({ usePathname: () => '/' }))

// Footer 의 '사이트맵' 버튼은 전체메뉴 컨텍스트를 사용하므로 Provider 로 감싼다.
function render(ui: ReactElement) {
  return rtlRender(<NavMenuProvider>{ui}</NavMenuProvider>)
}

describe('Footer', () => {
  it('저작권 문구를 렌더링한다', () => {
    render(<Footer />)
    expect(screen.getByText(/2013 All rights reserved by belife/)).toBeInTheDocument()
  })

  it('대표자명을 렌더링한다', () => {
    render(<Footer />)
    expect(screen.getByText(/대표: 김영진/)).toBeInTheDocument()
  })

  it('주소를 렌더링한다', () => {
    render(<Footer />)
    expect(screen.getByText(/인수봉로55가길/)).toBeInTheDocument()
  })

  it('전화번호를 렌더링한다', () => {
    render(<Footer />)
    expect(screen.getByText(/02-6080-5798/)).toBeInTheDocument()
  })

  it('팩스번호를 렌더링한다', () => {
    render(<Footer />)
    expect(screen.getByText(/02-6008-7998/)).toBeInTheDocument()
  })

  it('이메일 링크를 렌더링한다', () => {
    render(<Footer />)
    const link = screen.getByText(/belifeorg@hanmail\.net/).closest('a')
    expect(link).toHaveAttribute('href', 'mailto:belifeorg@hanmail.net')
  })

  it('개인정보처리방침 링크를 렌더링한다', () => {
    render(<Footer />)
    const link = screen.getByText('개인정보처리방침').closest('a')
    expect(link).toHaveAttribute('href', '/privacy')
  })

  it('공익법인 문구가 없다', () => {
    render(<Footer />)
    expect(screen.queryByText(/공익법인/)).toBeNull()
  })

  it('관련 사이트를 새 창으로 여는 버튼으로 렌더링한다', () => {
    render(<Footer />)
    const nts = screen.getByRole('link', { name: /국세청/ })
    expect(nts).toHaveAttribute('href', 'https://www.nts.go.kr/')
    expect(nts).toHaveAttribute('target', '_blank')
    expect(nts).toHaveAttribute('rel', 'noopener noreferrer')

    const seoul = screen.getByRole('link', { name: /서울특별시/ })
    expect(seoul).toHaveAttribute('href', 'https://www.seoul.go.kr/main/index.jsp')
    expect(seoul).toHaveAttribute('target', '_blank')
  })

  it('관련 사이트 영역에 이름표를 붙인다', () => {
    render(<Footer />)
    expect(screen.getByRole('navigation', { name: '관련 사이트' })).toBeInTheDocument()
  })
})
