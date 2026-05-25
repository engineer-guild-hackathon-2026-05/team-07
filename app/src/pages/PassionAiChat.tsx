import type { ReactNode } from 'react'
import { useEffect, useRef, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { generateAiReply } from '../lib/aiReply'
import { appendPassionChatHistory, loadPassionChatHistory, type PassionChatMessage } from '../lib/passionRepository'

type PassionAiChatPageProps = {
  userId: string
}

const QUICK_REPLIES = ['夜に聴くのが好き', 'ひとりの時間が好き', '誰かに勧めたい']

export function PassionAiChatPage({ userId }: PassionAiChatPageProps) {
  const navigate = useNavigate()
  const { passionId } = useParams()
  const [messages, setMessages] = useState<PassionChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const scrollRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!passionId) {
      return
    }
    loadPassionChatHistory(passionId).then(setMessages).catch(() => setMessages([]))
  }, [passionId])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isSending])

  if (!userId) {
    return <Navigate to="/login" replace />
  }

  if (!passionId) {
    return <Navigate to="/passions/new" replace />
  }

  const sendMessage = async (text?: string) => {
    const trimmed = (text ?? input).trim()
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
      const reply = await generateAiReply({
        promptType: 'character_making',
        message: trimmed,
        context: `passionId=${passionId}`,
      })
      const assistantMessage: PassionChatMessage = {
        role: 'assistant',
        content: reply,
        createdAt: new Date().toISOString(),
      }
      const nextMessages = [...nextBase, assistantMessage]
      setMessages(nextMessages)
      await appendPassionChatHistory(passionId, [userMessage, assistantMessage])
    } catch {
      setErrorMessage('AI応答の取得に失敗しました。時間をおいて再試行してください。')
      setMessages(messages)
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div
      className="screen !p-0"
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--paper)',
        fontFamily: 'var(--font-body)',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Hero band with mascot */}
      <div
        style={{
          position: 'relative',
          background: 'linear-gradient(135deg, #17BFE4 0%, #5BD2EF 60%, #A8E3F2 100%)',
          padding: '14px 18px 50px',
          borderRadius: '0 0 32px 32px',
          color: '#FFFCF4',
          overflow: 'hidden',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div
            style={{
              display: 'inline-flex',
              gap: 6,
              alignItems: 'center',
              background: 'rgba(255,252,244,0.18)',
              padding: '4px 10px',
              borderRadius: 999,
            }}
          >
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                style={{
                  width: i === 1 ? 18 : 6,
                  height: 6,
                  borderRadius: 999,
                  background: i === 1 ? '#FFFCF4' : 'rgba(255,252,244,0.5)',
                }}
              />
            ))}
            <span
              style={{
                marginLeft: 4,
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.04em',
              }}
            >
              STEP 2 / 3
            </span>
          </div>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: 'rgba(255,252,244,0.95)',
              color: '#0E91AE',
              padding: '4px 12px',
              borderRadius: 999,
              fontWeight: 800,
              fontSize: 11,
              letterSpacing: '0.16em',
            }}
          >
            <SparkleIcon size={12} />
            CHAR-02
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 14 }}>
          <MascotBadge />
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 900,
                fontSize: 22,
                margin: 0,
                color: '#FFFCF4',
                textShadow: '0 2px 0 rgba(14,145,174,0.18)',
              }}
            >
              偏愛AI深掘りチャット
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: '#7FE5A0',
                  boxShadow: '0 0 0 2px rgba(127,229,160,0.35)',
                }}
              />
              <span style={{ fontSize: 12, color: '#E9FAFE', fontWeight: 600 }}>
                モフAI · オンライン
              </span>
            </div>
          </div>
        </div>
        <ChatSparkles />
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        style={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          padding: '10px 16px 6px',
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          marginTop: -28,
          zIndex: 2,
          position: 'relative',
        }}
      >
        {messages.length === 0 ? (
          <EmptyChatState />
        ) : (
          <>
            <div
              style={{
                textAlign: 'center',
                fontSize: 10,
                color: 'var(--ink-3)',
                margin: '4px 0 2px',
                letterSpacing: '0.08em',
              }}
            >
              今日 ・ 深掘りスタート
            </div>
            {messages.map((m, i) => (
              <ChatBubble key={`${m.createdAt}-${i}`} role={m.role} text={m.content} />
            ))}
            {isSending ? (
              <ChatBubble role="assistant">
                <TypingDots />
              </ChatBubble>
            ) : null}
          </>
        )}
      </div>

      {/* Quick replies */}
      {messages.length > 0 && !isSending ? (
        <div
          style={{
            padding: '6px 16px 4px',
            display: 'flex',
            gap: 6,
            overflowX: 'auto',
            flexShrink: 0,
          }}
        >
          {QUICK_REPLIES.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => void sendMessage(q)}
              style={{
                whiteSpace: 'nowrap',
                padding: '6px 14px',
                borderRadius: 999,
                background: 'var(--card)',
                color: 'var(--coral-deep)',
                border: '1.5px solid var(--coral-soft)',
                fontFamily: 'var(--font-body)',
                fontWeight: 700,
                fontSize: 12,
                cursor: 'pointer',
                flexShrink: 0,
              }}
            >
              {q}
            </button>
          ))}
        </div>
      ) : null}

      {/* Composer */}
      <div
        className="screen-footer-bar"
        style={{ padding: '8px 16px 16px', flexShrink: 0 }}
      >
        <div
          style={{
            display: 'flex',
            gap: 8,
            alignItems: 'center',
            background: 'var(--card)',
            border: '1.5px solid var(--card-edge)',
            borderRadius: 999,
            padding: '5px 5px 5px 18px',
            boxShadow: '0 4px 10px rgba(80,50,30,0.06)',
          }}
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                void sendMessage()
              }
            }}
            placeholder="例: どんな時に一番ワクワクするか"
            disabled={isSending}
            style={{
              flex: 1,
              height: 38,
              border: 0,
              background: 'transparent',
              outline: 'none',
              fontFamily: 'var(--font-body)',
              fontSize: 13.5,
              color: 'var(--ink)',
            }}
          />
          <button
            type="button"
            onClick={() => void sendMessage()}
            disabled={isSending || !input.trim()}
            style={{
              padding: '0 18px',
              height: 42,
              borderRadius: 999,
              background:
                input.trim() && !isSending
                  ? 'linear-gradient(180deg, #FFA84E 0%, #FF9B37 60%, #E77300 100%)'
                  : 'var(--paper-deep)',
              color: input.trim() && !isSending ? '#FFFCF4' : 'var(--ink-4)',
              border: 0,
              fontFamily: 'var(--font-body)',
              fontWeight: 800,
              fontSize: 13,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              boxShadow: input.trim() && !isSending ? '0 4px 12px rgba(255,155,55,0.35)' : 'none',
              cursor: input.trim() && !isSending ? 'pointer' : 'default',
              transition: 'all 140ms var(--ease-out)',
            }}
          >
            <PaperPlaneIcon />
            送信
          </button>
        </div>
        {errorMessage ? (
          <p
            style={{
              marginTop: 8,
              fontSize: 12,
              fontWeight: 700,
              color: '#c2410c',
              textAlign: 'center',
            }}
          >
            {errorMessage}
          </p>
        ) : null}
        <div style={{ textAlign: 'right', marginTop: 6 }}>
          <Link
            to="/"
            style={{
              fontSize: 11,
              color: 'var(--ink-3)',
              textDecoration: 'underline',
              textDecorationColor: 'var(--ink-4)',
              textUnderlineOffset: 2,
            }}
          >
            深掘りを終了してホームに戻る
          </Link>
        </div>
      </div>
    </div>
  )
}

