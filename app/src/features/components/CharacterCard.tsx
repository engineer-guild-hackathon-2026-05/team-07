import type { Character, Egg } from '../../types/models'
import { Mascot } from './Mascot'

type CharacterCardProps = {
  character: Character
  egg?: Egg
  onClick?: () => void
  featured?: boolean
}

const BASE = 'grid gap-3.5 items-center border border-[rgba(255,155,55,0.12)] rounded-3xl p-4 bg-[#fff8f0] cursor-pointer'
const NORMAL = 'grid-cols-[90px_1fr]'
const FEATURED = 'grid-cols-1 justify-items-center text-center'

export function CharacterCard({ character, egg, featured = false, onClick }: CharacterCardProps) {
  return (
    <article className={`${BASE} ${featured ? FEATURED : NORMAL}`} onClick={onClick}>
      <Mascot egg={egg} size={featured ? 'large' : 'small'} />
      <div>
        <div className="flex justify-between items-center gap-3">
          <strong className="text-text-heading">{character.name}</strong>
          <span className="text-primary-strong text-xs font-extrabold">Lv.{character.growthLevel}</span>
        </div>
        <p className="my-1.5 mb-2.5 text-text text-sm">{character.personality}</p>
        <div className="flex flex-wrap gap-2">
          {character.knowledgeAreas.slice(0, 3).map((area) => (
            <span
              className="rounded-full px-[11px] py-[7px] bg-[#eafffb] text-[#1598a5] text-sm font-extrabold"
              key={area}
            >
              #{area}
            </span>
          ))}
        </div>
      </div>
    </article>
  )
}
