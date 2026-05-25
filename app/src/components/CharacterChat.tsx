import { useCallback, useEffect, useRef, useState } from 'react'
import type { Character, Chat, ChatMessage, Egg } from '../types/models'
import { CharacterAvatar, ChatBubble, ChatInput } from '../features/character-growing'
import { generateAiReply } from '../lib/aiReply'
import { fetchChatMessages, sendMessageToCharacter } from '../lib/chatRepository'
import { auth } from '../firebase/firebase'
import { Modal } from './ui'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type CharacterChatProps = {
  character: Character
  egg: Egg
  userId: string
}

// ---------------------------------------------------------------------------
// Storage helpers
// ---------------------------------------------------------------------------

const STORAGE_KEY = 'henai-local-mvp-data'

const createId = (prefix: string) =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? `${prefix}-${crypto.randomUUID()}`
    : `${prefix}-${Date.now()}`

function readChat(characterId: string, userId: string): Chat | undefined {
  // TODO: Replace with Firestore real-time subscription:
  //   onSnapshot(
  //     query(collection(db, COLLECTIONS.CHATS),
  //       where('characterId', '==', characterId),
  //       where('userUid', '==', userId),
  //     ),
  //     (snap) => { const doc = snap.docs[0]; if (doc) setChat(doc.data() as Chat) }
  //   )
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return undefined
    const data = JSON.parse(raw) as { chats?: Chat[] }
    return data.chats?.find((c) => c.characterId === characterId && c.userUid === userId)
  } catch {
    return undefined
  }
}

function persistChat(chat: Chat): void {
  // TODO: Replace with Firestore write:
  //   await setDoc(doc(db, COLLECTIONS.CHATS, chat.id), chat)
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const data = raw ? (JSON.parse(raw) as { chats?: Chat[] }) : {}
    const chats = Array.isArray(data.chats) ? [...data.chats] : []
    const idx = chats.findIndex((c) => c.id === chat.id)
    if (idx >= 0) chats[idx] = chat
    else chats.push(chat)
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...data, chats }))
  } catch {
    // Local demo history is non-critical
  }
}

