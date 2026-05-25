import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { AppData, Character, Chat, ChatMessage, Egg, User } from '../types/models'
import { ChatBubble, ChatInput } from '../features/character-growing'
import { CharacterIllustration } from '../features/components/CharacterIllustration'
import { generateAiReply } from '../lib/aiReply'
import { fetchChatMessages, sendMessageToCharacter } from '../lib/chatRepository'
import { advanceLocalHatchProgress, STORAGE_KEY } from '../lib/localRepository'
import { auth } from '../firebase/firebase'
import { Modal } from './ui'

type CharacterChatProps = {
  character: Character
  egg: Egg
  isPreHatch?: boolean
  userId: string
  user: User
  onDataChange?: (data: AppData) => void
  onLogout: () => Promise<void> | void
}

const createId = (prefix: string) =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? `${prefix}-${crypto.randomUUID()}`
    : `${prefix}-${Date.now()}`

function readChat(characterId: string, userId: string): Chat | undefined {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return undefined
    const data = JSON.parse(raw) as { chats?: Chat[] }
    return data.chats?.find((c) => c.characterId === characterId && c.userUid === userId)
  } catch {
    return undefined
  }
}

function persistChat(chat: Chat): void {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const data = raw ? (JSON.parse(raw) as { chats?: Chat[] }) : {}
    const chats = Array.isArray(data.chats) ? [...data.chats] : []
    const idx = chats.findIndex((c) => c.id === chat.id)
    if (idx >= 0) chats[idx] = chat
    else chats.push(chat)
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...data, chats }))
  } catch {
    // Local demo history is non-critical
  }
}

function buildMockReply(character: Character, userText: string): string {
  const pool = [
    `（${character.name}）「${character.unlockedTopics[0] ?? 'それ'}」について、もう少し聞かせてください。`,
    `（${character.name}）${character.knowledgeAreas[0] ?? 'そのこと'}との繋がりが見えてきた気がします。`,
    `（${character.name}）${userText.length > 12 ? 'なるほど、そういうことか。' : 'うん、もっと聞きたいです。'}`,
  ]
  return pool[Math.floor(Math.random() * pool.length)]
}

