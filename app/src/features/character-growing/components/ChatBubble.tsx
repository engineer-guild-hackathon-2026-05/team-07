import type { ChatMessage } from '../../../types/models'

interface Props {
  message: ChatMessage
}

export function ChatBubble({ message }: Props) {
  const isUser = message.role === 'user'
  return (
    <div className={`max-w-[76%] rounded-[20px] px-3.5 py-2.5 text-sm leading-relaxed ${
      isUser
        ? 'self-end bg-orange text-white rounded-br-[4px]'
        : 'self-start bg-cream-tab text-text rounded-bl-[4px]'
    }`}>
      {message.content}
    </div>
  )
}