function buildMockReply(character: Character, userText: string): string {
  const pool = [
    `（${character.name}）「${character.unlockedTopics[0] ?? 'それ'}」について、もう少し聞かせてください。`,
    `（${character.name}）${character.knowledgeAreas[0] ?? 'そのこと'}との繋がりが見えてきた気がします。`,
    `（${character.name}）${userText.length > 12 ? 'なるほど、そういうことか。' : 'うん、もっと聞きたいです。'}`,
  ]
  return pool[Math.floor(Math.random() * pool.length)]
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function CharacterChat({ character, egg, userId }: CharacterChatProps) {
  const historyBottomRef = useRef<HTMLDivElement>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [lastCharReply, setLastCharReply] = useState<string | null>(null)
  const [replyFading, setReplyFading] = useState(false)

  const [chat, setChat] = useState<Chat>(
    () =>
      readChat(character.id, userId) ?? {
        id: createId('chat'),
        characterId: character.id,
        userUid: userId,
        messages: [],
        updatedAt: new Date().toISOString(),
      },
  )

  // Firestore からメッセージ履歴を初回ロード（認証ユーザーのみ）
  useEffect(() => {
    const firebaseUser = auth.currentUser
    if (!firebaseUser) return
    fetchChatMessages(character.id, firebaseUser.uid)
      .then((messages) => {
        if (messages.length > 0) {
          setChat((prev) => ({ ...prev, messages }))
        }
      })
      .catch(() => {})
  }, [character.id])

  // Fade out reply bubble 3s after it appears, remove from DOM at 4.2s
  useEffect(() => {
    if (!lastCharReply) return
    const fadeTimer = setTimeout(() => setReplyFading(true), 3000)
    const clearTimer = setTimeout(() => {
      setLastCharReply(null)
      setReplyFading(false)
    }, 4200)
    return () => {
      clearTimeout(fadeTimer)
      clearTimeout(clearTimer)
    }
  }, [lastCharReply])

  const sendMessage = useCallback(
    async (content: string) => {
      const trimmed = content.trim()
      if (!trimmed) return

      const now = new Date().toISOString()
      const userMsg: ChatMessage = {
        id: createId('msg'),
        role: 'user',
        content: trimmed,
        createdAt: now,
      }

      // Append user message immediately
      setChat((prev) => {
        const next = { ...prev, messages: [...prev.messages, userMsg], updatedAt: now }
        persistChat(next)
        return next
      })

      setIsLoading(true)
      setReplyFading(false)

      let replyText = ''
      try {
        const firebaseUser = auth.currentUser
        if (firebaseUser) {
          // 認証ユーザー: sendMessage callable（履歴・キャラクタープロンプト込み）
          replyText = await sendMessageToCharacter({
            characterId: character.id,
            userMessage: trimmed,
          })
        } else {
          // 非認証（デモ）: generateAiReply でコンテキストのみ渡す
          replyText = await generateAiReply({
            promptType: 'character_growing',
            message: trimmed,
            context: `characterName=${character.name}; personality=${character.personality}; knowledgeAreas=${character.knowledgeAreas.join(',')}`,
          })
        }
      } catch {
        replyText = buildMockReply(character, trimmed)
      }

      const characterMessage: ChatMessage = {
        id: createId('msg'),
        role: 'character',
        content: replyText,
        createdAt: new Date().toISOString(),
      }

      setIsLoading(false)
      setLastCharReply(characterMessage.content)
      setChat((prev) => {
        const next = { ...prev, messages: [...prev.messages, characterMessage], updatedAt: new Date().toISOString() }
        persistChat(next)
        return next
      })
    },
    [character],
  )

  return (
    <div className="screen !p-0 flex flex-col relative">
      {/* History button — top right */}
      <button
        type="button"
        onClick={() => setShowHistory(true)}
        aria-label="会話履歴を見る"
        className="absolute top-3 right-3 z-10 flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#fff8f0] border border-[#f1e7dc] text-[#e77300] text-xs font-bold shadow-sm hover:bg-[#fff1df] transition-colors"
      >
        <span aria-hidden>🕐</span> 履歴
      </button>

      {/* Top spacer — pushes avatar toward center */}
      <div className="flex-1" />

      {/* Speech bubble — sits above character name, tail points center-down toward character */}
      {(isLoading || lastCharReply !== null) && (
        <div
          className={`px-6 pb-2 flex justify-center transition-opacity duration-[1200ms] ${replyFading ? 'opacity-0' : 'opacity-100'}`}
        >
          <div className="relative bg-white border border-[#f1e7dc] rounded-2xl px-4 py-3 shadow-md max-w-[85%]">
            {isLoading ? (
              <span className="inline-flex items-center gap-1 text-sm text-[#494949]/60">
                考え中
                <span className="flex gap-0.5">
                  <Dot delay="0ms" />
                  <Dot delay="160ms" />
                  <Dot delay="320ms" />
                </span>
              </span>
            ) : (
              <p className="text-sm text-[#494949] leading-relaxed">{lastCharReply}</p>
            )}
            {/* Tail — center bottom, pointing downward toward character */}
            <div className="absolute -bottom-[7px] left-1/2 -translate-x-1/2 w-3.5 h-3.5 bg-white border-r border-b border-[#f1e7dc] rotate-45" />
          </div>
        </div>
      )}

      {/* Character avatar (name, affinity, image, status button) */}
      <CharacterAvatar character={character} egg={egg} />

      {/* Spacer so input doesn't overlap avatar */}
      <div className="flex-1" />

      {/* Chat input */}
      <ChatInput onSend={sendMessage} disabled={isLoading} />

      {/* History modal */}
      <Modal
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
        title="会話履歴"
      >
        <div className="flex flex-col gap-2.5 min-h-[300px] max-h-[50vh] overflow-y-auto pt-2">
          {chat.messages.length === 0 ? (
            <p className="text-sm text-center text-[#494949]/50 py-4">まだメッセージはありません</p>
          ) : (
            chat.messages.map((msg) => <ChatBubble key={msg.id} message={msg} />)
          )}
          <div ref={historyBottomRef} />
        </div>
      </Modal>
    </div>
  )
}

// ── Sub-components ──────────────────────────────────────────────────────────

function Dot({ delay }: { delay: string }) {
  return (
    <span
      className="w-1 h-1 rounded-full bg-[#ff9b37] animate-bounce"
      style={{ animationDelay: delay }}
    />
  )
}
