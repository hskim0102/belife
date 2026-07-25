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
        'rounded-full font-bold transition-all cursor-pointer inline-flex items-center justify-center',
        size === 'sm' && 'px-6 py-2.5 text-base',
        size === 'md' && 'px-8 py-3.5 text-lg',
        size === 'lg' && 'px-12 py-5 text-xl',
        variant === 'primary' &&
          'bg-gradient-to-br from-primary to-primary-dark text-white hover:from-primary-dark hover:to-primary-darker shadow-sm hover:shadow',
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