import { useState } from 'react'

interface Props {
  onSend: (message: string) => void
  disabled?: boolean
}

const BAR =
  'absolute left-0 right-0 bottom-[calc(70px+env(safe-area-inset-bottom,0px))] z-10 flex items-center gap-2 px-4 py-3 bg-gradient-to-b from-[rgba(255,253,251,0)] to-surface md:sticky md:bottom-0 md:col-span-full md:px-8 md:pt-4 md:pb-6 md:border-t md:border-border'

export function ChatInput({ onSend, disabled }: Props) {
  const [value, setValue] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!value.trim() || disabled) return
    onSend(value)
    setValue('')
  }

  const canSend = value.trim().length > 0 && !disabled

  return (
    <form className={BAR} onSubmit={handleSubmit}>
      <input
        className={`flex-1 border rounded-full px-4 py-2.5 text-sm text-[#1f1f1f] bg-white outline-none shadow-sm transition-colors ${
          disabled
            ? 'border-[#f1e7dc] text-[#494949]/40 cursor-not-allowed'
            : 'border-[#f1e7dc] focus:border-[#ff9b37]'
        }`}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={disabled ? '考え中...' : 'メッセージを入力…'}
        disabled={disabled}
      />
      <button
        type="submit"
        disabled={!canSend}
        aria-label="送信"
        className={`w-11 h-11 shrink-0 rounded-full border-none grid place-items-center text-xl text-white transition-colors ${
          canSend
            ? 'bg-[#ff9b37] shadow-[0_6px_14px_rgba(255,155,55,0.32)] cursor-pointer'
            : 'bg-[#f1e7dc] cursor-default'
        }`}
      >
        ↑
      </button>
    </form>
  )
}
