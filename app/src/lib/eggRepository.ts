import { addDoc, collection, doc, getDoc, getDocs, query, serverTimestamp, where } from 'firebase/firestore'
import { db } from '../firebase/firebase'
import { COLLECTIONS } from '../types/firestore'
import type { EggDoc } from '../types/firestore'
import type { Egg } from '../types/models'

type PassionForEgg = {
  title: string
  overview?: string
  subjectAttractions?: string[]
}

const EGG_NAME_SEEDS = ['コダワリス', 'スキノメ', 'ハマリット', 'ネツタマ', 'ピントン']
const EGG_COLOR_SEEDS = ['#FF9B37', '#4EDBFB', '#E77300', '#ffb6d9']
const EGG_MOTIF_SEEDS: Egg['motif'][] = ['fox', 'cat', 'bird', 'egg']

const pickEggMeta = (title: string) => {
  const score = Array.from(title).reduce((sum, char) => sum + char.charCodeAt(0), 0)
  return {
    name: EGG_NAME_SEEDS[score % EGG_NAME_SEEDS.length],
    color: EGG_COLOR_SEEDS[score % EGG_COLOR_SEEDS.length],
    motif: EGG_MOTIF_SEEDS[score % EGG_MOTIF_SEEDS.length],
  }
}

const toIsoString = (value: EggDoc['createdAt']) => {
  if (typeof value === 'string') {
    return value
  }
  if (value && typeof value === 'object' && 'toDate' in value && typeof value.toDate === 'function') {
    return value.toDate().toISOString()
  }
  return new Date().toISOString()
}

export const mapEggDocToEgg = (id: string, data: EggDoc): Egg => {
  const meta = pickEggMeta(data.sourceUserName || id)
  return {
    id,
    sourceUserUid: data.sourceUserUid,
    basedOnPassionIds: Array.isArray(data.basedOnPassionIds) ? data.basedOnPassionIds : [],
    characterPrompt: data.characterPrompt ?? '',
    hatchLevel: typeof data.hatchLevel === 'number' ? data.hatchLevel : 0,
    createdAt: toIsoString(data.createdAt),
    currentOwnerUid: data.currentOwnerUid,
    name: data.sourceUserName || meta.name,
    color: meta.color,
    motif: meta.motif,
  }
}

export async function fetchEggFromFirestore(eggId: string): Promise<Egg | null> {
  const snap = await getDoc(doc(db, COLLECTIONS.EGGS, eggId))
  if (!snap.exists()) {
    return null
  }
  return mapEggDocToEgg(snap.id, snap.data() as EggDoc)
}

export async function fetchMyEggsFromFirestore(userId: string): Promise<Egg[]> {
  const eggsRef = collection(db, COLLECTIONS.EGGS)
  const q = query(eggsRef, where('currentOwnerUid', '==', userId))
  const snap = await getDocs(q)
  return snap.docs.map((item) => mapEggDocToEgg(item.id, item.data() as EggDoc))
}

export async function createEggFromPassion(params: {
  passionId: string
  userId: string
  userName: string
}): Promise<Egg> {
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
  const eggMeta = pickEggMeta(passion.title)

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
    name: eggMeta.name,
    color: eggMeta.color,
    motif: eggMeta.motif,
  })

  return {
    id: created.id,
    sourceUserUid: userId,
    basedOnPassionIds: [passionId],
    characterPrompt: promptLines.join('\n'),
    hatchLevel: 0,
    createdAt: new Date().toISOString(),
    currentOwnerUid: userId,
    name: eggMeta.name,
    color: eggMeta.color,
    motif: eggMeta.motif,
  }
}
