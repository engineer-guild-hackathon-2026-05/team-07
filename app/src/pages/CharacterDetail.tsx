import { useState, type Dispatch, type SetStateAction } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { CharacterChat } from '../components/CharacterChat'
import { CharacterIllustration } from '../features/components/CharacterIllustration'
import { hasChatHistoryForEgg } from '../lib/localRepository'
import { resolveGrowthSession } from '../lib/viewHelpers'
import type { AppData, Character, Egg, User } from '../types/models'

type CharacterDetailPageProps = {
  characters: Character[]
  eggs: Egg[]
  userId?: string
  user: User
  onDataChange?: Dispatch<SetStateAction<AppData>>
  onLogout: () => Promise<void> | void
}

const FALLBACK_USER_ID = 'local-user-m-takahashi'

export function CharacterDetailPage({
  characters,
  eggs,
  userId = FALLBACK_USER_ID,
  user,
  onDataChange,
  onLogout,
}: CharacterDetailPageProps) {
  const { characterId } = useParams()
  const growthSession = resolveGrowthSession(characters, eggs, characterId)

  if (!characterId && growthSession) {
    const targetId = growthSession.isPreHatch ? growthSession.egg.id : growthSession.character.id
    return <Navigate to={`/characters/${targetId}`} replace />
  }

  if (!growthSession) {
    return (
      <div className="relative flex w-full min-h-[100svh] flex-col overflow-hidden font-sans bg-[#FBF6EC]">
        <div className="shrink-0 h-36" />
        <div className="relative flex flex-1 max-h-[360px] items-end justify-center px-4 pb-6">
          <RoomBackdrop />
          <div className="relative z-10 flex flex-col items-center gap-2 pb-4 text-center">
            <p className="text-[13px] font-bold text-[#494949]">まだ育てる卵がありません</p>
            <p className="text-[11px] leading-relaxed text-[#5C5C5C]">
              交換で受け取った卵を、ここで育てていきましょう
            </p>
            <Link
              to="/characters/receive"
              className="mt-1 flex h-9 items-center rounded-full bg-[#FF9B37] px-4 text-[12px] font-bold text-[#FFFCF4]"
            >
              卵を受け取る
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const { character, egg, isPreHatch } = growthSession

  return (
    <CharacterDetailBody
      key={`${egg.id}-${userId}`}
      character={character}
      egg={egg}
      isPreHatch={isPreHatch}
      userId={userId}
      user={user}
      onDataChange={onDataChange}
      onLogout={onLogout}
    />
  )
}

function CharacterDetailBody({
  character,
  egg,
  isPreHatch,
  userId,
  user,
  onDataChange,
  onLogout,
}: {
  character: Character
  egg: Egg
  isPreHatch: boolean
  userId: string
  user: User
  onDataChange?: Dispatch<SetStateAction<AppData>>
  onLogout: () => Promise<void> | void
}) {
  const [talkStarted, setTalkStarted] = useState(
    () => !isPreHatch || hasChatHistoryForEgg(egg.id, userId),
  )

  if (isPreHatch && !talkStarted) {
    return <EggNurtureIntro egg={egg} onStart={() => setTalkStarted(true)} />
  }

  return (
    <CharacterChat
      character={character}
      egg={egg}
      isPreHatch={isPreHatch}
      userId={userId}
      user={user}
      onDataChange={onDataChange}
      onLogout={onLogout}
    />
  )
}

function EggNurtureIntro({ egg, onStart }: { egg: Egg; onStart: () => void }) {
  return (
    <div className="relative flex w-full min-h-[100svh] flex-col overflow-hidden font-sans bg-[#FBF6EC]">
      <div className="shrink-0 h-36" />
      <div className="relative flex flex-1 flex-col items-center justify-end px-4 pb-8">
        <RoomBackdrop />
        <div className="relative z-10 flex w-full max-w-[320px] flex-col items-center gap-3 text-center">
          <p className="text-[13px] font-bold text-[#494949]">新しい卵が届きました</p>
          <div className="flex h-[230px] w-[230px] items-end justify-center rounded-full bg-[radial-gradient(circle_at_50%_40%,_#FFFCF4_0%,_#FBE3D6_70%,_#F6C9B7_100%)] shadow-[inset_0_-8px_24px_rgba(232,106,78,0.10),inset_0_12px_28px_rgba(255,255,255,0.55),0_14px_30px_rgba(80,50,30,0.10)]">
            <CharacterIllustration egg={egg} size="large" showAsEgg alt="" />
          </div>
          <p className="text-[15px] font-bold text-[#494949]">{egg.name}の卵</p>
          <p className="text-[11px] leading-relaxed text-[#5C5C5C]">
            交換で受け取ったばかりです。
            <br />
            話しかけて、少しずつ育てていきましょう。
          </p>
          <div className="mt-1 w-full max-w-[220px]">
            <div className="mb-1 flex items-center justify-between text-[10px] font-bold text-[#8A8A8A]">
              <span>孵化まで</span>
              <span className="text-[#E77300]">{egg.hatchLevel}%</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#F2E9D6]">
              <div
                className="h-full rounded-full bg-[linear-gradient(90deg,_#F3B85F_0%,_#FF9B37_100%)]"
                style={{ width: `${Math.max(8, egg.hatchLevel)}%` }}
              />
            </div>
          </div>
          <button
            type="button"
            onClick={onStart}
            className="mt-2 flex h-10 items-center rounded-full bg-[#FF9B37] px-5 text-[13px] font-bold text-[#FFFCF4]"
          >
            話しかける
          </button>
        </div>
      </div>
    </div>
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
