import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Footer } from '@/components/layout/Footer'

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
})
