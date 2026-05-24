import type { HTMLAttributes, ReactNode } from 'react'

type CardProps = HTMLAttributes<HTMLElement> & {
  children: ReactNode
  as?: 'article' | 'section' | 'div'
}

export function Card({ as: Tag = 'section', children, className = '', ...props }: CardProps) {
  return (
    <Tag
      className={`border border-orange/12 rounded-lg bg-white shadow-soft p-5 ${className}`.trim()}
      {...props}
    >
      {children}
    </Tag>
  )
}
