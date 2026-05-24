import { useMemo, useState } from 'react'
import { CharacterCard } from '../features/components/CharacterCard'
import { HeaderBar } from '../features/components/HeaderBar'
import { Button, Card, EmptyState } from '../features/components/ui'
import { formatFullDate, formatShortDate, getEggForCharacter } from '../lib/viewHelpers'
import type { Character, Egg, Exchange, Passion, User } from '../types/models'

const screenClasses =
  'h-full overflow-y-auto box-border px-[22px] pt-7 pb-28 flex flex-col gap-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'

type ProfileTab = 'passions' | 'exchanges' | 'characters'

type ProfilePageProps = {
  characters: Character[]
  eggs: Egg[]
  exchanges: Exchange[]
  onLogout: () => void
  passions: Passion[]
  user: User
}

export function ProfilePage({ characters, eggs, exchanges, onLogout, passions, user }: ProfilePageProps) {
  const [activeTab, setActiveTab] = useState<ProfileTab>('passions')
  const tabCount = useMemo(
    () => ({
      passions: passions.length,
      exchanges: exchanges.length,
      characters: characters.length,
    }),
    [characters.length, exchanges.length, passions.length],
  )

  return (
    <div className={screenClasses}>
      <HeaderBar title="プロフィール" subtitle="ux-05" />

      <Card className="grid justify-items-center gap-2.5 text-center">
        {user.iconUrl ? (
          <img
            className="grid place-items-center w-[84px] h-[84px] rounded-full text-white bg-gradient-to-br from-orange to-orange-dark text-[34px] font-black object-cover"
            src={user.iconUrl}
            alt={`${user.name}のアイコン`}
          />
        ) : (
          <div className="grid place-items-center w-[84px] h-[84px] rounded-full text-white bg-gradient-to-br from-orange to-orange-dark text-[34px] font-black">
            {user.name.slice(0, 1).toUpperCase()}
          </div>
        )}
        <h1 className="text-[30px] leading-[1.18] text-text-h">{user.name}</h1>
        <p className="text-text">登録日 {formatFullDate(user.createdAt)}</p>
        <div className="grid grid-cols-3 gap-2 w-full mt-2" aria-label="プロフィール統計">
          <span className="grid gap-0.5 rounded-md px-2 py-3 bg-cream text-orange-dark text-xs font-extrabold">
            <strong className="text-text-h text-[22px]">{passions.length}</strong>
            偏愛
          </span>
          <span className="grid gap-0.5 rounded-md px-2 py-3 bg-cream text-orange-dark text-xs font-extrabold">
            <strong className="text-text-h text-[22px]">{eggs.length}</strong>
            卵
          </span>
          <span className="grid gap-0.5 rounded-md px-2 py-3 bg-cream text-orange-dark text-xs font-extrabold">
            <strong className="text-text-h text-[22px]">{characters.length}</strong>
            キャラ
          </span>
        </div>
      </Card>

      <Card>
        <h2 className="text-text-h mb-3">好きタグ</h2>
        {user.favoriteTags.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {user.favoriteTags.map((tag) => (
              <span
                className="rounded-full px-[11px] py-[7px] bg-tag-bg text-tag-text text-[13px] font-extrabold"
                key={tag}
              >
                #{tag}
              </span>
            ))}
          </div>
        ) : (
          <EmptyState title="好きタグ未設定" description="偏愛登録やプロフィール編集で増やせます。" />
        )}
      </Card>

      <section className="grid grid-cols-3 gap-2 rounded-md p-1.5 bg-cream-tab my-4" aria-label="プロフィール詳細">
        {(['passions', 'exchanges', 'characters'] as const).map((tab) => (
          <button
            type="button"
            key={tab}
            className={`grid place-items-center min-h-[42px] rounded-sm text-orange-dark font-black border-none cursor-pointer font-[inherit] ${
              activeTab === tab ? 'bg-white shadow-[0_6px_14px_rgba(231,115,0,0.16)]' : 'bg-transparent'
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'passions' ? '偏愛' : tab === 'exchanges' ? '交換' : '育成'}
            <span className="text-[11px]">{tabCount[tab]}</span>
          </button>
        ))}
      </section>

      {activeTab === 'passions' ? (
        <Card>
          <div className="flex justify-between items-center gap-3 mb-3">
            <h2 className="text-text-h">偏愛一覧</h2>
            <span className="text-orange-dark text-xs font-extrabold">{passions.length}件</span>
          </div>
          {passions.length > 0 ? (
            <div className="grid gap-3">
              {passions.map((passion) => (
                <article className="grid grid-cols-[1fr_auto] gap-3 items-start p-3.5 rounded-md bg-cream" key={passion.id}>
                  <div>
                    <strong className="block mb-1 text-text-h">{passion.title}</strong>
                    <p className="text-text">{passion.tags.map((tag) => `#${tag}`).join(' ') || '#タグなし'}</p>
                  </div>
                  <span className="text-orange-dark text-xs font-extrabold">{passion.visibility}</span>
                </article>
              ))}
            </div>
          ) : (
            <EmptyState title="偏愛が未登録です" description="ホームのCTAから最初の偏愛を登録できます。" />
          )}
        </Card>
      ) : null}

      {activeTab === 'exchanges' ? (
        <Card>
          <div className="flex justify-between items-center gap-3 mb-3">
            <h2 className="text-text-h">交換履歴</h2>
            <span className="text-orange-dark text-xs font-extrabold">{exchanges.length}件</span>
          </div>
          {exchanges.length > 0 ? (
            <div className="grid gap-3">
              {exchanges.map((exchange) => (
                <article className="grid grid-cols-[1fr_auto] gap-3 items-start p-3.5 rounded-md bg-cream" key={exchange.id}>
                  <div>
                    <strong className="block mb-1 text-text-h">{exchange.meetingContext}</strong>
                    <p className="text-text">{exchange.fromUid} から受け取り</p>
                  </div>
                  <span className="text-orange-dark text-xs font-extrabold">{formatShortDate(exchange.createdAt)}</span>
                </article>
              ))}
            </div>
          ) : (
            <EmptyState title="交換履歴なし" description="QR交換をすると、会った文脈と卵がここに残ります。" />
          )}
        </Card>
      ) : null}

      {activeTab === 'characters' ? (
        <Card>
          <div className="flex justify-between items-center gap-3 mb-3">
            <h2 className="text-text-h">育成キャラ一覧</h2>
            <span className="text-orange-dark text-xs font-extrabold">{characters.length}体</span>
          </div>
          {characters.length > 0 ? (
            <div className="grid gap-3.5">
              {characters.map((character) => (
                <CharacterCard key={character.id} character={character} egg={getEggForCharacter(eggs, character)} />
              ))}
            </div>
          ) : (
            <EmptyState title="育成キャラなし" description="偏愛を登録して、最初のキャラを生みましょう。" />
          )}
        </Card>
      ) : null}

      <Card className="grid justify-items-center gap-2 text-center">
        <Button type="button" variant="ghost" onClick={onLogout}>
          ログアウト
        </Button>
        <p className="text-text">Firebase Authからログアウトします。デモログインの場合はローカル状態だけ解除します。</p>
      </Card>
    </div>
  )
}
