import type { Character, Egg } from '../../types/models'
import { Mascot } from './Mascot'

type CharacterCardProps = {
  character: Character
  egg?: Egg
  onClick?: () => void
  featured?: boolean
}

export function CharacterCard({ character, egg, featured = false, onClick }: CharacterCardProps) {
  return (
    <article
      className={`grid gap-3.5 border border-orange/12 rounded-3xl p-4 bg-cream cursor-pointer [&_.mascot]:m-0 ${
        featured ? 'grid-cols-1 justify-items-center text-center' : 'grid-cols-[90px_1fr] items-center'
      }`}
      onClick={onClick}
    >
      <Mascot egg={egg} size={featured ? 'large' : 'small'} />
      <div>
        <div className="flex justify-between items-center gap-3">
          <strong className="text-text-h">{character.name}</strong>
          <span className="text-orange-dark text-xs font-extrabold">Lv.{character.growthLevel}</span>
        </div>
        <p className="my-1.5 mb-2.5 text-text text-[13px]">{character.personality}</p>
        <div className="flex flex-wrap gap-2">
          {character.knowledgeAreas.slice(0, 3).map((area) => (
            <span
              className="rounded-full px-[11px] py-[7px] bg-tag-bg text-tag-text text-[13px] font-extrabold"
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
