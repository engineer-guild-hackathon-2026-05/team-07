import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, EmptyState, Button } from '../components/ui'
import { CharacterCard } from '../features/components/CharacterCard'
import { EggCard } from '../features/components/EggCard'
import { HeaderBar } from '../features/components/HeaderBar'
import { charactersBg } from '../lib/characterAssets'
import { formatShortDate, getEggForCharacter } from '../lib/viewHelpers'
import type { Character, Egg, Exchange, Passion, User } from '../types/models'

type HomePageProps = {
  characters: Character[]
  eggs: Egg[]
  exchanges: Exchange[]
  onReset: () => void
  passions: Passion[]
  user: User
}

export function HomePage({ characters, eggs, exchanges, onReset, passions, user }: HomePageProps) {
  const navigate = useNavigate()
  const featuredCharacters = characters.slice(0, 2)
  const recentEggs = useMemo(() => {
    const exchangeEggIds = new Set(exchanges.map((exchange) => exchange.eggId))
    const exchangedEggs = eggs.filter((egg) => exchangeEggIds.has(egg.id))
    return exchangedEggs.length > 0 ? exchangedEggs : eggs.slice(0, 3)
  }, [eggs, exchanges])

  return (
    <div className="screen home-screen">
      <div className="home-scene-banner" aria-hidden>
        <img src={charactersBg} alt="" className="home-scene-banner__image" />
        <div className="home-scene-banner__fade" />
      </div>

      <HeaderBar
        title="偏愛の卵"
        subtitle={`${user.name}さんのホーム`}
        action={
          <button type="button" className="text-reset" onClick={onReset}>
            reset
          </button>
        }
      />

      {featuredCharacters.length > 0 ? (
        <section className="home-hero-grid" aria-label="代表キャラクター">
          {featuredCharacters.map((character) => (
            <CharacterCard
              featured
              key={character.id}
              character={character}
              egg={getEggForCharacter(eggs, character)}
              onClick={() => navigate(`/characters/${character.id}`)}
            />
          ))}
        </section>
      ) : (
        <EmptyState
          title="まだキャラがいません"
          description="偏愛を登録すると、あなたの好きからキャラクターが生まれます。"
          actionLabel="新しい偏愛を登録する"
          onAction={() => navigate('/passions/new')}
        />
      )}

      <section className="quick-actions">
        <Button type="button" onClick={() => navigate('/passions/new')}>
          新しい偏愛を登録する
        </Button>
        <Button type="button" variant="secondary" onClick={() => navigate('/exchange/share')}>
          卵を交換する
        </Button>
      </section>

      <Card>
        <div className="section-title-row">
          <h2>最近交換した卵</h2>
          <span>{recentEggs.length}個</span>
        </div>
        {recentEggs.length > 0 ? (
          <div className="horizontal-scroll" aria-label="最近交換した卵">
            {recentEggs.map((egg) => (
              <EggCard key={egg.id} egg={egg} />
            ))}
          </div>
        ) : (
          <EmptyState title="交換した卵はまだありません" description="QR交換をすると、ここに最近の卵が並びます。" />
        )}
      </Card>

      <Card>
        <div className="section-title-row">
          <h2>育成中キャラ</h2>
          <span>{characters.length}体</span>
        </div>
        {characters.length > 0 ? (
          <div className="character-list">
            {characters.map((character) => (
              <CharacterCard
                key={character.id}
                character={character}
                egg={getEggForCharacter(eggs, character)}
                onClick={() => navigate(`/characters/${character.id}`)}
              />
            ))}
          </div>
        ) : (
          <EmptyState title="育成中キャラなし" description="まずは偏愛を登録して、卵からキャラを生みましょう。" />
        )}
      </Card>

      <Card>
        <div className="section-title-row">
          <h2>最近の偏愛</h2>
          <span>{passions.length}件</span>
        </div>
        <div className="passion-stack">
          {passions.slice(0, 3).map((passion) => (
            <article className="passion-row" key={passion.id}>
              <div>
                <strong>{passion.title}</strong>
                <p>{passion.description}</p>
              </div>
              <span>{formatShortDate(passion.createdAt)}</span>
            </article>
          ))}
        </div>
      </Card>
    </div>
  )
}
