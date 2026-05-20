import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Button } from '@/components/ui/Button'

describe('Button', () => {
  it('텍스트를 렌더링한다', () => {
    render(<Button>후원하기</Button>)
    expect(screen.getByRole('button', { name: '후원하기' })).toBeInTheDocument()
  })
  it('variant=outline 스타일 클래스가 적용된다', () => {
    render(<Button variant="outline">봉사 신청</Button>)
    const btn = screen.getByRole('button')
    expect(btn.className).toContain('border')
  })
})
