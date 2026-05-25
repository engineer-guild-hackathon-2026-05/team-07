import type { Egg } from '../../types/models'
import { eggImage } from '../../lib/characterAssets'

const EGG =
  'relative grid place-items-center w-[74px] h-[92px] overflow-hidden rounded-[52%_52%_46%_46%/62%_62%_38%_38%] bg-[radial-gradient(circle_at_35%_28%,rgba(255,255,255,0.45),transparent_24%),#fff8f0] text-white text-[11px] text-center'

export function EggArt({ egg, label }: { egg?: Pick<Egg, 'color' | 'name'>; label?: string }) {
  const displayLabel = label ?? egg?.name

  return (
    <div className={EGG}>
      <img
        src={eggImage}
        alt={displayLabel ?? 'たまご'}
        className="w-[88%] h-[88%] object-contain drop-shadow-[0_8px_12px_rgba(73,73,73,0.14)]"
      />
      {displayLabel ? (
        <strong className="absolute bottom-1.5 z-[1] max-w-[calc(100%-8px)] overflow-hidden text-ellipsis whitespace-nowrap px-1.5 py-0.5 rounded-full text-text-heading bg-[rgba(255,255,255,0.88)] text-[9px] font-black">
          {displayLabel}
        </strong>
      ) : null}
    </div>
  )
}
