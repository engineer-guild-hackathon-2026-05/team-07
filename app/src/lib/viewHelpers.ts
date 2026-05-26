import type { Character, Egg, Passion } from '../types/models'

export const formatShortDate = (value: string) =>
  new Intl.DateTimeFormat('ja-JP', {
    month: 'short',
    day: 'numeric',
  }).format(new Date(value))

export const formatFullDate = (value: string) =>
  new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(value))

export const getEggForCharacter = (eggs: Egg[], character: Character) =>
  eggs.find((egg) => egg.id === character.eggId)

export const getPassionForEgg = (passions: Passion[], egg: Egg) =>
  passions.find((passion) => egg.basedOnPassionIds.includes(passion.id))

export const getCharacterForEgg = (characters: Character[], egg: Egg) =>
  characters.find((character) => character.eggId === egg.id)

/** Firestore では characterId === eggId。キャラ doc が無い受け取り卵向けの表示用データ。 */
export const buildCharacterFromEgg = (egg: Egg): Character => ({
  id: egg.id,
  eggId: egg.id,
  name: egg.name,
  personality: egg.characterPrompt,
  knowledgeAreas: ['偏愛'],
  growthLevel: Math.max(1, Math.round(egg.hatchLevel / 28)),
  affinityScore: Math.min(95, egg.hatchLevel + 12),
  unlockedTopics: ['好きになったきっかけ', '一番語りたい細部'],
})

export const resolveCharacterForRoute = (characters: Character[], routeId: string) =>
  characters.find((character) => character.id === routeId || character.eggId === routeId)

export const resolveEggForRoute = (eggs: Egg[], routeId: string, character?: Character) => {
  if (character) {
    return getEggForCharacter(eggs, character)
  }
  return eggs.find((egg) => egg.id === routeId)
}

export type GrowthTarget = {
  egg: Egg
  character?: Character
}

export type GrowthSession = {
  egg: Egg
  character: Character
  /** Firestore / local にキャラ doc がまだ無い受け取り直後など */
  isPreHatch: boolean
}

export const resolveGrowthTarget = (
  characters: Character[],
  eggs: Egg[],
  routeId?: string,
): GrowthTarget | null => {
  if (routeId) {
    const character = resolveCharacterForRoute(characters, routeId)
    const egg = resolveEggForRoute(eggs, routeId, character)
    if (egg) {
      return character ? { character, egg } : { egg }
    }
    return null
  }

  const character = characters[0]
  if (character) {
    const egg = getEggForCharacter(eggs, character)
    if (egg) {
      return { character, egg }
    }
  }

  const egg = eggs[0]
  if (egg) {
    return { egg }
  }

  return null
}

export const resolveGrowthSession = (
  characters: Character[],
  eggs: Egg[],
  routeId?: string,
): GrowthSession | null => {
  const target = resolveGrowthTarget(characters, eggs, routeId)
  if (!target) {
    return null
  }

  const persistedCharacter = target.character
  return {
    egg: target.egg,
    character: persistedCharacter ?? buildCharacterFromEgg(target.egg),
    isPreHatch: !persistedCharacter,
  }
}
