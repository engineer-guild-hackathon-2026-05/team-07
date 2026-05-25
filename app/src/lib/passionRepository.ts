import { addDoc, collection, doc, getDoc, runTransaction, serverTimestamp } from 'firebase/firestore'
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
    overview: `${input.title}\n${input.description}\n${input.tags.map((tag) => `#${tag}`).join(' ')}`.trim(),
    makingStatus: 'draft',
    subjectAttractions: [],
    latestInterviewQuestion: '',
    latestReplyChoices: [],
    chatHistory: [],
  })

  return created.id
}

export async function loadPassionProfile(passionId: string): Promise<{
  overview: string
  subjectAttractions: string[]
  makingStatus: 'draft' | 'interviewing' | 'finalized'
  latestReplyChoices: string[]
}> {
  const passionRef = doc(db, COLLECTIONS.PASSIONS, passionId)
  const snap = await getDoc(passionRef)
  if (!snap.exists()) {
    return { overview: '', subjectAttractions: [], makingStatus: 'draft', latestReplyChoices: [] }
  }
  const data = snap.data() as {
    overview?: unknown
    subjectAttractions?: unknown
    makingStatus?: unknown
    latestReplyChoices?: unknown
  }
  return {
    overview: typeof data.overview === 'string' ? data.overview : '',
    subjectAttractions: Array.isArray(data.subjectAttractions)
      ? data.subjectAttractions.filter((v): v is string => typeof v === 'string')
      : [],
    makingStatus:
      data.makingStatus === 'interviewing' || data.makingStatus === 'finalized' ? data.makingStatus : 'draft',
    latestReplyChoices: Array.isArray(data.latestReplyChoices)
      ? data.latestReplyChoices.filter((v): v is string => typeof v === 'string').slice(0, 3)
      : [],
  }
}

export async function appendPassionChatHistory(passionId: string, messages: PassionChatMessage[]) {
  const passionRef = doc(db, COLLECTIONS.PASSIONS, passionId)
  await runTransaction(db, async (transaction) => {
    const snap = await transaction.get(passionRef)
    if (!snap.exists()) {
      return
    }
    const data = snap.data() as { chatHistory?: unknown }
    const currentHistory = Array.isArray(data.chatHistory) ? data.chatHistory : []
    const nextHistory = [...currentHistory, ...messages].slice(-200)
    transaction.update(passionRef, { chatHistory: nextHistory })
  })
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
