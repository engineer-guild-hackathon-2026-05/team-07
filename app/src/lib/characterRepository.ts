import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore'
import { db } from '../firebase/firebase'
import { COLLECTIONS } from '../types/firestore'
import type { CharacterDoc } from '../types/firestore'
import type { Character } from '../types/models'

export const mapCharacterDocToCharacter = (id: string, data: CharacterDoc): Character => ({
  id,
  eggId: data.eggId,
  name: data.name,
  personality: data.personality,
  knowledgeAreas: Array.isArray(data.knowledgeAreas) ? data.knowledgeAreas : [],
  growthLevel: typeof data.growthLevel === 'number' ? data.growthLevel : 1,
  affinityScore: typeof data.affinityScore === 'number' ? data.affinityScore : 0,
  unlockedTopics: Array.isArray(data.unlockedTopics) ? data.unlockedTopics : [],
})

export async function fetchCharacterFromFirestore(characterId: string): Promise<Character | null> {
  const snap = await getDoc(doc(db, COLLECTIONS.CHARACTERS, characterId))
  if (!snap.exists()) {
    return null
  }
  return mapCharacterDocToCharacter(snap.id, snap.data() as CharacterDoc)
}

export async function fetchMyCharactersFromFirestore(userId: string): Promise<Character[]> {
  const charactersRef = collection(db, COLLECTIONS.CHARACTERS)
  const q = query(charactersRef, where('ownerUid', '==', userId))
  const snap = await getDocs(q)
  return snap.docs.map((item) => mapCharacterDocToCharacter(item.id, item.data() as CharacterDoc))
}
