import { addDoc, collection, doc, getDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase/firebase'
import { COLLECTIONS } from '../types/firestore'

type PassionForEgg = {
  title: string
  overview?: string
  subjectAttractions?: string[]
}

export async function createEggFromPassion(params: {
  passionId: string
  userId: string
  userName: string
}): Promise<string> {
  const { passionId, userId, userName } = params
  const passionRef = doc(db, COLLECTIONS.PASSIONS, passionId)
  const passionSnap = await getDoc(passionRef)

  if (!passionSnap.exists()) {
    throw new Error('偏愛データが見つかりません')
  }

  const passion = passionSnap.data() as PassionForEgg
  const attractions = Array.isArray(passion.subjectAttractions)
    ? passion.subjectAttractions.filter((value): value is string => typeof value === 'string').slice(0, 8)
    : []

  const promptLines = [
    `偏愛タイトル: ${passion.title}`,
    `偏愛概要: ${passion.overview ?? ''}`,
    `偏愛対象の魅力: ${attractions.join(' / ') || '未抽出'}`,
  ]

  const eggsRef = collection(db, COLLECTIONS.EGGS)
  const created = await addDoc(eggsRef, {
    sourceUserUid: userId,
    sourceUserName: userName,
    basedOnPassionIds: [passionId],
    characterPrompt: promptLines.join('\n'),
    hatchLevel: 0,
    hatched: false,
    createdAt: serverTimestamp(),
    currentOwnerUid: userId,
  })

  return created.id
}
