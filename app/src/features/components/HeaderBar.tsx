import type { ReactNode } from 'react'

type HeaderBarProps = {
  title: string
  subtitle?: string
  action?: ReactNode
}

export function HeaderBar({ action, subtitle, title }: HeaderBarProps) {
  return (
    <header className="app-header">
      <div>
        <span className="eyebrow">{subtitle ?? 'HenAi Egg'}</span>
        <h1>{title}</h1>
      </div>
      {action}
    </header>
  )
}