export function CharacterChat({
  character,
  egg,
  isPreHatch = false,
  userId,
  user,
  onDataChange,
  onLogout,
}: CharacterChatProps) {
  const navigate = useNavigate()
  const historyBottomRef = useRef<HTMLDivElement>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [showStatus, setShowStatus] = useState(false)
  const [lastCharReply, setLastCharReply] = useState<string | null>(null)
  const [replyFading, setReplyFading] = useState(false)
  const [breathe, setBreathe] = useState(false)
  const [accountOpen, setAccountOpen] = useState(false)

  const [chat, setChat] = useState<Chat>(
    () =>
      readChat(character.id, userId) ?? {
        id: createId('chat'),
        characterId: character.id,
        userUid: userId,
        messages: [],
        updatedAt: new Date().toISOString(),
      },
  )

  useEffect(() => {
    const t = window.setInterval(() => setBreathe((b) => !b), 2400)
    return () => window.clearInterval(t)
  }, [])

  useEffect(() => {
    const firebaseUser = auth.currentUser
    if (!firebaseUser) return
    fetchChatMessages(character.id, firebaseUser.uid)
      .then((messages) => {
        if (messages.length > 0) {
          setChat((prev) => ({ ...prev, messages }))
        }
      })
      .catch(() => {})
  }, [character.id])

  useEffect(() => {
    if (!lastCharReply) return
    const fadeTimer = setTimeout(() => setReplyFading(true), 3000)
    const clearTimer = setTimeout(() => {
      setLastCharReply(null)
      setReplyFading(false)
    }, 4200)
    return () => {
      clearTimeout(fadeTimer)
      clearTimeout(clearTimer)
    }
  }, [lastCharReply])

  const sendMessage = useCallback(
    async (content: string) => {
      const trimmed = content.trim()
      if (!trimmed) return

      const now = new Date().toISOString()
      const userMsg: ChatMessage = {
        id: createId('msg'),
        role: 'user',
        content: trimmed,
        createdAt: now,
      }

      setChat((prev) => {
        const next = { ...prev, messages: [...prev.messages, userMsg], updatedAt: now }
        persistChat(next)
        return next
      })

      const firebaseUser = auth.currentUser
      if (isPreHatch && !firebaseUser) {
        const progress = advanceLocalHatchProgress(egg.id, userId)
        if (progress) {
          onDataChange?.(progress.data)
        }
      }

      setIsLoading(true)
      setReplyFading(false)

      let replyText = ''
      try {
        if (firebaseUser && !isPreHatch) {
          replyText = await sendMessageToCharacter({
            characterId: character.id,
            userMessage: trimmed,
          })
        } else {
          replyText = await generateAiReply({
            promptType: 'character_growing',
            message: trimmed,
            context: `characterName=${character.name}; personality=${character.personality}; knowledgeAreas=${character.knowledgeAreas.join(',')}; hatchLevel=${egg.hatchLevel}`,
          })
        }
      } catch {
        replyText = buildMockReply(character, trimmed)
      }

      const characterMessage: ChatMessage = {
        id: createId('msg'),
        role: 'character',
        content: replyText,
        createdAt: new Date().toISOString(),
      }

      setIsLoading(false)
      setLastCharReply(characterMessage.content)
      setChat((prev) => {
        const next = {
          ...prev,
          messages: [...prev.messages, characterMessage],
          updatedAt: new Date().toISOString(),
        }
        persistChat(next)
        return next
      })
    },
    [character, egg.hatchLevel, egg.id, isPreHatch, onDataChange, userId],
  )

  const xpRatio = isPreHatch ? egg.hatchLevel / 100 : (character.affinityScore % 100) / 100
  const userHandle = user.name || 'guest'
  const accountEmail = '@' + user.uid.slice(0, 8)

  return (
    <div className="relative flex w-full min-h-[100svh] flex-col overflow-hidden font-sans bg-[#FBF6EC]">
      {/* Account chip */}
      <div className="relative z-10 px-3.5 pt-2">
        <button
          type="button"
          onClick={() => setAccountOpen((o) => !o)}
          className="inline-flex items-center gap-2 bg-[#FFFCF4] border border-[#E5E5E5] rounded-full pr-3 py-1 pl-1 shadow-[0_1px_0_rgba(80,50,30,0.04),0_2px_6px_rgba(80,50,30,0.06)] cursor-pointer"
          aria-haspopup="menu"
          aria-expanded={accountOpen}
        >
          <span
            className="flex h-7 w-7 items-center justify-center rounded-full text-[12px] font-bold text-[#FFFCF4] bg-[radial-gradient(circle_at_30%_30%,_#FFD2A1_0%,_#FF9B37_100%)]"
            aria-hidden
          >
            {userHandle.slice(0, 1).toUpperCase()}
          </span>
          <span className="flex flex-col items-start leading-tight">
            <span className="text-[10px] tracking-wide text-[#8A8A8A]">おかえりなさい</span>
            <span className="text-[12.5px] font-bold text-[#494949]">@{userHandle}</span>
          </span>
          <CaretDown />
        </button>

        {accountOpen ? (
          <div
            role="menu"
            className="absolute left-3.5 top-[calc(100%+4px)] z-20 min-w-[200px] bg-[#FFFCF4] border border-[#E5E5E5] rounded-2xl shadow-[0_2px_0_rgba(80,50,30,0.05),0_16px_36px_rgba(80,50,30,0.12)] p-1.5"
          >
            <div className="px-3 py-2 border-b border-[#E5E5E5]">
              <div className="text-[13px] font-bold text-[#494949]">{user.name}</div>
              <div className="text-[11px] text-[#8A8A8A] mt-0.5 truncate">{accountEmail}</div>
            </div>
            <MenuItem
              label="プロフィール"
              onClick={() => {
                setAccountOpen(false)
                navigate('/profile')
              }}
            />
            <MenuItem
              label="偏愛を追加"
              onClick={() => {
                setAccountOpen(false)
                navigate('/passions/new')
              }}
            />
            <MenuItem
              label="ログアウト"
              danger
              onClick={() => {
                setAccountOpen(false)
                void onLogout()
              }}
            />
          </div>
        ) : null}
      </div>

      {/* Character name + affinity badge | bell */}
      <div className="px-5 pt-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[18px] font-bold text-[#494949]">
            {isPreHatch ? `${egg.name}の卵` : character.name}
          </span>
          {isPreHatch ? (
            <span className="inline-flex items-center px-2.5 py-[3px] rounded-full bg-[#FFF1DF] text-[#E77300] font-bold text-[11px] whitespace-nowrap">
              孵化前
            </span>
          ) : (
            <AffinityBadge value={character.affinityScore} />
          )}
        </div>
        <button
          type="button"
          className="relative w-9 h-9 rounded-full bg-[#FFFCF4] border border-[#E5E5E5] flex items-center justify-center cursor-pointer"
          aria-label="お知らせ"
        >
          <BellIcon className="text-[#5C5C5C]" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[#FF9B37] ring-2 ring-[#FFFCF4]" />
        </button>
      </div>

      {/* Level + mood + XP bar */}
      <div className="px-5 pt-3">
        <div className="flex items-center gap-2 mb-1.5">
          {isPreHatch ? (
            <span className="inline-flex items-center px-2.5 py-[3px] rounded-full bg-[#FFE9D2] text-[#E77300] font-bold text-[12px] whitespace-nowrap">
              孵化 {egg.hatchLevel}%
            </span>
          ) : (
            <>
              <span className="inline-flex items-center px-2.5 py-[3px] rounded-full bg-[#FFE9D2] text-[#E77300] font-bold text-[12px] whitespace-nowrap">
                Lv. {character.growthLevel}
              </span>
              <span className="inline-flex items-center gap-1 text-[12px] text-[#5C5C5C]">
                ごきげん
                <SmileGlyph />
              </span>
            </>
          )}
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#F2E9D6]">
          <div
            className="h-full rounded-full bg-[linear-gradient(90deg,_#F3B85F_0%,_#FF9B37_100%)] transition-[width] duration-500 ease-out"
            style={{ width: `${Math.max(8, xpRatio * 100)}%` }}
          />
        </div>
        {isPreHatch ? (
          <p className="mt-2 text-[11px] leading-relaxed text-[#5C5C5C]">
            まだキャラは孵化していません。話しかけて卵を育てましょう。
          </p>
        ) : null}
      </div>

      {/* History button — top-right, below header */}
      <button
        type="button"
        onClick={() => setShowHistory(true)}
        aria-label="会話履歴を見る"
        className="absolute top-36 right-3 z-10 flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#fff8f0] border border-[#f1e7dc] text-[#e77300] text-xs font-bold shadow-sm hover:bg-[#fff1df] transition-colors"
      >
        <span aria-hidden>🕐</span> 履歴
      </button>

      {/* Character stage — speech bubble + illustration + status button */}
      <div className="relative flex flex-1 items-end justify-center min-h-[260px] px-4 pb-12">
        <RoomBackdrop />

        <div className="relative z-10 flex flex-col items-center gap-2">
          {/* Speech bubble — absolutely above the illustration, doesn't shift character position */}
          {(isLoading || lastCharReply !== null) && (
            <div
              className={`absolute bottom-full mb-3 left-1/2 -translate-x-1/2 w-max max-w-[240px] z-20 transition-opacity duration-[1200ms] ${replyFading ? 'opacity-0' : 'opacity-100'}`}
            >
              <div className="relative bg-white border border-[#f1e7dc] rounded-2xl px-4 py-3 shadow-md">
                {isLoading ? (
                  <span className="inline-flex items-center gap-1 text-sm text-[#494949]/60">
                    考え中
                    <span className="flex gap-0.5">
                      <Dot delay="0ms" />
                      <Dot delay="160ms" />
                      <Dot delay="320ms" />
                    </span>
                  </span>
                ) : (
                  <p className="text-sm text-[#494949] leading-relaxed">{lastCharReply}</p>
                )}
                <div className="absolute -bottom-[7px] left-1/2 -translate-x-1/2 w-3.5 h-3.5 bg-white border-r border-b border-[#f1e7dc] rotate-45" />
              </div>
            </div>
          )}

          {/* Character illustration with breathing animation */}
          <div
            className={`transition-transform duration-[2400ms] ease-in-out ${
              breathe ? 'translate-y-0 scale-[1.015]' : 'translate-y-[2px] scale-100'
            }`}
          >
            <CharacterIllustration egg={egg} size="large" showAsEgg={isPreHatch} />
          </div>

          {/* Status button right below the character */}
          <button
            type="button"
            onClick={() => setShowStatus(true)}
            className="text-xs text-[#e77300] font-bold px-3 py-1 rounded-full border border-[#f1e7dc] bg-[#fff8f0] hover:bg-[#fff1df] transition-colors"
          >
            {isPreHatch ? '卵の情報を見る ›' : 'ステータスを見る ›'}
          </button>
        </div>
      </div>

      {/* Action pills — 孵化前はまだ使えない */}
      {!isPreHatch ? (
        <div className="px-4 pt-1.5 pb-3 grid grid-cols-4 gap-2.5">
          <ActionPill tint="honey" label="ごはん" icon={<BowlIcon />} />
          <ActionPill tint="coral" label="なでる" icon={<HandIcon />} />
          <ActionPill tint="sky" label="あそぶ" icon={<GameIcon />} />
          <ActionPill
            tint="sage"
            label="交換"
            icon={<SwapIcon />}
            onClick={() => navigate('/exchange/share')}
          />
        </div>
      ) : null}

      {/* Spacer so content isn't hidden behind the floating ChatInput */}
      <div className="h-[calc(80px+env(safe-area-inset-bottom,0px))]" />

      {/* Chat input (absolute-positioned above bottom nav) */}
      <ChatInput onSend={sendMessage} disabled={isLoading} />

      {/* Status modal */}
      <Modal
        isOpen={showStatus}
        onClose={() => setShowStatus(false)}
        title={isPreHatch ? '卵の情報' : 'キャラクターステータス'}
      >
        <div className="flex flex-col gap-4 mt-2">
          {isPreHatch ? (
            <>
              <StatusRow label="卵の名前">
                <p className="text-sm text-[#494949]">{egg.name}</p>
              </StatusRow>
              <StatusRow label="孵化の進み">
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-[#f1e7dc] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#ff9b37] rounded-full transition-[width] duration-300"
                      style={{ width: `${Math.max(8, egg.hatchLevel)}%` }}
                    />
                  </div>
                  <span className="text-sm font-bold text-[#e77300]">{egg.hatchLevel}%</span>
                </div>
              </StatusRow>
              <StatusRow label="中身の偏愛">
                <p className="text-sm text-[#494949]">{egg.characterPrompt}</p>
              </StatusRow>
            </>
          ) : (
            <>
              <StatusRow label="性格">
                <p className="text-sm text-[#494949]">{character.personality}</p>
              </StatusRow>
          <StatusRow label="成長レベル">
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-[#f1e7dc] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#ff9b37] rounded-full transition-[width] duration-300"
                  style={{ width: `${Math.min(100, character.growthLevel * 20)}%` }}
                />
              </div>
              <span className="text-sm font-bold text-[#e77300]">Lv.{character.growthLevel}</span>
            </div>
          </StatusRow>
          <StatusRow label="親密度">
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-[#fce7f3] rounded-full overflow-hidden">
                <div
                  className="h-full bg-pink-300 rounded-full transition-[width] duration-300"
                  style={{ width: `${Math.min(100, character.affinityScore)}%` }}
                />
              </div>
              <span className="text-sm font-bold text-pink-400">{character.affinityScore}</span>
            </div>
          </StatusRow>
          <StatusRow label="知識領域">
            <div className="flex flex-wrap gap-1.5">
              {character.knowledgeAreas.map((area) => (
                <span
                  key={area}
                  className="rounded-full px-[11px] py-[7px] bg-[#eafffb] text-[#1598a5] text-xs font-extrabold"
                >
                  {area}
                </span>
              ))}
            </div>
          </StatusRow>
          <StatusRow label="解放済みトピック">
            <div className="flex flex-wrap gap-1.5">
              {character.unlockedTopics.length > 0 ? (
                character.unlockedTopics.map((topic) => (
                  <span
                    key={topic}
                    className="rounded-full px-[11px] py-[7px] bg-[#eafffb] text-[#1598a5] text-xs font-extrabold"
                  >
                    {topic}
                  </span>
                ))
              ) : (
                <span className="text-xs text-[#494949]/50">まだありません</span>
              )}
            </div>
          </StatusRow>
            </>
          )}
        </div>
      </Modal>

      {/* History modal */}
      <Modal isOpen={showHistory} onClose={() => setShowHistory(false)} title="会話履歴">
        <div className="flex flex-col gap-2.5 min-h-[300px] max-h-[50vh] overflow-y-auto pt-2">
          {chat.messages.length === 0 ? (
            <p className="text-sm text-center text-[#494949]/50 py-4">まだメッセージはありません</p>
          ) : (
            chat.messages.map((msg) => <ChatBubble key={msg.id} message={msg} />)
          )}
          <div ref={historyBottomRef} />
        </div>
      </Modal>
    </div>
  )
}

// ── Sub-components ──────────────────────────────────────────────────────────

type ActionTint = 'honey' | 'coral' | 'sky' | 'sage'

const TINT_CLASSES: Record<ActionTint, string> = {
  honey: 'bg-[#FBF1DC] text-[#D9962E]',
  coral: 'bg-[#FFE9D2] text-[#E77300]',
  sky: 'bg-[#E0F5FB] text-[#17BFE4]',
  sage: 'bg-[#E6EFE5] text-[#5E8462]',
}

function ActionPill({
  tint,
  label,
  icon,
  onClick,
}: {
  tint: ActionTint
  label: string
  icon: React.ReactNode
  onClick?: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex cursor-pointer flex-col items-center gap-1 border-0 bg-transparent p-0 transition-transform duration-150 active:scale-[0.97]"
    >
      <span
        className={`flex h-[52px] w-[52px] items-center justify-center rounded-[18px] shadow-[0_2px_6px_rgba(80,50,30,0.06)] ${TINT_CLASSES[tint]}`}
      >
        {icon}
      </span>
      <span className="text-[11px] font-medium text-[#5C5C5C]">{label}</span>
    </button>
  )
}

function MenuItem({
  label,
  danger,
  onClick,
}: {
  label: string
  danger?: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className={`w-full text-left px-3 py-2 rounded-lg text-[13px] font-medium cursor-pointer hover:bg-[#F7F0DE] ${
        danger ? 'text-[#E77300]' : 'text-[#5C5C5C]'
      }`}
    >
      {label}
    </button>
  )
}

function AffinityBadge({ value }: { value: number }) {
  return (
    <div className="relative flex items-center justify-center w-8 h-7" aria-label={`親密度 ${value}`}>
      <svg viewBox="0 0 40 36" className="w-full h-full" fill="#fce7f3" aria-hidden="true">
        <path d="M20 33C20 33 3 22 3 12C3 6.5 7.5 2 13 2C16 2 18.5 4 20 6C21.5 4 24 2 27 2C32.5 2 37 6.5 37 12C37 22 20 33 20 33Z" />
      </svg>
      <span className="absolute text-[10px] font-black text-pink-300 leading-none" style={{ marginTop: 2 }}>
        {value}
      </span>
    </div>
  )
}

function StatusRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-black text-[#e77300] uppercase tracking-wide">{label}</span>
      {children}
    </div>
  )
}

function Dot({ delay }: { delay: string }) {
  return (
    <span
      className="w-1 h-1 rounded-full bg-[#ff9b37] animate-bounce"
      style={{ animationDelay: delay }}
    />
  )
}

function CaretDown() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" className="ml-0.5 text-[#8A8A8A]" aria-hidden>
      <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function BellIcon({ className }: { className?: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M6 8a6 6 0 1 1 12 0c0 6 2 8 2 8H4s2-2 2-8zm3 12a3 3 0 0 0 6 0"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function SmileGlyph() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden>
      <circle cx="8" cy="8" r="7" fill="#F3B85F" />
      <circle cx="5.6" cy="7" r="0.9" fill="#2A1814" />
      <circle cx="10.4" cy="7" r="0.9" fill="#2A1814" />
      <path d="M5.5 9.5 Q 8 11.5 10.5 9.5" stroke="#2A1814" strokeWidth="1" fill="none" strokeLinecap="round" />
    </svg>
  )
}

function BowlIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M3 11h18v2a8 8 0 0 1-16 0v-2zm2-2c0-1.5 3-3 7-3s7 1.5 7 3"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M12 4v1.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

function HandIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M8 11V5a1.5 1.5 0 1 1 3 0v6m0 0V4a1.5 1.5 0 1 1 3 0v7m0 0V6.5a1.5 1.5 0 1 1 3 0V14a6 6 0 0 1-6 6h-1a6 6 0 0 1-6-6v-1.5A1.5 1.5 0 0 1 5.5 11 1.5 1.5 0 0 1 7 12.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function GameIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M6 8h12a3 3 0 0 1 3 3v3a3 3 0 0 1-5.5 1.7L14 14h-4l-1.5 1.7A3 3 0 0 1 3 14v-3a3 3 0 0 1 3-3z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M8 11h2m-1-1v2m5 0h1m1-1h-1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

function SwapIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M7 7h11l-3-3m3 3-3 3M17 17H6l3 3m-3-3 3-3"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function RoomBackdrop() {
  return (
    <svg
      viewBox="0 0 380 280"
      preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 w-full h-full pointer-events-none opacity-50"
      aria-hidden
    >
      <rect x="0" y="180" width="380" height="100" fill="#F7E6D2" opacity="0.5" />
      <rect x="20" y="40" width="58" height="74" rx="6" fill="#FBF1DC" stroke="#E8DEC5" strokeWidth="1.2" />
      <line x1="49" y1="40" x2="49" y2="114" stroke="#E8DEC5" strokeWidth="1" />
      <line x1="20" y1="77" x2="78" y2="77" stroke="#E8DEC5" strokeWidth="1" />
      <ellipse cx="42" cy="190" rx="18" ry="6" fill="#D8B98C" opacity="0.7" />
      <rect x="32" y="160" width="20" height="30" rx="3" fill="#C49266" />
      <path d="M42 160 Q 28 130 30 110 Q 38 128 42 158" fill="#7FA482" />
      <path d="M42 160 Q 56 132 56 112 Q 48 130 44 158" fill="#7FA482" />
      <path d="M42 160 Q 42 122 42 100" stroke="#5E8462" strokeWidth="2" fill="none" />
    </svg>
  )
}
