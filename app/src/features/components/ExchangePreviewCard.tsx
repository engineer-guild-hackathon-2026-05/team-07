import { EggArt } from './EggArt'
import type { Character, Egg, Passion } from '../../types/models'

type ExchangePreviewCardProps = {
  character?: Character
  egg: Egg
  passion?: Passion
  senderName?: string
}

export function ExchangePreviewCard({ character, egg, passion, senderName }: ExchangePreviewCardProps) {
  const previewTags = passion?.tags.slice(0, 3) ?? []

  return (
    <article className="exchange-preview-card" aria-label={`${egg.name}の偏愛プレビュー`}>
      <div className="exchange-preview-card__visual">
        <EggArt egg={egg} />
      </div>

      <div className="exchange-preview-card__body">
        <p className="exchange-preview-card__eyebrow">渡す卵のお品書き</p>
        <h3>{egg.name}</h3>
        {passion ? (
          <>
            <p className="exchange-preview-card__passion-title">{passion.title}</p>
            <p className="exchange-preview-card__passion-note">
              偏愛の詳細は受け取ってから。タイトルとタグだけ先に見せます。
            </p>
          </>
        ) : (
          <p className="exchange-preview-card__passion-note">この卵に紐づく偏愛データがありません。</p>
        )}

        {character ? <p className="exchange-preview-card__personality">{character.personality}</p> : null}

        {previewTags.length > 0 ? (
          <div className="tag-list">
            {previewTags.map((tag) => (
              <span className="tag-chip tag-chip--static" key={tag}>
                #{tag}
              </span>
            ))}
          </div>
        ) : null}

        {senderName ? <p className="exchange-preview-card__from">from {senderName}</p> : null}
      </div>
    </article>
  )
}
