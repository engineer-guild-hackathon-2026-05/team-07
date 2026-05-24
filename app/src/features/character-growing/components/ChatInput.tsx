import { useState } from 'react'

interface Props {
  onSend: (message: string) => void
}

export function ChatInput({ onSend }: Props) {
  const [value, setValue] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!value.trim()) return
    onSend(value)
    setValue('')
  }

  const canSend = value.trim().length > 0

  return (
    <form
      className="absolute left-0 right-0 bottom-[104px] flex items-center gap-2 px-4 z-10"
      onSubmit={handleSubmit}
    >
      <input
        className="flex-1 border border-[#f1e7dc] focus:border-[#ff9b37] rounded-full px-4 py-2.5 text-sm text-[#1f1f1f] bg-white outline-none shadow-sm"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="メッセージを入力…"
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
