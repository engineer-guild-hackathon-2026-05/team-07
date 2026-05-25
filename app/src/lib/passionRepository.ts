import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase/firebase'
import { COLLECTIONS } from '../types/firestore'
import type { PassionInput } from '../types/models'

export async function createPassionInFirestore(input: PassionInput, ownerUid: string) {
  const passionsRef = collection(db, COLLECTIONS.PASSIONS)

  await addDoc(passionsRef, {
    ownerUid,
    title: input.title,
    description: input.description,
    tags: input.tags,
    embedding: [],
    createdAt: serverTimestamp(),
    visibility: input.visibility,
  })
}
