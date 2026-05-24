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
    <article className={`character-card-ds ${featured ? 'character-card-ds--featured' : ''}`} onClick={onClick}>
      <Mascot egg={egg} size={featured ? 'large' : 'small'} />
      <div>
        <div className="section-title-row">
          <strong>{character.name}</strong>
          <span>Lv.{character.growthLevel}</span>
        </div>
        <p>{character.personality}</p>
        <div className="tag-list">
          {character.knowledgeAreas.slice(0, 3).map((area) => (
            <span className="tag-chip tag-chip--static" key={area}>
              #{area}
            </span>
          ))}
        </div>
      </div>
    </article>
  )
}
