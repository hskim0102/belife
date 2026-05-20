import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Footer } from '@/components/layout/Footer'

describe('Footer', () => {
  it('단체명을 렌더링한다', () => {
    render(<Footer />)
    expect(screen.getAllByText(/아름다운생명사랑/).length).toBeGreaterThan(0)
  })
  it('공익법인 문구를 렌더링한다', () => {
    render(<Footer />)
    expect(screen.getByText(/공익법인/)).toBeInTheDocument()
  })
})
