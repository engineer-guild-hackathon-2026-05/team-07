import type { ButtonHTMLAttributes, ReactNode } from 'react'

type StackedActionButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  description?: string
  icon: ReactNode
  title: string
  variant?: 'default' | 'line'
}

export function StackedActionButton({
  className = '',
  description,
  disabled,
  icon,
  title,
  variant = 'default',
  ...props
}: StackedActionButtonProps) {
  return (
    <button
      type="button"
      className={`stacked-action-button stacked-action-button--${variant} ${className}`.trim()}
      disabled={disabled}
      {...props}
    >
      <span className={`stacked-action-button__icon stacked-action-button__icon--${variant}`}>{icon}</span>
      <span>
        <strong>{title}</strong>
        {description ? <small>{description}</small> : null}
      </span>
    </button>
  )
}
