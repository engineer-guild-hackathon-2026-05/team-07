import charBlue from '../assets/char_blue.png'
import charPink from '../assets/char_pink.png'
import charPurple from '../assets/char_purple.png'
import charThree from '../assets/char_three.png'
import charactersBg from '../assets/charcters_bg.png'
import eggImage from '../assets/egg.png'
import heroPedestal from '../assets/hero.png'
import type { Egg } from '../types/models'

export { charBlue, charPink, charPurple, charThree, charactersBg, eggImage, heroPedestal }

export type CharacterAssetKey = 'blue' | 'pink' | 'purple'

export const CHARACTER_SPRITES: Record<CharacterAssetKey, string> = {
  blue: charBlue,
  pink: charPink,
  purple: charPurple,
}

const MOTIF_ASSET: Record<Egg['motif'], CharacterAssetKey | 'egg'> = {
  fox: 'pink',
  cat: 'blue',
  bird: 'purple',
  egg: 'egg',
}

const normalizeColor = (color: string) => color.trim().toLowerCase()

const COLOR_ASSET: Record<string, CharacterAssetKey> = {
  '#4edbfb': 'blue',
  '#ffb6d9': 'pink',
  '#d9c8ff': 'purple',
  '#ff9b37': 'pink',
  '#e77300': 'pink',
  '#ffe1a8': 'pink',
}

export type CharacterVisualInput = Pick<Egg, 'motif' | 'color' | 'id' | 'name'>

export const resolveCharacterAssetKey = (egg?: CharacterVisualInput): CharacterAssetKey => {
  if (!egg) {
    return 'pink'
  }

  const colorMatch = COLOR_ASSET[normalizeColor(egg.color)]
  if (colorMatch) {
    return colorMatch
  }

  const motifMatch = MOTIF_ASSET[egg.motif]
  if (motifMatch && motifMatch !== 'egg') {
    return motifMatch
  }

  const seed = Array.from(egg.id).reduce((sum, char) => sum + char.charCodeAt(0), 0)
  const keys: CharacterAssetKey[] = ['pink', 'blue', 'purple']
  return keys[seed % keys.length]
}

export const resolveCharacterImage = (egg?: CharacterVisualInput) => {
  if (!egg) {
    return CHARACTER_SPRITES.pink
  }

  return CHARACTER_SPRITES[resolveCharacterAssetKey(egg)]
}

export const resolveCharacterLabel = (egg?: CharacterVisualInput, fallback = 'ふわもこ') =>
  egg?.name ?? fallback
