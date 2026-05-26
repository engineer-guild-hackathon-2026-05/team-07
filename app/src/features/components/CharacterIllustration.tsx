import type { Egg } from '../../types/models'
import { heroPedestal, eggImage, resolveCharacterImage, resolveCharacterLabel } from '../../lib/characterAssets'

type CharacterIllustrationProps = {
  alt?: string
  className?: string
  egg?: Pick<Egg, 'motif' | 'color' | 'id' | 'name'>
  showAsEgg?: boolean
  showPedestal?: boolean
  size?: 'small' | 'medium' | 'large' | 'featured'
}

const sizeClass: Record<NonNullable<CharacterIllustrationProps['size']>, string> = {
  small: 'w-28 h-[124px]',
  medium: 'w-[148px] h-[168px]',
  large: 'w-[190px] h-[210px]',
  featured: 'w-[220px] h-[240px]',
}

export function CharacterIllustration({
  alt,
  className = '',
  egg,
  showAsEgg = false,
  showPedestal = false,
  size = 'large',
}: CharacterIllustrationProps) {
  const image = showAsEgg ? eggImage : resolveCharacterImage(egg)
  const label = alt ?? (showAsEgg ? `${resolveCharacterLabel(egg)}の卵` : resolveCharacterLabel(egg))

  return (
    <div
      className={`relative grid place-items-end justify-items-center flex-shrink-0 ${sizeClass[size]} ${className}`.trim()}
      aria-hidden={alt === ''}
    >
      {showPedestal ? (
        <img
          src={heroPedestal}
          alt=""
          className="absolute bottom-0 z-0 w-[72%] object-contain opacity-90"
        />
      ) : null}
      <img
        src={image}
        alt={label}
        className="relative z-[1] w-full h-full object-contain drop-shadow-[0_14px_24px_rgba(73,73,73,0.16)]"
      />
    </div>
  )
}
