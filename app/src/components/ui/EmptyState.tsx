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
    <div className="empty-state">
      <div className="empty-state__icon">○</div>
      <h3>{title}</h3>
      <p>{description}</p>
      {children}
      {actionLabel && onAction ? (
        <Button type="button" variant="secondary" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  )
}
