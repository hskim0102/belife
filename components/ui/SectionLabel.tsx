import { ReactNode } from 'react'

export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p className="text-xs font-bold text-primary tracking-widest uppercase mb-3">
      {children}
    </p>
  )
}
