import {
  doc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore'
import { httpsCallable } from 'firebase/functions'
import { db, functions } from './firebase'
import { COLLECTIONS } from '../types/firestore'
import type { ExchangeDoc } from '../types/firestore'
import type { Egg } from '../types/models'

export type FirestoreExchange = ExchangeDoc

const createUrlExchangeCallable = httpsCallable<
  { eggId: string },
  { exchangeId: string }
>(functions, 'createUrlExchange')

const completeExchangeCallable = httpsCallable<
  { exchangeId: string },
  { exchangeId: string; characterId: string; eggId: string }
>(functions, 'completeExchange')

export async function ensureEggInFirestore(egg: Egg, ownerUid: string) {
  const eggRef = doc(db, COLLECTIONS.EGGS, egg.id)
  const snap = await getDoc(eggRef)
  if (snap.exists()) {
    return
  }

  await setDoc(eggRef, {
    sourceUserUid: ownerUid,
    sourceUserName: egg.name,
    basedOnPassionIds: egg.basedOnPassionIds,
    characterPrompt: egg.characterPrompt,
    hatchLevel: egg.hatchLevel,
    hatched: false,
    createdAt: serverTimestamp(),
    currentOwnerUid: ownerUid,
  })
}

export async function callCreateUrlExchange(eggId: string) {
  const result = await createUrlExchangeCallable({ eggId })
  return result.data
}

export async function callCompleteExchange(exchangeId: string) {
  const result = await completeExchangeCallable({ exchangeId })
  return result.data
}

export function listenExchange(
  exchangeId: string,
  onChange: (data: ExchangeDoc | null) => void,
  onError?: (error: Error) => void,
) {
  const ref = doc(db, COLLECTIONS.EXCHANGES, exchangeId)
  return onSnapshot(
    ref,
    (snap) => onChange(snap.exists() ? (snap.data() as ExchangeDoc) : null),
    (error) => onError?.(error as Error),
  )
}

export function buildReceiveUrlForExchange(
  exchangeId: string,
  origin = typeof window !== 'undefined' ? window.location.origin : '',
) {
  return `${origin}/exchange/receive/${encodeURIComponent(exchangeId)}`
}
