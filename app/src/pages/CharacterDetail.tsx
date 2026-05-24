import { Navigate, useParams } from 'react-router-dom'
import { CharacterCard } from '../features/components/CharacterCard'
import { HeaderBar } from '../features/components/HeaderBar'
import { Mascot } from '../features/components/Mascot'
import { Card, EmptyState } from '../features/components/ui'
import { getEggForCharacter } from '../lib/viewHelpers'
import type { Character, Egg } from '../types/models'

type CharacterDetailPageProps = {
  characters: Character[]
  eggs: Egg[]
}

function Meter({ label, value }: { label: string; value: number }) {
  const normalizedValue = Math.max(0, Math.min(100, value))

  return (
    <div className="meter-row">
      <div>
        <span>{label}</span>
        <strong>{normalizedValue}%</strong>
      </div>
      <div className="meter-track">
        <span style={{ width: `${normalizedValue}%` }} />
      </div>
    </div>
  )
}

export function CharacterDetailPage({ characters, eggs }: CharacterDetailPageProps) {
  const { characterId } = useParams()
  const fallbackCharacter = characters[0]

  if (!characterId && fallbackCharacter) {
    return <Navigate to={`/characters/${fallbackCharacter.id}`} replace />
  }

  const character = characters.find((item) => item.id === characterId) ?? fallbackCharacter
  const egg = character ? getEggForCharacter(eggs, character) : eggs[0]

  if (!character) {
    return (
      <div className="screen">
        <EmptyState title="育成中キャラがいません" description="偏愛登録から生まれたキャラをここで育てます。" />
      </div>
    )
  }

  return (
    <div className="screen">
      <HeaderBar title={character.name} subtitle="育成キャラ詳細" />

      <Card className="center-panel grow-hero">
        <Mascot egg={egg} />
        <h1>{character.name}</h1>
        <p>{character.personality}</p>
      </Card>

      <Card>
        <h2>育成メーター</h2>
        <Meter label="成長度" value={character.growthLevel * 20} />
        <Meter label="愛情" value={character.affinityScore} />
        <Meter label="知識" value={character.knowledgeAreas.length * 22} />
      </Card>

      <Card>
        <h2>解放済みトピック</h2>
        <div className="tag-list">
          {character.unlockedTopics.map((topic) => (
            <span className="tag-chip tag-chip--static" key={topic}>
              {topic}
            </span>
          ))}
        </div>
      </Card>

      <Card className="chat-preview">
        <h2>チャットUIの骨組み</h2>
        <div className="bubble bubble--character">その専門用語、もっと聞きたい…！</div>
        <div className="bubble bubble--user">この偏愛は細部の違いが大事なんだ。</div>
      </Card>

      <Card>
        <h2>ほかの育成中キャラ</h2>
        <div className="character-list">
          {characters.map((item) => (
            <CharacterCard key={item.id} character={item} egg={getEggForCharacter(eggs, item)} />
          ))}
        </div>
      </Card>
    </div>
  )
}
