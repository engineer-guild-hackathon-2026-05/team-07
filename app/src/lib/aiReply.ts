import { httpsCallable } from 'firebase/functions'
import { functions } from '../firebase/firebase'

export type PromptType = 'character_making' | 'character_growing'

type GenerateAiReplyRequest = {
  promptType: PromptType
  message: string
  context?: string
}

type GenerateAiReplyResponse = {
  reply: string
}

export async function generateAiReply(input: GenerateAiReplyRequest) {
  const callable = httpsCallable<GenerateAiReplyRequest, GenerateAiReplyResponse>(functions, 'generateAiReply')
  const result = await callable(input)
  return result.data.reply
}
