import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { CharacterCard } from '../features/components/CharacterCard'
import { EggCard } from '../features/components/EggCard'
import { HeaderBar } from '../features/components/HeaderBar'
import { Card, EmptyState, Button } from '../features/components/ui'
import { formatShortDate, getEggForCharacter } from '../lib/viewHelpers'
import type { Character, Egg, Exchange, Passion, User } from '../types/models'

const screenClasses =
  'h-full overflow-y-auto box-border px-[22px] pt-7 pb-28 flex flex-col gap-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'

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
    <div className={screenClasses}>
      <HeaderBar
        title="偏愛の卵"
        subtitle={`${user.name}さんのホーム`}
        action={
          <button
            type="button"
            className="pt-2.5 bg-transparent border-none text-[#b6b6b6] text-xs cursor-pointer font-[inherit]"
            onClick={onReset}
          >
            reset
          </button>
        }
      />

      {featuredCharacters.length > 0 ? (
        <section className="grid gap-3.5" aria-label="代表キャラクター">
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

      <section className="grid grid-cols-[1fr_0.8fr] gap-3 my-[18px]">
        <Button type="button" onClick={() => navigate('/passions/new')}>
          新しい偏愛を登録する
        </Button>
        <Button type="button" variant="secondary" onClick={() => navigate('/exchange/share')}>
          卵を交換する
        </Button>
      </section>

      <Card>
        <div className="flex justify-between items-center gap-3 mb-3">
          <h2 className="text-text-h">最近交換した卵</h2>
          <span className="text-orange-dark text-xs font-extrabold">{recentEggs.length}個</span>
        </div>
        {recentEggs.length > 0 ? (
          <div
            className="grid grid-flow-col auto-cols-[minmax(230px,84%)] gap-3 overflow-x-auto pb-1 snap-x snap-mandatory [&>*]:snap-start"
            aria-label="最近交換した卵"
          >
            {recentEggs.map((egg) => (
              <EggCard key={egg.id} egg={egg} />
            ))}
          </div>
        ) : (
          <EmptyState title="交換した卵はまだありません" description="QR交換をすると、ここに最近の卵が並びます。" />
        )}
      </Card>

      <Card>
        <div className="flex justify-between items-center gap-3 mb-3">
          <h2 className="text-text-h">育成中キャラ</h2>
          <span className="text-orange-dark text-xs font-extrabold">{characters.length}体</span>
        </div>
        {characters.length > 0 ? (
          <div className="grid gap-3.5">
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
        <div className="flex justify-between items-center gap-3 mb-3">
          <h2 className="text-text-h">最近の偏愛</h2>
          <span className="text-orange-dark text-xs font-extrabold">{passions.length}件</span>
        </div>
        <div className="grid gap-3">
          {passions.slice(0, 3).map((passion) => (
            <article className="grid grid-cols-[1fr_auto] gap-3 items-start p-3.5 rounded-md bg-cream" key={passion.id}>
              <div>
                <strong className="block mb-1 text-text-h">{passion.title}</strong>
                <p className="text-text">{passion.description}</p>
              </div>
              <span className="text-orange-dark text-xs font-extrabold">{formatShortDate(passion.createdAt)}</span>
            </article>
          ))}
        </div>
      </Card>
    </div>
  )
}
