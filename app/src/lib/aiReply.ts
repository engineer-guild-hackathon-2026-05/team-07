import { getFunctions, httpsCallable } from 'firebase/functions'
import { app } from '../firebase/firebase'

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
  const functions = getFunctions(app, 'asia-northeast1')
  const callable = httpsCallable<GenerateAiReplyRequest, GenerateAiReplyResponse>(functions, 'generateAiReply')
  const result = await callable(input)
  return result.data.reply
}
