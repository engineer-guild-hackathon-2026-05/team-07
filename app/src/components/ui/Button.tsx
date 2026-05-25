import type { ButtonHTMLAttributes, ReactNode } from 'react'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'ghost'
}

const BASE =
  'inline-flex items-center justify-center min-h-[54px] rounded-2xl px-[18px] font-black cursor-pointer border-0 disabled:opacity-60 disabled:cursor-wait'

const VARIANTS: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary: 'text-white bg-primary shadow-[0_8px_16px_rgba(255,155,55,0.28)]',
  secondary: 'text-primary-strong bg-[#fff1df]',
  ghost: 'text-text-heading bg-transparent',
}

export function Button({ children, className = '', variant = 'primary', ...props }: ButtonProps) {
  return (
    <button className={`${BASE} ${VARIANTS[variant]} ${className}`.trim()} {...props}>
      {children}
    </button>
  )
}
