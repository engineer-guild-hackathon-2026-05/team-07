import type { ReactNode } from 'react'
import { Button } from './Button'

type EmptyStateProps = {
  actionLabel?: string
  children?: ReactNode
  description: string
  onAction?: () => void
  title: string
}

export function EmptyState({ actionLabel, children, description, onAction, title }: EmptyStateProps) {
  return (
    <div className="grid justify-items-center gap-2.5 border-2 border-dashed border-[#f1e7dc] rounded-[22px] py-6 px-[18px] bg-[#fffaf4] text-center">
      <div className="grid place-items-center w-12 h-12 rounded-full text-primary-strong bg-[#fff1df] font-black">
        ○
      </div>
      <h3 className="text-text-heading">{title}</h3>
      <p className="text-text">{description}</p>
      {children}
      {actionLabel && onAction ? (
        <Button type="button" variant="secondary" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  )
}
