import type { Egg } from '../../types/models'
import { eggImage } from '../../lib/characterAssets'

export function EggArt({ egg, label }: { egg?: Pick<Egg, 'color' | 'name'>; label?: string }) {
  const displayLabel = label ?? egg?.name

  return (
    <div className="egg-art">
      <img src={eggImage} alt={displayLabel ?? 'たまご'} className="egg-art__image" />
      {displayLabel ? <strong className="egg-art__label">{displayLabel}</strong> : null}
    </div>
  )
}
