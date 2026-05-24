import { useMemo, useState } from 'react'
import { CharacterCard } from '../features/components/CharacterCard'
import { HeaderBar } from '../features/components/HeaderBar'
import { Button, Card, EmptyState } from '../features/components/ui'
import { formatFullDate, formatShortDate, getEggForCharacter } from '../lib/viewHelpers'
import type { Character, Egg, Exchange, Passion, User } from '../types/models'

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
    <div className="screen">
      <HeaderBar title="プロフィール" subtitle="ux-05" />

      <Card className="profile-card">
        {user.iconUrl ? (
          <img className="avatar avatar-image" src={user.iconUrl} alt={`${user.name}のアイコン`} />
        ) : (
          <div className="avatar">{user.name.slice(0, 1).toUpperCase()}</div>
        )}
        <h1>{user.name}</h1>
        <p>登録日 {formatFullDate(user.createdAt)}</p>
        <div className="profile-stats" aria-label="プロフィール統計">
          <span>
            <strong>{passions.length}</strong>
            偏愛
          </span>
          <span>
            <strong>{eggs.length}</strong>
            卵
          </span>
          <span>
            <strong>{characters.length}</strong>
            キャラ
          </span>
        </div>
      </Card>

      <Card>
        <h2>好きタグ</h2>
        {user.favoriteTags.length > 0 ? (
          <div className="tag-list">
            {user.favoriteTags.map((tag) => (
              <span className="tag-chip tag-chip--static" key={tag}>
                #{tag}
              </span>
            ))}
          </div>
        ) : (
          <EmptyState title="好きタグ未設定" description="偏愛登録やプロフィール編集で増やせます。" />
        )}
      </Card>

      <section className="profile-tabs" aria-label="プロフィール詳細">
        {(['passions', 'exchanges', 'characters'] as const).map((tab) => (
          <button
            type="button"
            key={tab}
            className={activeTab === tab ? 'is-active' : ''}
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'passions' ? '偏愛' : tab === 'exchanges' ? '交換' : '育成'}
            <span>{tabCount[tab]}</span>
          </button>
        ))}
      </section>

      {activeTab === 'passions' ? (
        <Card>
          <div className="section-title-row">
            <h2>偏愛一覧</h2>
            <span>{passions.length}件</span>
          </div>
          {passions.length > 0 ? (
            <div className="passion-stack">
              {passions.map((passion) => (
                <article className="passion-row" key={passion.id}>
                  <div>
                    <strong>{passion.title}</strong>
                    <p>{passion.tags.map((tag) => `#${tag}`).join(' ') || '#タグなし'}</p>
                  </div>
                  <span>{passion.visibility}</span>
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
          <div className="section-title-row">
            <h2>交換履歴</h2>
            <span>{exchanges.length}件</span>
          </div>
          {exchanges.length > 0 ? (
            <div className="passion-stack">
              {exchanges.map((exchange) => (
                <article className="passion-row" key={exchange.id}>
                  <div>
                    <strong>{exchange.meetingContext}</strong>
                    <p>{exchange.fromUid} から受け取り</p>
                  </div>
                  <span>{formatShortDate(exchange.createdAt)}</span>
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
          <div className="section-title-row">
            <h2>育成キャラ一覧</h2>
            <span>{characters.length}体</span>
          </div>
          {characters.length > 0 ? (
            <div className="character-list">
              {characters.map((character) => (
                <CharacterCard key={character.id} character={character} egg={getEggForCharacter(eggs, character)} />
              ))}
            </div>
          ) : (
            <EmptyState title="育成キャラなし" description="偏愛を登録して、最初のキャラを生みましょう。" />
          )}
        </Card>
      ) : null}

      <Card className="logout-panel">
        <Button type="button" variant="ghost" onClick={onLogout}>
          ログアウト
        </Button>
        <p>Firebase Authからログアウトします。デモログインの場合はローカル状態だけ解除します。</p>
      </Card>
    </div>
  )
}
