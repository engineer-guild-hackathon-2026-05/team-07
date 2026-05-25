import { useEffect, useMemo, useState } from 'react'
import type { User as FirebaseUser } from 'firebase/auth'
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInAnonymously as firebaseSignInAnonymously,
  signInWithPopup,
  signOut as firebaseSignOut,
} from 'firebase/auth'
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore'
import { auth, db } from './firebase'
import type { User } from '../types/models'

export const demoUser: User = {
  uid: 'local-user-m-takahashi',
  name: 'm.takahashi',
  createdAt: new Date().toISOString(),
  favoriteTags: ['カフェ巡り', '深夜ラジオ', '文房具'],
}

const toAppUser = (firebaseUser: FirebaseUser): User => ({
  uid: firebaseUser.uid,
  name: firebaseUser.displayName ?? (firebaseUser.isAnonymous ? 'guest user' : 'user'),
  iconUrl: firebaseUser.photoURL ?? undefined,
  createdAt: new Date().toISOString(),
  favoriteTags: [],
})

const ensureUserDocument = async (firebaseUser: FirebaseUser) => {
  const userRef = doc(db, 'users', firebaseUser.uid)
  const userSnap = await getDoc(userRef)

  if (userSnap.exists()) {
    await setDoc(
      userRef,
      {
        name: firebaseUser.displayName ?? (firebaseUser.isAnonymous ? 'guest user' : 'user'),
        iconUrl: firebaseUser.photoURL ?? '',
      },
      { merge: true },
    )
    return
  }

  await setDoc(userRef, {
    name: firebaseUser.displayName ?? (firebaseUser.isAnonymous ? 'guest user' : 'user'),
    iconUrl: firebaseUser.photoURL ?? '',
    createdAt: serverTimestamp(),
    favoriteTags: [],
  })
}

export function useAuth() {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null)
  const [localDemoUser, setLocalDemoUser] = useState<User | null>(null)
  const [isReady, setIsReady] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (nextUser) => {
      setError('')
      setFirebaseUser(nextUser)
      setIsReady(true)

      if (nextUser) {
        try {
          await ensureUserDocument(nextUser)
        } catch {
          setError('ユーザー情報の保存に失敗しました。Firestoreルールを確認してください。')
        }
      }
    })

    return unsubscribe
  }, [])

  const user = useMemo(() => (firebaseUser ? toAppUser(firebaseUser) : localDemoUser), [firebaseUser, localDemoUser])

  const signInWithGoogle = async () => {
    try {
      setIsLoading(true)
      setError('')
      setLocalDemoUser(null)
      const provider = new GoogleAuthProvider()
      const result = await signInWithPopup(auth, provider)
      await ensureUserDocument(result.user)
    } catch {
      setError('Googleログインに失敗しました。Firebase AuthのGoogle provider設定を確認してください。')
    } finally {
      setIsLoading(false)
    }
  }

  const signInAnonymously = async () => {
    try {
      setIsLoading(true)
      setError('')
      setLocalDemoUser(null)
      const result = await firebaseSignInAnonymously(auth)
      await ensureUserDocument(result.user)
    } catch {
      setError('ゲストログインに失敗しました。Firebase Authの匿名ログイン設定を確認してください。')
    } finally {
      setIsLoading(false)
    }
  }

  const signInWithDemo = () => {
    setError('')
    setLocalDemoUser(demoUser)
  }

  const signOut = async () => {
    if (auth.currentUser) {
      await firebaseSignOut(auth)
    }
    setLocalDemoUser(null)
  }

  return {
    error,
    isLoading,
    isReady,
    setError,
    signInAnonymously,
    signInWithDemo,
    signInWithGoogle,
    signOut,
    user,
  }
}
