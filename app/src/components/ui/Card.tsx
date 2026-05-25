import type { HTMLAttributes, ReactNode } from 'react'

type CardProps = HTMLAttributes<HTMLElement> & {
  as?: 'article' | 'section' | 'div'
  children: ReactNode
}

export function Card({ as: Tag = 'section', children, className = '', ...props }: CardProps) {
  return (
    <Tag className={`panel ${className}`.trim()} {...props}>
      {children}
    </Tag>
  )
}
