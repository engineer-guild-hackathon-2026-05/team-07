import { Navigate, useParams } from 'react-router-dom'
import { CharacterChat } from '../components/CharacterChat'
import { EmptyState } from '../components/ui'
import { getEggForCharacter } from '../lib/viewHelpers'
import type { Character, Egg } from '../types/models'

type CharacterDetailPageProps = {
  characters: Character[]
  eggs: Egg[]
  userId?: string
}

const FALLBACK_USER_ID = 'local-user-m-takahashi'

export function CharacterDetailPage({ characters, eggs, userId = FALLBACK_USER_ID }: CharacterDetailPageProps) {
  const { characterId } = useParams()
  const fallbackCharacter = characters[0]

  if (!characterId && fallbackCharacter) {
    return <Navigate to={`/characters/${fallbackCharacter.id}`} replace />
  }

  const character = characters.find((item) => item.id === characterId)
  const egg = character ? getEggForCharacter(eggs, character) : undefined

  if (!character) {
    return (
      <div className="screen">
        <EmptyState title="育成中キャラがいません" description="偏愛登録から生まれたキャラをここで育てます。" />
      </div>
    )
  }

  if (!egg) {
    return (
      <div className="screen">
        <EmptyState title="卵が見つかりません" description="キャラクターに紐づく卵データを確認してください。" />
      </div>
    )
  }

  return (

    // key forces a full re-mount when character or user changes, resetting chat state
    <CharacterChat key={`${character.id}-${userId}`} character={character} egg={egg} userId={userId} />
  )
}