// === Subcomponents ===

function MascotBadge() {
  return (
    <div
      style={{
        width: 60,
        height: 60,
        borderRadius: '50%',
        background: 'radial-gradient(circle at 30% 30%, #FFFCF4 0%, #E0F5FB 65%, #A8E3F2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 10px 24px rgba(14,145,174,0.25), 0 1px 0 rgba(255,255,255,0.7) inset',
        flexShrink: 0,
        position: 'relative',
      }}
    >
      <ChatMascot />
      <span
        style={{
          position: 'absolute',
          top: -4,
          right: -2,
          width: 16,
          height: 16,
          background: '#FFFCF4',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
          color: '#FF9B37',
        }}
      >
        <SparkleIcon size={10} />
      </span>
    </div>
  )
}

function ChatMascot() {
  return (
    <svg width="44" height="44" viewBox="0 0 60 60">
      <path d="M14 16 Q 12 6 22 12 Q 26 16 22 22 Z" fill="#A8E3F2" />
      <path d="M46 16 Q 48 6 38 12 Q 34 16 38 22 Z" fill="#A8E3F2" />
      <circle cx="30" cy="32" r="20" fill="#A8E3F2" />
      <circle cx="30" cy="32" r="20" fill="url(#chatfur)" opacity="0.5" />
      <defs>
        <radialGradient id="chatfur" cx="50%" cy="35%" r="60%">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#A8E3F2" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx="23" cy="32" rx="2" ry="2.6" fill="#1B3A4A" />
      <ellipse cx="37" cy="32" rx="2" ry="2.6" fill="#1B3A4A" />
      <circle cx="24" cy="30.5" r="0.7" fill="#fff" />
      <circle cx="38" cy="30.5" r="0.7" fill="#fff" />
      <path d="M26 38 Q 30 41 34 38" stroke="#1B3A4A" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <ellipse cx="19" cy="36" rx="2.2" ry="1.4" fill="#FF9B37" opacity="0.45" />
      <ellipse cx="41" cy="36" rx="2.2" ry="1.4" fill="#FF9B37" opacity="0.45" />
    </svg>
  )
}

