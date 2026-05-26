import { useMemo, useState } from 'react'
import { Button, Card, EmptyState } from '../components/ui'
import { CharacterCard } from '../features/components/CharacterCard'
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

const TAB_LABELS: Record<ProfileTab, string> = {
  passions: '偏愛',
  exchanges: '交換',
  characters: '育成',
}

const CARD =
  'rounded-3xl border border-[rgba(255,155,55,0.14)] bg-white shadow-[0_10px_28px_rgba(73,73,73,0.06)]'

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
    <div className="screen grid gap-4 md:gap-5">
      <header className="pt-1">
        <h1 className="m-0 text-text-heading text-3xl font-black">プロフィール</h1>
      </header>

      <Card
        className={`${CARD} grid justify-items-center gap-3 bg-gradient-to-br from-[#fffaf4] to-[#fff8f0] text-center`}
      >
        {user.iconUrl ? (
          <img
            className="grid h-[84px] w-[84px] place-items-center rounded-full object-cover shadow-[0_8px_20px_rgba(231,115,0,0.18)]"
            src={user.iconUrl}
            alt={`${user.name}のアイコン`}
          />
        ) : (
          <div className="grid h-[84px] w-[84px] place-items-center rounded-full bg-gradient-to-br from-primary to-primary-strong text-[34px] font-black text-white shadow-[0_8px_20px_rgba(231,115,0,0.18)]">
            {user.name.slice(0, 1).toUpperCase()}
          </div>
        )}
        <div className="grid gap-1">
          <h2 className="m-0 text-text-heading text-2xl font-black">{user.name}</h2>
          <p className="m-0 text-sm text-text">登録日 {formatFullDate(user.createdAt)}</p>
        </div>
        <div className="grid w-full grid-cols-3 gap-2" aria-label="プロフィール統計">
          {[
            { label: '偏愛', value: passions.length },
            { label: '卵', value: eggs.length },
            { label: 'キャラ', value: characters.length },
          ].map((stat) => (
            <div
              key={stat.label}
              className="grid gap-1 rounded-2xl bg-white/80 px-2 py-3 text-primary-strong"
            >
              <strong className="text-2xl font-black text-text-heading">{stat.value}</strong>
              <span className="text-xs font-extrabold">{stat.label}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card className={`${CARD} grid gap-3`}>
        <h2 className="m-0 text-text-heading text-lg font-black">好きタグ</h2>
        {user.favoriteTags.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {user.favoriteTags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-[#eafffb] px-[11px] py-[7px] text-sm font-extrabold text-[#1598a5]"
              >
                #{tag}
              </span>
            ))}
          </div>
        ) : (
          <EmptyState title="好きタグ未設定" description="偏愛登録やプロフィール編集で増やせます。" />
        )}
      </Card>

      <section className="grid grid-cols-3 gap-1.5 rounded-[18px] bg-[#fff1df] p-1.5" aria-label="プロフィール詳細">
        {(['passions', 'exchanges', 'characters'] as const).map((tab) => {
          const isActive = activeTab === tab

          return (
            <button
              type="button"
              key={tab}
              className={`grid min-h-[48px] place-items-center gap-0.5 rounded-[14px] text-sm font-black transition-all ${
                isActive
                  ? 'bg-white text-primary-strong shadow-[0_4px_14px_rgba(231,115,0,0.14)]'
                  : 'bg-transparent text-primary-strong/55 hover:text-primary-strong/80'
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {TAB_LABELS[tab]}
              <span className="text-[11px] font-extrabold">{tabCount[tab]}</span>
            </button>
          )
        })}
      </section>

      {activeTab === 'passions' ? (
        <Card className={`${CARD} grid gap-4`}>
          <div className="flex items-center justify-between gap-3">
            <h2 className="m-0 text-text-heading text-lg font-black">偏愛一覧</h2>
            <span className="text-xs font-extrabold text-primary-strong">{passions.length}件</span>
          </div>
          {passions.length > 0 ? (
            <div className="grid gap-3">
              {passions.map((passion) => (
                <article
                  key={passion.id}
                  className="grid grid-cols-[1fr_auto] items-start gap-3 rounded-2xl border border-[rgba(255,155,55,0.1)] bg-[#fff8f0] px-4 py-3"
                >
                  <div>
                    <strong className="block text-text-heading">{passion.title}</strong>
                    <p className="mt-1 text-sm text-text">
                      {passion.tags.map((tag) => `#${tag}`).join(' ') || '#タグなし'}
                    </p>
                  </div>
                  <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-extrabold text-primary-strong">
                    {passion.visibility}
                  </span>
                </article>
              ))}
            </div>
          ) : (
            <EmptyState title="偏愛が未登録です" description="ホームのCTAから最初の偏愛を登録できます。" />
          )}
        </Card>
      ) : null}

      {activeTab === 'exchanges' ? (
        <Card className={`${CARD} grid gap-4`}>
          <div className="flex items-center justify-between gap-3">
            <h2 className="m-0 text-text-heading text-lg font-black">交換履歴</h2>
            <span className="text-xs font-extrabold text-primary-strong">{exchanges.length}件</span>
          </div>
          {exchanges.length > 0 ? (
            <div className="grid gap-3">
              {exchanges.map((exchange) => (
                <article
                  key={exchange.id}
                  className="grid grid-cols-[1fr_auto] items-start gap-3 rounded-2xl border border-[rgba(255,155,55,0.1)] bg-[#fff8f0] px-4 py-3"
                >
                  <div>
                    <strong className="block text-text-heading">{exchange.meetingContext}</strong>
                    <p className="mt-1 text-sm text-text">{exchange.fromUid} から受け取り</p>
                  </div>
                  <span className="text-xs font-extrabold text-primary-strong">
                    {formatShortDate(exchange.createdAt)}
                  </span>
                </article>
              ))}
            </div>
          ) : (
            <EmptyState title="交換履歴なし" description="QR交換をすると、会った文脈と卵がここに残ります。" />
          )}
        </Card>
      ) : null}

      {activeTab === 'characters' ? (
        <Card className={`${CARD} grid gap-4`}>
          <div className="flex items-center justify-between gap-3">
            <h2 className="m-0 text-text-heading text-lg font-black">育成キャラ一覧</h2>
            <span className="text-xs font-extrabold text-primary-strong">{characters.length}体</span>
          </div>
          {characters.length > 0 ? (
            <div className="grid gap-3">
              {characters.map((character) => (
                <CharacterCard key={character.id} character={character} egg={getEggForCharacter(eggs, character)} />
              ))}
            </div>
          ) : (
            <EmptyState title="育成キャラなし" description="偏愛を登録して、最初のキャラを生みましょう。" />
          )}
        </Card>
      ) : null}

      <section className={`${CARD} grid gap-3 bg-[#fff8f0]`}>
        <div className="grid gap-1">
          <h2 className="m-0 text-text-heading text-base font-black">アカウント</h2>
          <p className="m-0 text-xs leading-relaxed text-text">
            ログアウトすると、この端末からログイン状態が解除されます。
          </p>
        </div>
        <Button
          type="button"
          variant="secondary"
          onClick={onLogout}
          className="w-full min-h-[52px] border border-[rgba(231,115,0,0.24)] text-primary-strong shadow-[0_4px_14px_rgba(231,115,0,0.08)]"
        >
          ログアウトする
        </Button>
      </section>
    </div>
  )
}
