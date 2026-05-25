import { getFunctions, httpsCallable } from 'firebase/functions'
import { app } from '../firebase/firebase'

type GeneratePassionReplyRequest = {
  passionId: string
  message: string
}

type GeneratePassionReplyResponse = {
  reply: string
}

export async function generatePassionReply(input: GeneratePassionReplyRequest) {
  try {
    const functions = getFunctions(app, 'asia-northeast1')
    const generate = httpsCallable<GeneratePassionReplyRequest, GeneratePassionReplyResponse>(
      functions,
      'generatePassionReply',
    )
    const result = await generate(input)
    return result.data.reply
  } catch {
    return `なるほど。「${input.message.slice(0, 24)}」が気になるんですね。もう少し詳しく教えてください。`
  }
}
