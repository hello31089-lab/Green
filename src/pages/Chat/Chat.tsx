import type { Chat, ChatMessage } from '../../types/chat'
import { ChatView } from '../../components/ChatView'
import { Sidebar } from '../../components/Sidebar'

export interface ChatProps {
  chats: Chat[]
  chat?: Chat
  messages: ChatMessage[]
  onSelectChat: (chatId: string) => void
  onSend: (text: string) => void
}

export function Chat({ chats, chat, messages, onSelectChat, onSend }: ChatProps) {
  return (
    <div style={{ display: 'flex', height: '100%' }}>
      <Sidebar chats={chats} activeChatId={chat?.id} onSelectChat={onSelectChat} />
      <ChatView chat={chat} messages={messages} onSend={onSend} />
    </div>
  )
}

export default Chat
