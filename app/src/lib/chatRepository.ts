import { getFunctions, httpsCallable } from 'firebase/functions'
import { collection, getDocs, orderBy, query } from 'firebase/firestore'
import { app, db } from '../firebase/firebase'
import { COLLECTIONS, SUBCOLLECTIONS, chatIdFor } from '../types/firestore'
import type { ChatMessage } from '../types/models'

type SendMessageRequest = {
  characterId: string
  userMessage: string
}

type SendMessageResponse = {
  reply: string
}

export async function sendMessageToCharacter(req: SendMessageRequest): Promise<string> {
  const functions = getFunctions(app, 'asia-northeast1')
  const callable = httpsCallable<SendMessageRequest, SendMessageResponse>(functions, 'sendMessage')
  const result = await callable(req)
  return result.data.reply
}

export async function fetchChatMessages(
  characterId: string,
  userUid: string,
): Promise<ChatMessage[]> {
  const chatId = chatIdFor(characterId, userUid)
  const messagesRef = collection(db, COLLECTIONS.CHATS, chatId, SUBCOLLECTIONS.CHAT_MESSAGES)
  const q = query(messagesRef, orderBy('createdAt', 'asc'))
  const snapshot = await getDocs(q)
  return snapshot.docs.map((d) => {
    const data = d.data()
    const createdAt: string =
      typeof data.createdAt === 'string'
        ? data.createdAt
        : (data.createdAt?.toDate?.() as Date | undefined)?.toISOString() ?? new Date().toISOString()
    return {
      id: d.id,
      role: data.role as 'user' | 'character',
      content: data.content as string,
      createdAt,
    }
  })
}
