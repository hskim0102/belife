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
    expect(screen.getByText('소개')).toBeInTheDocument()
    expect(screen.getByText('사업')).toBeInTheDocument()
    expect(screen.getByText('소식')).toBeInTheDocument()
    expect(screen.getByText('후원·참여')).toBeInTheDocument()
    expect(screen.getByText('문의')).toBeInTheDocument()
  })

  it('renders donation button', () => {
    render(<Header />)
    const btns = screen.getAllByText('후원하기')
    expect(btns.length).toBeGreaterThan(0)
  })
})
