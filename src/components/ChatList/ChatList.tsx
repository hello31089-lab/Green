import type { Chat } from '../../types/chat'
import type { LoadStatus } from '../../providers/chatsContext'
import { ChatItem } from '../ChatItem'
import styles from './ChatList.module.css'

export interface ChatListProps {
  chats: Chat[]
  activeChatId?: string
  status: LoadStatus
  error: string | null
  onSelect: (chatId: string) => void
  onRetry: () => void
}

export function ChatList({ chats, activeChatId, status, error, onSelect, onRetry }: ChatListProps) {
  if (status === 'loading') {
    return <p className={styles.empty}>Загружаем чаты…</p>
  }

  if (status === 'error') {
    return (
      <div className={styles.error} role="alert">
        {error ?? 'Не удалось загрузить чаты'}
        <button className={styles.retry} type="button" onClick={onRetry}>
          Повторить
        </button>
      </div>
    )
  }

  if (chats.length === 0) {
    return <p className={styles.empty}>Чатов пока нет. Создайте первый кнопкой «+»</p>
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
