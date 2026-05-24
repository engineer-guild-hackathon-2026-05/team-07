import type { CSSProperties } from 'react'
import type { Egg } from '../../types/models'

export function EggArt({ egg, label }: { egg?: Pick<Egg, 'color' | 'name'>; label?: string }) {
  return (
    <div className="egg-art" style={{ '--egg-color': egg?.color } as CSSProperties}>
      <span className="egg-art__shine" />
      <span className="egg-art__zigzag" />
      <strong>{label ?? egg?.name ?? 'たまご'}</strong>
    </div>
  )
}
