import type { Egg } from '../../types/models'
import { CharacterIllustration } from './CharacterIllustration'

export function Mascot({ egg, size = 'large' }: { egg?: Pick<Egg, 'color' | 'motif' | 'id' | 'name'>; size?: 'large' | 'small' }) {
  return (
    <CharacterIllustration
      egg={egg}
      size={size === 'small' ? 'small' : 'large'}
      showPedestal={size === 'large'}
    />
  )
}
