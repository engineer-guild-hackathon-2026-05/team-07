import type { Character, Egg, Passion } from '../types/models'

export type ExchangeShareInput = {
  egg: Egg
  passion?: Passion
  character?: Character
  senderName: string
  giftMessage?: string
  meetingContext?: string
  origin?: string
}

export const buildReceiveUrl = (eggId: string, origin = typeof window !== 'undefined' ? window.location.origin : '') =>
  `${origin}/exchange/receive?egg=${encodeURIComponent(eggId)}`

export const buildShareText = ({
  egg,
  passion,
  character,
  senderName,
  giftMessage,
  meetingContext,
  origin,
}: ExchangeShareInput) => {
  const receiveUrl = buildReceiveUrl(egg.id, origin)
  const tagLine = passion?.tags.slice(0, 3).map((tag) => `#${tag}`).join(' ') ?? ''
  const passionLine = passion
    ? `偏愛「${passion.title}」から生まれた卵`
    : '偏愛から生まれた卵'
  const personalityLine = character?.personality ? `\n${character.personality}` : ''
  const messageLine = giftMessage?.trim() ? `\n\n「${giftMessage.trim()}」\n— ${senderName}` : ''
  const contextLine = meetingContext?.trim() ? `\n出会い: ${meetingContext.trim()}` : ''

  return `「${egg.name}」を渡したい！
${passionLine} 🥚${personalityLine}
${tagLine}${messageLine}${contextLine}

受け取る → ${receiveUrl}`
}

export const buildLineShareUrl = (text: string) =>
  `https://line.me/R/msg/text/?${encodeURIComponent(text)}`

export const copyShareText = async (text: string) => {
  await navigator.clipboard.writeText(text)
}

export const shareViaNativeSheet = async (input: ExchangeShareInput) => {
  const text = buildShareText(input)
  const url = buildReceiveUrl(input.egg.id, input.origin)

  if (!navigator.share) {
    return false
  }

  await navigator.share({
    title: `「${input.egg.name}」を渡す`,
    text,
    url,
  })

  return true
}
