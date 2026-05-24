import type { ReactNode } from 'react'

type HeaderBarProps = {
  title: string
  subtitle?: string
  action?: ReactNode
}

export function HeaderBar({ action, subtitle, title }: HeaderBarProps) {
  return (
    <header className="grid grid-cols-[1fr_auto] gap-2.5 items-start mb-[22px]">
      <div>
        <span className="text-orange-dark text-xs font-extrabold uppercase tracking-wider">
          {subtitle ?? 'HenAi Egg'}
        </span>
        <h1 className="text-orange-dark text-[22px] font-black tracking-wide">{title}</h1>
      </div>
      {action}
    </header>
  )
}
