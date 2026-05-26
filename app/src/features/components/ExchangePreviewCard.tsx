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
  const promptSummary = egg.characterPrompt.trim()

  return (
    <article
      className="grid grid-cols-[112px_1fr] gap-4 items-center mb-4 border border-[rgba(255,155,55,0.18)] rounded-3xl p-[18px] bg-gradient-to-br from-[#fffaf4] to-[#fff8f0] shadow-soft md:grid-cols-[140px_1fr] md:p-[22px]"
      aria-label={`${egg.name}の偏愛プレビュー`}
    >
      <div className="grid place-items-center">
        <EggArt egg={egg} />
      </div>

      <div className="grid gap-2">
        <p className="m-0 text-primary-strong text-[11px] font-black tracking-widest uppercase">渡す卵のお品書き</p>
        <h3 className="m-0 text-text-heading text-2xl">{egg.name}</h3>
        {passion ? (
          <>
            <p className="text-text-heading font-black">{passion.title}</p>
            <p className="text-text text-sm leading-snug">
              偏愛の詳細は受け取ってから。タイトルとタグだけ先に見せます。
            </p>
          </>
        ) : promptSummary ? (
          <>
            <p className="text-text-heading font-black">偏愛メモ</p>
            <p className="text-text text-sm leading-snug line-clamp-3">{promptSummary}</p>
          </>
        ) : (
          <p className="text-text text-sm leading-snug">この卵に紐づく偏愛データがありません。</p>
        )}

        {character ? (
          <p className="text-text text-sm leading-snug px-3 py-2.5 rounded-[14px] bg-[rgba(255,255,255,0.72)]">
            {character.personality}
          </p>
        ) : null}

        {previewTags.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {previewTags.map((tag) => (
              <span
                className="rounded-full px-[11px] py-[7px] bg-[#eafffb] text-[#1598a5] text-sm font-extrabold"
                key={tag}
              >
                #{tag}
              </span>
            ))}
          </div>
        ) : null}

        {senderName ? <p className="text-[#8d8d8d] text-xs font-extrabold">from {senderName}</p> : null}
      </div>
    </article>
  )
}
