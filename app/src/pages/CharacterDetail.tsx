import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useRef } from 'react'
import type { AppRoute } from '../types/models'
import { useCharacterDetail, CharacterAvatar, ChatBubble, ChatInput } from '../features/character-growing'
import { BottomNav } from '../features/components/BottomNav'
// App.css provides .bottom-nav and .ui-button styles used by shared components
import '../App.css'

export function CharacterDetail() {
  const { characterId = '' } = useParams<{ characterId: string }>()
  const navigate = useNavigate()
  const { state, sendMessage } = useCharacterDetail(characterId)
  const bottomRef = useRef<HTMLDivElement>(null)

  const messageCount = state.status === 'ok' ? state.chat.messages.length : 0

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messageCount])

  // TODO: Update when App.tsx migrates to React Router URL-based navigation
  function handleNavigation(_route: AppRoute) {
    navigate('/')
  }

  if (state.status === 'loading') {
    return (
      <div className="flex items-center justify-center h-svh">
        <span className="text-sm text-[#494949]/60">読み込み中…</span>
      </div>
    )
  }

  if (state.status === 'not-found' || state.status === 'forbidden') {
    return (
      <div className="flex flex-col items-center justify-center gap-4 h-svh text-center px-6">
        <div className="text-5xl">🔒</div>
        <p className="text-2xl font-black text-[#1f1f1f]">404</p>
        <p className="text-sm text-[#494949]/60">
          {state.status === 'forbidden'
            ? 'このキャラクターへのアクセス権がありません'
            : 'キャラクターが見つかりませんでした'}
        </p>
        <button type="button" className="ui-button" onClick={() => navigate('/')}>
          ホームへ
        </button>
      </div>
    )
  }

  const { character, egg, chat } = state

  return (
    // Outer wrapper: centers on desktop, full-screen on mobile
    <div className="flex justify-center items-center min-h-svh bg-[#f3f3f3] p-7 [@media(max-width:820px)]:p-0">
      {/* Phone-like shell */}
      <div
        className={[
          'relative flex flex-col overflow-hidden',
          'w-full max-w-[390px] min-h-[680px]',
          'rounded-[34px] border-[10px] border-[#f4f4f4]',
          'bg-[#fffdfb] shadow-[0_24px_70px_rgba(73,73,73,0.18)]',
          '[@media(max-width:820px)]:max-w-full',
          '[@media(max-width:820px)]:h-svh [@media(max-width:820px)]:min-h-svh',
          '[@media(max-width:820px)]:rounded-none [@media(max-width:820px)]:border-none',
        ].join(' ')}
        style={{ height: 'min(820px, calc(100svh - 56px))' }}
      >
        {/* Top: character visual + growth meters */}
        <CharacterAvatar character={character} egg={egg} />

        {/* Center: scrollable chat history */}
        <div
          className="flex-1 overflow-y-auto flex flex-col gap-2.5 px-4 py-3.5"
          style={{ paddingBottom: '176px' }} // room for input (58px) + gap + nav (96px) + buffer
        >
          {chat.messages.length === 0 && (
            <p className="text-center text-sm text-[#494949]/60 mt-6">
              はじめて話しかけてみよう
            </p>
          )}
          {chat.messages.map((msg) => (
            <ChatBubble key={msg.id} message={msg} />
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Chat input (absolutely positioned above nav) */}
        <ChatInput onSend={sendMessage} />

        {/* Bottom: nav bar (position: absolute via .bottom-nav in App.css) */}
        <BottomNav activeRoute="grow" onNavigate={handleNavigation} />
      </div>
    </div>
  )
}
