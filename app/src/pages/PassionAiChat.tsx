import { useEffect, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { appendPassionChatHistory, loadPassionChatHistory, type PassionChatMessage } from '../lib/passionRepository'
import { generatePassionReply } from '../lib/passionAi'

type PassionAiChatPageProps = {
  userId: string
}

export function PassionAiChatPage({ userId }: PassionAiChatPageProps) {
  const { passionId } = useParams()
  const [messages, setMessages] = useState<PassionChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isSending, setIsSending] = useState(false)

  useEffect(() => {
    if (!passionId) {
      return
    }

    loadPassionChatHistory(passionId).then(setMessages).catch(() => setMessages([]))
  }, [passionId])

  if (!userId) {
    return <Navigate to="/login" replace />
  }

  if (!passionId) {
    return <Navigate to="/passions/new" replace />
  }

  const sendMessage = async () => {
    const trimmed = input.trim()
    if (!trimmed || isSending) {
      return
    }

    setIsSending(true)

    const userMessage: PassionChatMessage = {
      role: 'user',
      content: trimmed,
      createdAt: new Date().toISOString(),
    }

    const baseMessages = [...messages, userMessage]
    setMessages(baseMessages)
    setInput('')

    const replyText = await generatePassionReply({ passionId, message: trimmed })
    const assistantMessage: PassionChatMessage = {
      role: 'assistant',
      content: replyText,
      createdAt: new Date().toISOString(),
    }

    const nextMessages = [...baseMessages, assistantMessage]
    setMessages(nextMessages)
    await appendPassionChatHistory(passionId, nextMessages)
    setIsSending(false)
  }

  return (
    <div className="screen !p-0 flex h-full flex-col bg-[#fffdfb]">
      <header className="border-b border-[#f1e7dc] px-4 py-3">
        <p className="text-xs font-bold uppercase tracking-[0.08em] text-[#e77300]">char-02</p>
        <h1 className="text-lg font-extrabold text-[#1f1f1f]">偏愛AI深掘りチャット</h1>
        <p className="mt-1 text-xs text-[#737373]">Cloud Functions ダミー応答で対話を進めます。</p>
      </header>

      <div className="flex-1 space-y-2 overflow-y-auto px-4 py-3">
        {messages.length === 0 ? (
          <p className="mt-8 text-center text-sm text-[#8d8d8d]">好きな理由を送って会話を始めてください</p>
        ) : null}
        {messages.map((message, index) => (
          <div
            key={`${message.createdAt}-${index}`}
            className={`max-w-[78%] rounded-[20px] px-3.5 py-2.5 text-sm leading-relaxed ${
              message.role === 'user'
                ? 'ml-auto rounded-br-[6px] bg-[#ff9b37] text-white'
                : 'rounded-bl-[6px] bg-[#fff1df] text-[#494949]'
            }`}
          >
            {message.content}
          </div>
        ))}
      </div>

      <div className="border-t border-[#f1e7dc] bg-white px-3 pb-4 pt-3">
        <div className="flex gap-2">
          <input
            className="flex-1 rounded-2xl border border-[#f1e7dc] px-4 py-3 text-sm outline-none transition focus:border-[#ff9b37] focus:ring-2 focus:ring-[#ff9b37]/20"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault()
                void sendMessage()
              }
            }}
            placeholder="例: どんな時に一番ワクワクするか"
            disabled={isSending}
          />
          <button
            type="button"
            onClick={() => void sendMessage()}
            disabled={isSending}
            className="rounded-2xl bg-[#ff9b37] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#e77300] disabled:cursor-wait disabled:opacity-70"
          >
            送信
          </button>
        </div>
        <div className="mt-3 flex justify-end">
          <Link to="/" className="text-xs font-semibold text-[#e77300] underline-offset-2 hover:underline">
            ホームに戻る
          </Link>
        </div>
      </div>
    </div>
  )
}
