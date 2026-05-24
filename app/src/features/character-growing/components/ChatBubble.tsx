import type { ChatMessage } from '../../../types/models'

interface Props {
  message: ChatMessage
}

export function ChatBubble({ message }: Props) {
  const isUser = message.role === 'user'
  return (
    <div className={`max-w-[76%] rounded-[20px] px-3.5 py-2.5 text-sm leading-relaxed ${
      isUser
        ? 'self-end bg-[#ff9b37] text-white rounded-br-[4px]'
        : 'self-start bg-[#fff1df] text-[#494949] rounded-bl-[4px]'
    }`}>
      {message.content}
    </div>
  )
}
