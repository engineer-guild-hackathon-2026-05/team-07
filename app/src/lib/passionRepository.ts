import { addDoc, collection, doc, getDoc, serverTimestamp, updateDoc } from 'firebase/firestore'
import { db } from '../firebase/firebase'
import { COLLECTIONS } from '../types/firestore'
import type { PassionInput } from '../types/models'

export type PassionChatMessage = {
  role: 'user' | 'assistant'
  content: string
  createdAt: string
}

export async function createPassionInFirestore(input: PassionInput, ownerUid: string) {
  const passionsRef = collection(db, COLLECTIONS.PASSIONS)
  const created = await addDoc(passionsRef, {
    ownerUid,
    title: input.title,
    description: input.description,
    tags: input.tags,
    embedding: [],
    createdAt: serverTimestamp(),
    visibility: input.visibility,
    chatHistory: [],
  })

  return created.id
}

export async function appendPassionChatHistory(passionId: string, messages: PassionChatMessage[]) {
  const passionRef = doc(db, COLLECTIONS.PASSIONS, passionId)
  await updateDoc(passionRef, { chatHistory: messages })
}

export async function loadPassionChatHistory(passionId: string): Promise<PassionChatMessage[]> {
  const passionRef = doc(db, COLLECTIONS.PASSIONS, passionId)
  const passionSnap = await getDoc(passionRef)
  if (!passionSnap.exists()) {
    return []
  }

  const data = passionSnap.data() as { chatHistory?: unknown }
  if (!Array.isArray(data.chatHistory)) {
    return []
  }

  return data.chatHistory.filter(
    (message): message is PassionChatMessage =>
      typeof message === 'object' &&
      message !== null &&
      (message as { role?: unknown }).role !== undefined &&
      (message as { content?: unknown }).content !== undefined &&
      (message as { createdAt?: unknown }).createdAt !== undefined,
  )
}
