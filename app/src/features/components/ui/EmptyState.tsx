import type { ReactNode } from 'react'
import { Button } from './Button'

type EmptyStateProps = {
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
  children?: ReactNode
}

export function EmptyState({ actionLabel, children, description, onAction, title }: EmptyStateProps) {
  return (
    <div className="grid justify-items-center gap-2.5 border-2 border-dashed border-border rounded-[22px] px-[18px] py-6 bg-cream-light text-center">
      <div className="grid place-items-center w-12 h-12 rounded-full text-orange-dark bg-cream-tab font-black">
        ○
      </div>
      <h3 className="text-text-h">{title}</h3>
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
