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
