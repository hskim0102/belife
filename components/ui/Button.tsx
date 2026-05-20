import { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/cn'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  children: ReactNode
}

export function Button({ variant = 'primary', size = 'md', className, children, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'rounded-full font-semibold transition-colors cursor-pointer',
        size === 'sm' && 'px-4 py-2 text-sm',
        size === 'md' && 'px-7 py-3 text-base',
        size === 'lg' && 'px-9 py-4 text-lg',
        variant === 'primary' && 'bg-primary text-white hover:bg-primary-dark',
        variant === 'outline' && 'border-2 border-primary text-primary hover:bg-primary-light',
        variant === 'ghost' && 'text-primary hover:bg-primary-light',
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}
