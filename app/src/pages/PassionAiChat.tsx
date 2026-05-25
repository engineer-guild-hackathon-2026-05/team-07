import { useEffect, useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import {
  continuePassionInterview,
  finalizePassionInterview,
  loadMakingMessages,
  startPassionInterview,
} from '../lib/passionInterview'
import { loadPassionProfile, type PassionChatMessage } from '../lib/passionRepository'

type PassionAiChatPageProps = {
  userId: string
}

export function PassionAiChatPage({ userId }: PassionAiChatPageProps) {
  const navigate = useNavigate()
  const { passionId } = useParams()
  const [messages, setMessages] = useState<PassionChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [isFinalizing, setIsFinalizing] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [subjectAttractions, setSubjectAttractions] = useState<string[]>([])
  const [replyChoices, setReplyChoices] = useState<string[]>([])

  useEffect(() => {
    if (!passionId) {
      return
    }

    const bootstrap = async () => {
      try {
        const [profile, loadedMessages] = await Promise.all([loadPassionProfile(passionId), loadMakingMessages(passionId)])
        setSubjectAttractions(profile.subjectAttractions)
        setReplyChoices(profile.latestReplyChoices)

        if (loadedMessages.length > 0) {
          setMessages(loadedMessages)
          return
        }

        const started = await startPassionInterview(passionId)
        setMessages(started.messages)
        setReplyChoices(started.choices ?? [])
      } catch {
        setErrorMessage('初期化に失敗しました。時間をおいて再試行してください。')
      }
    }

    void bootstrap()
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
    setErrorMessage('')

    const userMessage: PassionChatMessage = {
      role: 'user',
      content: trimmed,
      createdAt: new Date().toISOString(),
    }

    const nextBase = [...messages, userMessage]
    setMessages(nextBase)
    setInput('')

    try {
      const response = await continuePassionInterview({
        passionId,
        userMessage: trimmed,
      })
      const assistantMessage: PassionChatMessage = {
        role: 'assistant',
        content: response.reply,
        createdAt: new Date().toISOString(),
      }
      setMessages([...nextBase, assistantMessage])
      setReplyChoices(response.choices ?? [])
    } catch {
      setErrorMessage('AI応答の取得に失敗しました。時間をおいて再試行してください。')
      setMessages(messages)
    } finally {
      setIsSending(false)
    }
  }

  const finalizeInterview = async () => {
    if (isFinalizing) {
      return
    }
    setIsFinalizing(true)
    setErrorMessage('')
    try {
      const result = await finalizePassionInterview(passionId)
      setSubjectAttractions(result.subjectAttractions)
      navigate(`/passions/${passionId}/egg-create`)
    } catch {
      setErrorMessage('偏愛魅力の抽出に失敗しました。再試行してください。')
    } finally {
      setIsFinalizing(false)
    }
  }

  return (
    <div className="screen !p-0 flex h-full flex-col bg-[#fffdfb]">
      <header className="border-b border-[#f1e7dc] px-4 py-3">
        <p className="text-xs font-bold uppercase tracking-[0.08em] text-[#e77300]">char-02</p>
        <h1 className="text-lg font-extrabold text-[#1f1f1f]">偏愛AI深掘りチャット</h1>
        <p className="mt-1 text-xs text-[#737373]">好きな理由を会話で深掘りします。</p>
      </header>

      <div className="flex-1 space-y-2 overflow-y-auto px-4 py-3">
        {messages.length === 0 ? (
          <p className="mt-8 text-center text-sm text-[#8d8d8d]">最初の一言を送って深掘りを始めてください</p>
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

        {subjectAttractions.length > 0 ? (
          <div className="mt-4 rounded-2xl border border-[#f1e7dc] bg-white p-3">
            <p className="text-xs font-bold text-[#e77300]">抽出された偏愛対象の魅力</p>
            <ul className="mt-2 grid gap-1 text-xs text-[#494949]">
              {subjectAttractions.map((item) => (
                <li key={item}>・{item}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>

      <div className="screen-footer-bar border-t border-[#f1e7dc] bg-white px-3 pb-4 pt-3">
        <div className="mb-2 flex justify-end">
          <button
            type="button"
            onClick={() => void finalizeInterview()}
            disabled={isFinalizing}
            className="rounded-xl border border-[#f1e7dc] px-3 py-2 text-xs font-semibold text-[#e77300] disabled:opacity-70"
          >
            {isFinalizing ? '抽出中...' : '魅力を抽出して確定'}
          </button>
        </div>

        {replyChoices.length > 0 ? (
          <div className="mb-2 flex flex-wrap gap-2">
            {replyChoices.map((choice) => (
              <button
                key={choice}
                type="button"
                disabled={isSending}
                onClick={() => setInput(choice)}
                className="rounded-full border border-[#f1e7dc] bg-[#fff8f0] px-3 py-1.5 text-xs font-semibold text-[#494949] hover:border-[#ff9b37] hover:text-[#e77300] disabled:opacity-60"
              >
                {choice}
              </button>
            ))}
          </div>
        ) : null}

        <div className="flex gap-2">
          <input
            className="flex-1 rounded-2xl border border-[#f1e7dc] px-4 py-3 text-sm outline-none transition focus:border-[#ff9b37] focus:ring-2 focus:ring-[#ff9b37]/20"
            value={input}
            onChange={(event) => setInput(event.target.value)}
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
        {errorMessage ? <p className="mt-2 text-xs font-semibold text-[#c2410c]">{errorMessage}</p> : null}
        <div className="mt-3 flex justify-end">
          <Link to="/" className="text-xs font-semibold text-[#e77300] underline-offset-2 hover:underline">
            深掘りを終了してホームに戻る
          </Link>
        </div>
      </div>
    </div>
  )
}
