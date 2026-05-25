import type { ButtonHTMLAttributes, ReactNode } from 'react'

type StackedActionButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  description?: string
  icon: ReactNode
  title: string
  variant?: 'default' | 'line'
}

const BASE =
  'grid grid-cols-[42px_1fr] gap-2.5 items-center w-full min-h-[58px] rounded-2xl px-3.5 py-2.5 text-text-heading text-left cursor-pointer disabled:opacity-60 disabled:cursor-wait'

const BUTTON_VARIANTS: Record<NonNullable<StackedActionButtonProps['variant']>, string> = {
  default: 'border border-[#e5e5e5] bg-white shadow-[0_3px_10px_rgba(73,73,73,0.1)]',
  line: 'border border-[rgba(6,199,85,0.18)] bg-[#f3fff8] shadow-soft',
}

const ICON_VARIANTS: Record<NonNullable<StackedActionButtonProps['variant']>, string> = {
  default: 'text-[#4285f4] bg-[#f8f8f8]',
  line: 'text-white bg-[#06c755]',
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
      className={`${BASE} ${BUTTON_VARIANTS[variant]} ${className}`.trim()}
      disabled={disabled}
      {...props}
    >
      <span
        className={`grid place-items-center w-[34px] h-[34px] rounded-full font-black ${ICON_VARIANTS[variant]}`}
      >
        {icon}
      </span>
      <span>
        <strong className="block leading-tight">{title}</strong>
        {description ? <small className="block leading-tight text-[#777] text-xs">{description}</small> : null}
      </span>
    </button>
  )
}
