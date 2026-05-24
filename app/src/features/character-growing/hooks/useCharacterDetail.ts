import { useState, useEffect, useCallback } from 'react'
import type { Character, Chat, ChatMessage, Egg } from '../../../types/models'
import { loadAppData, getCurrentUser, CURRENT_USER_ID } from '../../../lib/localRepository'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type CharacterDetailState =
  | { status: 'loading' }
  | { status: 'not-found' }
  | { status: 'forbidden' }
  | { status: 'ok'; character: Character; egg: Egg; chat: Chat }

// ---------------------------------------------------------------------------
// Helpers (module-level → stable references, no closure deps)
// ---------------------------------------------------------------------------

function createId(prefix: string): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `${prefix}-${crypto.randomUUID()}`
  }
  return `${prefix}-${Date.now()}`
}

// TODO: Replace with Firestore write when DB is ready:
//   await setDoc(doc(db, COLLECTIONS.CHATS, chat.id), chat)
//   The real-time listener in useEffect will then pick up the change automatically.
function persistChat(chat: Chat): void {
  try {
    const raw = localStorage.getItem('henai-local-mvp-data')
    if (!raw) return
    const data = JSON.parse(raw) as { chats?: Chat[] }
    const chats = Array.isArray(data.chats) ? data.chats : []
    const idx = chats.findIndex((c) => c.id === chat.id)
    if (idx >= 0) {
      chats[idx] = chat
    } else {
      chats.push(chat)
    }
    localStorage.setItem('henai-local-mvp-data', JSON.stringify({ ...data, chats }))
  } catch {
    // ignore storage errors
  }
}

function buildMockReply(character: Character, userText: string): string {
  // TODO: Replace with Cloud Functions AI call:
  //   const reply = await httpsCallable(functions, 'generateCharacterReply')({
  //     characterId: character.id,
  //     message: userText,
  //     personality: character.personality,
  //     knowledgeAreas: character.knowledgeAreas,
  //   })
  const candidates = [
    `（${character.name}）「${character.unlockedTopics[0] ?? 'それ'}」について、もう少し聞かせてください。`,
    `（${character.name}）${character.knowledgeAreas[0] ?? 'そのこと'}との繋がりが見えてきた気がします。`,
    `（${character.name}）うん…${userText.length > 12 ? 'なるほど、そういうことか。' : 'うん。'}`,
  ]
  return candidates[Math.floor(Math.random() * candidates.length)]
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useCharacterDetail(characterId: string) {
  const [state, setState] = useState<CharacterDetailState>({ status: 'loading' })

  useEffect(() => {
    // TODO: Replace with Firestore real-time listeners when DB is ready:
    //   const unsubChar = onSnapshot(doc(db, COLLECTIONS.CHARACTERS, characterId), snap => { ... })
    //   const unsubChat = onSnapshot(
    //     query(collection(db, COLLECTIONS.CHATS),
    //       where('characterId', '==', characterId),
    //       where('userUid', '==', auth.currentUser?.uid),
    //     ),
    //     snap => { ... },
    //   )
    //   return () => { unsubChar(); unsubChat() }
    const data = loadAppData()
    const user = getCurrentUser(data)

    const character = data.characters.find((c) => c.id === characterId)
    if (!character) {
      setState({ status: 'not-found' })
      return
    }

    // Access control: ownership lives on the Egg, not the Character.
    // TODO: Also enforce via Firestore Security Rules:
    //   allow read: if request.auth.uid == get(/databases/$(database)/documents/eggs/$(resource.data.eggId)).data.currentOwnerUid
    const egg = data.eggs.find((e) => e.id === character.eggId)
    if (!egg || egg.currentOwnerUid !== user.uid) {
      setState({ status: 'forbidden' })
      return
    }

    const existing = data.chats.find(
      (c) => c.characterId === characterId && c.userUid === CURRENT_USER_ID,
    )
    const chat: Chat = existing ?? {
      id: createId('chat'),
      characterId,
      userUid: CURRENT_USER_ID,
      messages: [],
      updatedAt: new Date().toISOString(),
    }

    setState({ status: 'ok', character, egg, chat })
  }, [characterId])

  const sendMessage = useCallback((content: string) => {
    const trimmed = content.trim()
    if (!trimmed) return

    setState((prev) => {
      if (prev.status !== 'ok') return prev

      const now = new Date().toISOString()

      const userMsg: ChatMessage = {
        id: createId('msg'),
        role: 'user',
        content: trimmed,
        createdAt: now,
      }

      const charMsg: ChatMessage = {
        id: createId('msg'),
        role: 'character',
        content: buildMockReply(prev.character, trimmed),
        createdAt: new Date(Date.now() + 400).toISOString(),
      }

      const updatedChat: Chat = {
        ...prev.chat,
        messages: [...prev.chat.messages, userMsg, charMsg],
        updatedAt: now,
      }

      // Persist so messages survive page reload
      persistChat(updatedChat)

      return { ...prev, chat: updatedChat }
    })
  }, [])

  return { state, sendMessage }
}