function ChatSparkles() {
  return (
    <svg
      viewBox="0 0 360 160"
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        opacity: 0.7,
      }}
    >
      <g fill="#FFFCF4">
        <SVGSparkle cx={300} cy={28} r={8} />
        <SVGSparkle cx={330} cy={70} r={5} />
        <SVGSparkle cx={280} cy={110} r={6} />
        <SVGSparkle cx={20} cy={20} r={5} />
      </g>
    </svg>
  )
}

function SVGSparkle({ cx, cy, r }: { cx: number; cy: number; r: number }) {
  return (
    <path
      d={`M${cx} ${cy - r} L${cx + r * 0.35} ${cy - r * 0.35} L${cx + r} ${cy} L${cx + r * 0.35} ${cy + r * 0.35} L${cx} ${cy + r} L${cx - r * 0.35} ${cy + r * 0.35} L${cx - r} ${cy} L${cx - r * 0.35} ${cy - r * 0.35} Z`}
      opacity="0.85"
    />
  )
}

function ChatBubble({
  role,
  text,
  children,
}: {
  role: 'user' | 'assistant'
  text?: string
  children?: ReactNode
}) {
  const isUser = role === 'user'
  return (
    <div
      style={{
        display: 'flex',
        gap: 8,
        alignSelf: isUser ? 'flex-end' : 'flex-start',
        maxWidth: '84%',
        alignItems: 'flex-end',
      }}
    >
      {!isUser ? (
        <div
          style={{
            width: 30,
            height: 30,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #A8E3F2, #17BFE4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            boxShadow: '0 2px 6px rgba(14,145,174,0.25)',
          }}
        >
          <MiniMofu />
        </div>
      ) : null}
      <div
        style={{
          background: isUser ? 'linear-gradient(180deg, #FFE3C8, #FFD2A1)' : 'var(--card)',
          color: 'var(--ink)',
          padding: '10px 14px',
          borderRadius: isUser ? '20px 20px 6px 20px' : '6px 20px 20px 20px',
          fontSize: 13,
          lineHeight: 1.55,
          border: isUser ? '1px solid #FFC791' : '1px solid var(--card-edge)',
          boxShadow: 'var(--shadow-1)',
          position: 'relative',
        }}
      >
        {text}
        {children}
      </div>
    </div>
  )
}

function TypingDots() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '2px 0' }}>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          style={{
            width: 7,
            height: 7,
            borderRadius: '50%',
            background: 'var(--ink-4)',
            animation: `mofuBlink 1.2s ${i * 0.15}s var(--ease-in-out) infinite`,
          }}
        />
      ))}
    </div>
  )
}

function EmptyChatState() {
  return (
    <div style={{ margin: 'auto', textAlign: 'center', padding: '24px 18px' }}>
      <div
        style={{
          width: 78,
          height: 78,
          borderRadius: '50%',
          margin: '0 auto 14px',
          background: 'radial-gradient(circle at 30% 30%, #FFFCF4, #FFE9D2)',
          boxShadow: 'inset 0 -6px 14px rgba(231,115,0,0.10), 0 6px 14px rgba(80,50,30,0.10)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--coral)',
        }}
      >
        <ChatsCircleIcon />
      </div>
      <div
        style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 900,
          fontSize: 16,
          color: 'var(--ink)',
          marginBottom: 6,
        }}
      >
        さあ、はじめよう
      </div>
      <p style={{ margin: 0, fontSize: 12, color: 'var(--ink-3)', lineHeight: 1.6 }}>
        最初の一言を送って
        <br />
        深掘りを始めてください
      </p>
    </div>
  )
}

function MiniMofu() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24">
      <ellipse cx="12" cy="13" rx="9" ry="8.5" fill="#FFFCF4" />
      <ellipse cx="9" cy="12" rx="1" ry="1.4" fill="#1B3A4A" />
      <ellipse cx="15" cy="12" rx="1" ry="1.4" fill="#1B3A4A" />
      <path d="M9 16 Q 12 17.5 15 16" stroke="#1B3A4A" strokeWidth="1" fill="none" strokeLinecap="round" />
      <ellipse cx="6.5" cy="14" rx="1.4" ry="0.9" fill="#FF9B37" opacity="0.5" />
      <ellipse cx="17.5" cy="14" rx="1.4" ry="0.9" fill="#FF9B37" opacity="0.5" />
    </svg>
  )
}

// === Inline icons (replaces phosphor-icons from mock) ===

function SparkleIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2l1.7 6.3L20 10l-6.3 1.7L12 18l-1.7-6.3L4 10l6.3-1.7L12 2z" />
    </svg>
  )
}

function PaperPlaneIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M2 21l21-9L2 3v7l15 2-15 2z" />
    </svg>
  )
}

function ChatsCircleIcon() {
  return (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2a10 10 0 0 0-8.6 15.07L2 22l4.93-1.4A10 10 0 1 0 12 2zm0 18a8 8 0 0 1-4.07-1.11l-.29-.17-2.93.83.83-2.93-.17-.29A8 8 0 1 1 12 20z" />
      <circle cx="8" cy="12" r="1.5" />
      <circle cx="12" cy="12" r="1.5" />
      <circle cx="16" cy="12" r="1.5" />
    </svg>
  )
}
