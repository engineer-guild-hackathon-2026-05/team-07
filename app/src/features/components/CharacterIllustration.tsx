import type { Egg } from '../../types/models'
import { heroPedestal, resolveCharacterImage, resolveCharacterLabel } from '../../lib/characterAssets'

type CharacterIllustrationProps = {
  alt?: string
  className?: string
  egg?: Pick<Egg, 'motif' | 'color' | 'id' | 'name'>
  showPedestal?: boolean
  size?: 'small' | 'medium' | 'large' | 'featured'
}

const sizeClass: Record<NonNullable<CharacterIllustrationProps['size']>, string> = {
  small: 'character-illustration--small',
  medium: 'character-illustration--medium',
  large: 'character-illustration--large',
  featured: 'character-illustration--featured',
}

export function CharacterIllustration({
  alt,
  className = '',
  egg,
  showPedestal = false,
  size = 'large',
}: CharacterIllustrationProps) {
  const image = resolveCharacterImage(egg)
  const label = alt ?? resolveCharacterLabel(egg)

  return (
    <div className={`character-illustration ${sizeClass[size]} ${className}`.trim()} aria-hidden={alt === ''}>
      {showPedestal ? (
        <img src={heroPedestal} alt="" className="character-illustration__pedestal" />
      ) : null}
      <img src={image} alt={label} className="character-illustration__sprite" />
    </div>
  )
}
