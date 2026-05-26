import type { HTMLAttributes, ReactNode } from 'react'

type CardProps = HTMLAttributes<HTMLElement> & {
  as?: 'article' | 'section' | 'div'
  children: ReactNode
}

const CARD = 'border border-[rgba(255,155,55,0.12)] rounded-lg bg-white shadow-soft p-5'

export function Card({ as: Tag = 'section', children, className = '', ...props }: CardProps) {
  return (
    <Tag className={`${CARD} ${className}`.trim()} {...props}>
      {children}
    </Tag>
  )
}
