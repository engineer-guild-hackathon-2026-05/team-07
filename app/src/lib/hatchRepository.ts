import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { getFunctions, httpsCallable } from 'firebase/functions'
import { app, auth, db } from '../firebase/firebase'
import { COLLECTIONS } from '../types/firestore'
import type { EggDoc } from '../types/firestore'
import { HATCH_COMPLETE_LEVEL, HATCH_PROGRESS_PER_MESSAGE } from './localRepository'

type AdvanceHatchProgressRequest = {
  eggId: string
}

type AdvanceHatchProgressResponse = {
  eggId: string
  hatchLevel: number
  hatched: boolean
  characterId?: string
}

async function callAdvanceHatchProgressCallable(
  eggId: string,
): Promise<AdvanceHatchProgressResponse> {
  const functions = getFunctions(app, 'asia-northeast1')
  const callable = httpsCallable<AdvanceHatchProgressRequest, AdvanceHatchProgressResponse>(
    functions,
    'advanceHatchProgress',
  )
  const result = await callable({ eggId })
  return result.data
}

/** Cloud Function 未デプロイ時などのフォールバック: Firestore 上の hatchLevel を直接更新する */
async function advanceHatchProgressViaFirestore(
  eggId: string,
): Promise<AdvanceHatchProgressResponse> {
  const uid = auth.currentUser?.uid
  if (!uid) {
    throw new Error('ログインが必要です。')
  }

  const eggRef = doc(db, COLLECTIONS.EGGS, eggId)
  const snap = await getDoc(eggRef)
  if (!snap.exists()) {
    throw new Error('卵が見つかりません。')
  }

  const egg = snap.data() as EggDoc
  if (egg.currentOwnerUid !== uid) {
    throw new Error('この卵を育てる権限がありません。')
  }

  const characterId = eggId
  const charSnap = await getDoc(doc(db, COLLECTIONS.CHARACTERS, characterId))
  if (charSnap.exists() || egg.hatched) {
    return {
      eggId,
      hatchLevel: egg.hatchLevel ?? 0,
      hatched: true,
      characterId,
    }
  }

  const hatchLevel = Math.min(
    HATCH_COMPLETE_LEVEL,
    (egg.hatchLevel ?? 0) + HATCH_PROGRESS_PER_MESSAGE,
  )
  const hatched = hatchLevel >= HATCH_COMPLETE_LEVEL

  if (!hatched) {
    await updateDoc(eggRef, { hatchLevel })
    return { eggId, hatchLevel, hatched: false }
  }

  // 100% 到達時はキャラ doc 作成のため Cloud Function を優先する
  try {
    return await callAdvanceHatchProgressCallable(eggId)
  } catch {
    await updateDoc(eggRef, { hatchLevel, hatched: true })
    return { eggId, hatchLevel, hatched: true, characterId }
  }
}

export async function advanceHatchProgress(eggId: string) {
  try {
    return await advanceHatchProgressViaFirestore(eggId)
  } catch {
    return callAdvanceHatchProgressCallable(eggId)
  }
}
