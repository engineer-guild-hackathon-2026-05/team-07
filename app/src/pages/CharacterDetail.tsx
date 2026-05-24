import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import { CharacterAvatar, ChatBubble, ChatInput } from '../features/character-growing'
import { EmptyState } from '../features/components/ui'
import { getEggForCharacter } from '../lib/viewHelpers'
import type { Character, Chat, ChatMessage, Egg } from '../types/models'

type CharacterDetailPageProps = {
  characters: Character[]
  eggs: Egg[]
  userId?: string
}

const STORAGE_KEY = 'henai-local-mvp-data'
const FALLBACK_USER_ID = 'local-user-m-takahashi'

const createId = (prefix: string) => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `${prefix}-${crypto.randomUUID()}`
  }

  return `${prefix}-${Date.now()}`
}

const buildMockReply = (character: Character, userText: string) => {
  const candidates = [
    `（${character.name}）「${character.unlockedTopics[0] ?? 'それ'}」について、もう少し聞かせてください。`,
    `（${character.name}）${character.knowledgeAreas[0] ?? 'そのこと'}との繋がりが見えてきた気がします。`,
    `（${character.name}）${userText.length > 12 ? 'なるほど、そういうことか。' : 'うん、もっと聞きたいです。'}`,
  ]

  return candidates[Math.floor(Math.random() * candidates.length)]
}

const readChat = (characterId: string, userId: string) => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return undefined
    }

    const data = JSON.parse(raw) as { chats?: Chat[] }
    return data.chats?.find((chat) => chat.characterId === characterId && chat.userUid === userId)
  } catch {
    return undefined
  }
}

const persistChat = (chat: Chat) => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const data = raw ? (JSON.parse(raw) as { chats?: Chat[] }) : {}
    const chats = Array.isArray(data.chats) ? data.chats : []
    const chatIndex = chats.findIndex((item) => item.id === chat.id)

    if (chatIndex >= 0) {
      chats[chatIndex] = chat
    } else {
      chats.push(chat)
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...data, chats }))
  } catch {
    // Local demo chat history is non-critical.
  }
}

export function CharacterDetailPage({ characters, eggs, userId = FALLBACK_USER_ID }: CharacterDetailPageProps) {
  const { characterId } = useParams()
  const fallbackCharacter = characters[0]

  if (!characterId && fallbackCharacter) {
    return <Navigate to={`/characters/${fallbackCharacter.id}`} replace />
  }

  const character = characters.find((item) => item.id === characterId)
  const egg = character ? getEggForCharacter(eggs, character) : undefined

  if (!character) {
    return (
      <div className="screen">
        <EmptyState title="育成中キャラがいません" description="偏愛登録から生まれたキャラをここで育てます。" />
      </div>
    )
  }

  if (!egg) {
    return (
      <div className="screen">
        <EmptyState title="卵が見つかりません" description="キャラクターに紐づく卵データを確認してください。" />
      </div>
    )
  }

  return <CharacterChat character={character} egg={egg} userId={userId} />
}

function CharacterChat({ character, egg, userId }: { character: Character; egg: Egg; userId: string }) {
  const bottomRef = useRef<HTMLDivElement>(null)
  const initialChat = useMemo(
    () =>
      readChat(character.id, userId) ?? {
        id: createId('chat'),
        characterId: character.id,
        userUid: userId,
        messages: [],
        updatedAt: new Date().toISOString(),
      },
    [character.id, userId],
  )
  const [chat, setChat] = useState<Chat>(initialChat)

  useEffect(() => {
    setChat(initialChat)
  }, [initialChat])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chat.messages.length])

  const sendMessage = useCallback(
    (content: string) => {
      const trimmed = content.trim()
      if (!trimmed) {
        return
      }

      setChat((currentChat) => {
        const now = new Date().toISOString()
        const userMessage: ChatMessage = {
          id: createId('msg'),
          role: 'user',
          content: trimmed,
          createdAt: now,
        }
        const characterMessage: ChatMessage = {
          id: createId('msg'),
          role: 'character',
          content: buildMockReply(character, trimmed),
          createdAt: new Date(Date.now() + 400).toISOString(),
        }
        const nextChat = {
          ...currentChat,
          messages: [...currentChat.messages, userMessage, characterMessage],
          updatedAt: now,
        }

        persistChat(nextChat)
        return nextChat
      })
    },
    [character],
  )

  return (
    <div className="screen !p-0 flex flex-col">
      <CharacterAvatar character={character} egg={egg} />

      <div className="flex-1 overflow-y-auto flex flex-col gap-2.5 px-4 py-3.5" style={{ paddingBottom: '176px' }}>
        {chat.messages.length === 0 ? (
          <p className="text-center text-sm text-[#494949]/60 mt-6">はじめて話しかけてみよう</p>
        ) : null}
        {chat.messages.map((message) => (
          <ChatBubble key={message.id} message={message} />
        ))}
        <div ref={bottomRef} />
      </div>

      <section className="px-4 pb-[184px]">
        <div className="panel">
          <h2>解放済みトピック</h2>
          <div className="tag-list">
            {character.unlockedTopics.map((topic) => (
              <span className="tag-chip tag-chip--static" key={topic}>
                {topic}
              </span>
            ))}
          </div>
        </div>
      </section>

      <ChatInput onSend={sendMessage} />
    </div>
  )
}
