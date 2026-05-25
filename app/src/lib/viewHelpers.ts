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
