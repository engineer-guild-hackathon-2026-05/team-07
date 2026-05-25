import { httpsCallable } from 'firebase/functions'
import { collection, getDocs, orderBy, query } from 'firebase/firestore'
import { db, functions } from '../firebase/firebase'
import { COLLECTIONS, SUBCOLLECTIONS } from '../types/firestore'
import type { PassionChatMessage } from './passionRepository'

type StartInterviewInput = { passionId: string }
type ContinueInterviewInput = { passionId: string; userMessage: string }
type FinalizeInterviewInput = { passionId: string }

type StartInterviewOutput = {
  overview: string
  messages: PassionChatMessage[]
  choices?: string[]
}

type ContinueInterviewOutput = {
  reply: string
  choices?: string[]
}

type FinalizeInterviewOutput = {
  subjectAttractions: string[]
}

export async function startPassionInterview(passionId: string): Promise<StartInterviewOutput> {
  const callable = httpsCallable<StartInterviewInput, StartInterviewOutput>(functions, 'startPassionInterview')
  const result = await callable({ passionId })
  return result.data
}

export async function continuePassionInterview(input: ContinueInterviewInput): Promise<ContinueInterviewOutput> {
  const callable = httpsCallable<ContinueInterviewInput, ContinueInterviewOutput>(functions, 'continuePassionInterview')
  const result = await callable(input)
  return result.data
}

export async function finalizePassionInterview(passionId: string): Promise<FinalizeInterviewOutput> {
  const callable = httpsCallable<FinalizeInterviewInput, FinalizeInterviewOutput>(functions, 'finalizePassionInterview')
  const result = await callable({ passionId })
  return result.data
}

export async function loadMakingMessages(passionId: string): Promise<PassionChatMessage[]> {
  const messagesRef = collection(db, COLLECTIONS.PASSIONS, passionId, SUBCOLLECTIONS.PASSION_MAKING_MESSAGES)
  const q = query(messagesRef, orderBy('createdAt', 'asc'))
  const snap = await getDocs(q)
  return snap.docs.map((d) => {
    const data = d.data() as { role?: unknown; content?: unknown; createdAt?: unknown }
    const timestamp = data.createdAt as { toDate?: () => Date }
    return {
      role: (data.role === 'assistant' ? 'assistant' : 'user') as 'user' | 'assistant',
      content: typeof data.content === 'string' ? data.content : '',
      createdAt:
        typeof data.createdAt === 'string'
          ? data.createdAt
          : timestamp?.toDate?.()?.toISOString?.() ?? new Date().toISOString(),
    }
  })
}
