import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Header } from '@/components/layout/Header'

vi.mock('next/navigation', () => ({ usePathname: () => '/' }))
vi.mock('next/image', () => ({
  default: ({ alt, ...props }: { alt: string; [k: string]: unknown }) => <img alt={alt} {...props} />,
}))

describe('Header', () => {
  it('renders all nav items', () => {
    render(<Header />)
    expect(screen.getByText('아름다운생명사랑은')).toBeInTheDocument()
    expect(screen.getByText('사업 소개')).toBeInTheDocument()
    expect(screen.getByText('소식')).toBeInTheDocument()
    expect(screen.getByText('후원·참여')).toBeInTheDocument()
    expect(screen.getByText('문의')).toBeInTheDocument()
  })

  it('renders admin-registered menu pages as sub-menu items', () => {
    render(
      <Header
        introPages={[{ label: '오시는 길', href: '/intro/page-abc' }]}
        programPages={[{ label: '연간 보고서', href: '/programs/page-def' }]}
      />,
    )
    // 데스크톱/모바일 메뉴 양쪽에 나타날 수 있으므로 존재 여부만 확인
    expect(screen.getAllByText('오시는 길').length).toBeGreaterThan(0)
    expect(screen.getAllByText('연간 보고서').length).toBeGreaterThan(0)
  })

  it('renders donation button', () => {
    render(<Header />)
    const btns = screen.getAllByText('후원하기')
    expect(btns.length).toBeGreaterThan(0)
  })
})
