import type { Egg } from '../../types/models'
import { EggArt } from './EggArt'

type EggCardProps = {
  egg: Egg
  onClick?: () => void
}

export function EggCard({ egg, onClick }: EggCardProps) {
  return (
    <article className="egg-card-ds" onClick={onClick}>
      <EggArt egg={egg} />
      <div>
        <div className="section-title-row">
          <strong>{egg.name}</strong>
          <span>{egg.hatchLevel}%</span>
        </div>
        <p>交換できる偏愛の卵</p>
        <div className="meter-track" aria-label={`孵化レベル ${egg.hatchLevel}%`}>
          <span style={{ width: `${egg.hatchLevel}%` }} />
        </div>
      </div>
    </article>
  )
}
