import type { Egg } from '../../types/models'
import { EggArt } from './EggArt'

type EggCardProps = {
  egg: Egg
  onClick?: () => void
}

export function EggCard({ egg, onClick }: EggCardProps) {
  return (
    <article
      className="grid grid-cols-[84px_1fr] gap-3.5 items-center border border-[rgba(255,155,55,0.12)] rounded-3xl p-4 bg-[#fff8f0] cursor-pointer"
      onClick={onClick}
    >
      <div className="w-[66px] h-[82px]">
        <EggArt egg={egg} />
      </div>
      <div>
        <div className="flex justify-between items-center gap-3">
          <strong className="text-text-heading">{egg.name}</strong>
          <span className="text-primary-strong text-xs font-extrabold">{egg.hatchLevel}%</span>
        </div>
        <p className="my-1.5 text-text text-sm">交換できる偏愛の卵</p>
        <div className="h-3 overflow-hidden rounded-full bg-[#f1e7dc]" aria-label={`孵化レベル ${egg.hatchLevel}%`}>
          <span
            className="block h-full rounded-[inherit] bg-gradient-to-r from-primary to-accent"
            style={{ width: `${egg.hatchLevel}%` }}
          />
        </div>
      </div>
    </article>
  )
}
