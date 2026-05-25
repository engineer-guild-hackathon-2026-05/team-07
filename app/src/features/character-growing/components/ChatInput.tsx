import { useState } from 'react'

interface Props {
  onSend: (message: string) => void
  disabled?: boolean
}

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
    <form className="chat-input-bar" onSubmit={handleSubmit}>
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
