import { Link, Navigate, useParams } from 'react-router-dom'
import { CharacterChat } from '../components/CharacterChat'
import { getEggForCharacter } from '../lib/viewHelpers'
import type { Character, Egg, User } from '../types/models'

type CharacterDetailPageProps = {
  characters: Character[]
  eggs: Egg[]
  userId?: string
  user: User
  onLogout: () => Promise<void> | void
}

const FALLBACK_USER_ID = 'local-user-m-takahashi'

export function CharacterDetailPage({ characters, eggs, userId = FALLBACK_USER_ID, user, onLogout }: CharacterDetailPageProps) {
  const { characterId } = useParams()
  const fallbackCharacter = characters[0]

  if (!characterId && fallbackCharacter) {
    return <Navigate to={`/characters/${fallbackCharacter.id}`} replace />
  }

  const character = characters.find((item) => item.id === characterId)
  const egg = character ? getEggForCharacter(eggs, character) : undefined

  if (!character || !egg) {
    return (
      <div className="relative flex w-full min-h-[100svh] flex-col overflow-hidden font-sans bg-[#FBF6EC]">
        <div className="shrink-0 h-36" />
        <div className="relative flex flex-1 max-h-[360px] items-end justify-center px-4 pb-6">
          <RoomBackdrop />
          <div className="relative z-10 flex flex-col items-center gap-2 pb-4 text-center">
            <p className="text-[13px] font-bold text-[#494949]">まだキャラがいません</p>
            <p className="text-[11px] leading-relaxed text-[#5C5C5C]">
              偏愛を登録すると卵からキャラが生まれます
            </p>
            <Link
              to="/passions/new"
              className="mt-1 flex h-9 items-center rounded-full bg-[#FF9B37] px-4 text-[12px] font-bold text-[#FFFCF4]"
            >
              偏愛を登録する
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    // key forces a full re-mount when character or user changes, resetting chat state
    <CharacterChat key={`${character.id}-${userId}`} character={character} egg={egg} userId={userId} user={user} onLogout={onLogout} />
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
