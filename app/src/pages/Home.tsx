import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CharacterIllustration } from '../features/components/CharacterIllustration'
import { getEggForCharacter } from '../lib/viewHelpers'
import type { Character, Egg, User } from '../types/models'

type HomePageProps = {
  characters: Character[]
  eggs: Egg[]
  onLogout: () => Promise<void> | void
  user: User
}

export function HomePage({ characters, eggs, onLogout, user }: HomePageProps) {
  const navigate = useNavigate()
  const character = characters[0]
  const egg = character ? getEggForCharacter(eggs, character) : undefined

  const [msg, setMsg] = useState('')
  const [breathe, setBreathe] = useState(false)
  const [accountOpen, setAccountOpen] = useState(false)

  useEffect(() => {
    const t = window.setInterval(() => setBreathe((b) => !b), 2400)
    return () => window.clearInterval(t)
  }, [])

  const xpRatio = character ? (character.affinityScore % 100) / 100 : 0
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

      {/* Character header */}
      <div className="px-5 pt-2 flex items-center justify-between">
        <button
          type="button"
          onClick={() => character && navigate(`/characters/${character.id}`)}
          disabled={!character}
          className="flex items-center gap-1.5 bg-transparent border-0 p-0 cursor-pointer disabled:cursor-default"
        >
          <span className="text-[18px] font-bold text-[#494949]">
            {character?.name ?? 'まだいません'}
          </span>
          <PencilIcon className="text-[#8A8A8A]" />
        </button>
        <button
          type="button"
          className="relative w-9 h-9 rounded-full bg-[#FFFCF4] border border-[#E5E5E5] flex items-center justify-center cursor-pointer"
          aria-label="お知らせ"
        >
          <BellIcon className="text-[#5C5C5C]" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[#FF9B37] ring-2 ring-[#FFFCF4]" />
        </button>
      </div>

      {/* Level + mood + XP */}
      <div className="px-5 pt-3">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="inline-flex items-center px-2.5 py-[3px] rounded-full bg-[#FFE9D2] text-[#E77300] font-bold text-[12px] whitespace-nowrap">
            Lv. {character?.growthLevel ?? 1}
          </span>
          <span className="inline-flex items-center gap-1 text-[12px] text-[#5C5C5C]">
            ごきげん
            <SmileGlyph />
          </span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#F2E9D6]">
          <div
            className="h-full rounded-full bg-[linear-gradient(90deg,_#F3B85F_0%,_#FF9B37_100%)] transition-[width] duration-500 ease-out"
            style={{ width: `${Math.max(8, xpRatio * 100)}%` }}
          />
        </div>
      </div>

      {/* Character stage */}
      <div className="relative flex flex-1 items-center justify-center min-h-[260px] px-4">
        <RoomBackdrop />

        {character ? (
          <button
            type="button"
            onClick={() => navigate(`/characters/${character.id}`)}
            className="relative z-10 flex h-[230px] w-[230px] cursor-pointer items-end justify-center rounded-full border-0 p-0 bg-[radial-gradient(circle_at_50%_40%,_#FFFCF4_0%,_#FBE3D6_70%,_#F6C9B7_100%)] shadow-[inset_0_-8px_24px_rgba(232,106,78,0.10),inset_0_12px_28px_rgba(255,255,255,0.55),0_14px_30px_rgba(80,50,30,0.10)]"
            aria-label={`${character.name}の詳細を見る`}
          >
            <div
              className={`mb-2 transition-transform duration-[2400ms] ease-in-out ${
                breathe ? 'translate-y-0 scale-[1.015]' : 'translate-y-[2px] scale-100'
              }`}
            >
              <CharacterIllustration egg={egg} size="large" />
            </div>
          </button>
        ) : (
          <div className="relative z-10 flex h-[230px] w-[230px] flex-col items-center justify-center rounded-full px-6 text-center bg-[radial-gradient(circle_at_50%_40%,_#FFFCF4_0%,_#FBE3D6_70%,_#F6C9B7_100%)] shadow-[inset_0_-8px_24px_rgba(232,106,78,0.10),inset_0_12px_28px_rgba(255,255,255,0.55),0_14px_30px_rgba(80,50,30,0.10)]">
            <p className="mb-1 text-[13px] font-bold text-[#494949]">まだキャラがいません</p>
            <p className="mb-3 text-[11px] leading-relaxed text-[#5C5C5C]">
              偏愛を登録すると、卵からキャラが生まれます。
            </p>
            <button
              type="button"
              onClick={() => navigate('/passions/new')}
              className="h-9 cursor-pointer rounded-full bg-[#FF9B37] px-4 text-[12px] font-bold text-[#FFFCF4]"
            >
              偏愛を登録する
            </button>
          </div>
        )}
      </div>

      {/* Action pills */}
      <div className="px-4 pt-1.5 pb-3 grid grid-cols-4 gap-2.5">
        <ActionPill tint="honey" label="ごはん" icon={<BowlIcon />} />
        <ActionPill tint="coral" label="なでる" icon={<HandIcon />} />
        <ActionPill
          tint="sky"
          label="あそぶ"
          icon={<GameIcon />}
          onClick={() => character && navigate(`/characters/${character.id}`)}
        />
        <ActionPill
          tint="sage"
          label="交換"
          icon={<SwapIcon />}
          onClick={() => navigate('/exchange/share')}
        />
      </div>

      {/* Message input */}
      <div className="px-4 pb-[calc(var(--mobile-nav-height,70px)+env(safe-area-inset-bottom,0px)+12px)]">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            if (!msg.trim() || !character) return
            navigate(`/characters/${character.id}`)
          }}
          className="flex items-center gap-2 bg-[#FFFCF4] border border-[#E5E5E5] rounded-full pl-4 pr-1.5 py-1.5 shadow-[0_1px_0_rgba(80,50,30,0.04),0_2px_6px_rgba(80,50,30,0.06)]"
        >
          <input
            value={msg}
            onChange={(e) => setMsg(e.target.value)}
            placeholder={character ? `${character.name}にメッセージを送る…` : 'まだキャラがいません'}
            disabled={!character}
            className="flex-1 bg-transparent border-0 outline-none text-[13px] text-[#494949] py-1.5 placeholder:text-[#B4B4B4] disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={!msg.trim() || !character}
            className={`flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border-0 text-[#FFFCF4] transition-colors duration-150 disabled:cursor-not-allowed ${
              msg.trim() && character ? 'bg-[#17BFE4]' : 'bg-[#A8E3F2]'
            }`}
            aria-label="送信"
          >
            <SendIcon />
          </button>
        </form>
      </div>
    </div>
  )
}

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

function CaretDown() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" className="ml-0.5 text-[#8A8A8A]" aria-hidden>
      <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function PencilIcon({ className }: { className?: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4L16.5 3.5z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
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
      <path
        d="M5.5 9.5 Q 8 11.5 10.5 9.5"
        stroke="#2A1814"
        strokeWidth="1"
        fill="none"
        strokeLinecap="round"
      />
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

function SendIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M3 12 21 4l-8 18-2-8-8-2z" />
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
