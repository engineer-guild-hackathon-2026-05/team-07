import type { Egg } from '../../types/models'
import { EggArt } from './EggArt'

type EggCardProps = {
  egg: Egg
  onClick?: () => void
}

export function EggCard({ egg, onClick }: EggCardProps) {
  return (
    <article
      className="grid grid-cols-[84px_1fr] gap-3.5 items-center border border-orange/12 rounded-3xl p-4 bg-cream cursor-pointer [&_.egg-art]:w-[66px] [&_.egg-art]:h-[82px]"
      onClick={onClick}
    >
      <EggArt egg={egg} />
      <div>
        <div className="flex justify-between items-center gap-3">
          <strong className="text-text-h">{egg.name}</strong>
          <span className="text-orange-dark text-xs font-extrabold">{egg.hatchLevel}%</span>
        </div>
        <p className="my-1.5 mb-2.5 text-text text-[13px]">交換できる偏愛の卵</p>
        <div className="h-3 overflow-hidden rounded-full bg-border" aria-label={`孵化レベル ${egg.hatchLevel}%`}>
          <span
            className="block h-full rounded-full bg-gradient-to-r from-orange to-mint"
            style={{ width: `${egg.hatchLevel}%` }}
          />
        </div>
      </div>
    </article>
  )
}
