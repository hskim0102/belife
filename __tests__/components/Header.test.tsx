import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Header } from '@/components/layout/Header'

describe('Header', () => {
  it('로고 텍스트를 렌더링한다', () => {
    render(<Header />)
    expect(screen.getByText('아름다운생명사랑')).toBeInTheDocument()
  })
  it('5개 메뉴를 렌더링한다', () => {
    render(<Header />)
    expect(screen.getByText('소개')).toBeInTheDocument()
    expect(screen.getByText('사업')).toBeInTheDocument()
    expect(screen.getByText('소식')).toBeInTheDocument()
    expect(screen.getByText('후원·참여')).toBeInTheDocument()
    expect(screen.getByText('문의')).toBeInTheDocument()
  })
  it('후원하기 버튼을 렌더링한다', () => {
    render(<Header />)
    expect(screen.getByText('후원하기')).toBeInTheDocument()
  })
})
