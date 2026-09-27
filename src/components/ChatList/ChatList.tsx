import type { Chat } from '../../types/chat'
import { ChatItem } from '../ChatItem'
import styles from './ChatList.module.css'

export interface ChatListProps {
  chats: Chat[]
  activeChatId?: string
  onSelect: (chatId: string) => void
}

export function ChatList({ chats, activeChatId, onSelect }: ChatListProps) {
  if (chats.length === 0) {
    return <p className={styles.empty}>No chats found</p>
  }

  return (
    <div className={styles.list}>
      {chats.map((chat) => (
        <ChatItem
          key={chat.id}
          chat={chat}
          isActive={chat.id === activeChatId}
          onSelect={onSelect}
        />
      ))}
    </div>
  )
}

export default ChatList
