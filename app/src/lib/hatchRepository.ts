import { getFunctions, httpsCallable } from 'firebase/functions'
import { app } from '../firebase/firebase'

type AdvanceHatchProgressRequest = {
  eggId: string
}

type AdvanceHatchProgressResponse = {
  eggId: string
  hatchLevel: number
  hatched: boolean
  characterId?: string
}

export async function advanceHatchProgress(eggId: string) {
  const functions = getFunctions(app, 'asia-northeast1')
  const callable = httpsCallable<AdvanceHatchProgressRequest, AdvanceHatchProgressResponse>(
    functions,
    'advanceHatchProgress',
  )
  const result = await callable({ eggId })
  return result.data
}
