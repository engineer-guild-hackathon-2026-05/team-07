import type { ReactNode } from 'react'

type HeaderBarProps = {
  title: string
  subtitle?: string
  action?: ReactNode
}

export function HeaderBar({ action, subtitle, title }: HeaderBarProps) {
  return (
    <header className="grid grid-cols-[1fr_auto_auto] gap-2.5 items-start mb-[22px]">
      <div>
        <span className="block m-0 text-primary-strong text-xs font-extrabold tracking-widest uppercase">
          {subtitle ?? 'HenAi Egg'}
        </span>
        <h1 className="m-0 text-primary-strong text-xl font-black tracking-wide">{title}</h1>
      </div>
      {action}
    </header>
  )
}
