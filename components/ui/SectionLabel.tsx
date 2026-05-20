import { ReactNode } from 'react'

export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <div className="inline-flex items-center gap-2 mb-4">
      <span className="w-5 h-0.5 bg-primary rounded-full inline-block" />
      <p className="text-xs font-black text-primary tracking-widest uppercase">{children}</p>
    </div>
  )
}