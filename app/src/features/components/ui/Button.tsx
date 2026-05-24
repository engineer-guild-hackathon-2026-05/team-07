import type { ButtonHTMLAttributes, ReactNode } from 'react'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'ghost'
}

const variantClasses = {
  primary: 'text-white bg-orange shadow-[0_8px_16px_rgba(255,155,55,0.28)]',
  secondary: 'text-orange-dark bg-cream-tab shadow-none',
  ghost: 'text-text-h bg-transparent shadow-none',
} as const

export function Button({ children, className = '', variant = 'primary', ...props }: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center min-h-[54px] border-none rounded-2xl px-[18px] font-black cursor-pointer disabled:opacity-60 disabled:cursor-wait ${variantClasses[variant]} ${className}`.trim()}
      {...props}
    >
      {children}
    </button>
  )
}
