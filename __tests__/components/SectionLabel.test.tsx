import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SectionLabel } from '@/components/ui/SectionLabel'

describe('SectionLabel', () => {
  it('텍스트를 렌더링한다', () => {
    render(<SectionLabel>Our Mission</SectionLabel>)
    expect(screen.getByText('Our Mission')).toBeInTheDocument()
  })
})
