import type { Character, Egg } from '../types/models'

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
