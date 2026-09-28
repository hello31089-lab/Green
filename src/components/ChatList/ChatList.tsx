import type { Chat } from '../../types/chat'
import type { LoadStatus } from '../../providers/chatsContext'
import { ChatItem } from '../ChatItem'
import { Loader } from '../Loader'
import styles from './ChatList.module.css'

export interface ChatListProps {
  chats: Chat[]
  activeChatId?: string
  status: LoadStatus
  error: string | null
  /** Причина, по которой входящие сообщения не приходят. */
  pollError: string | null
  onSelect: (chatId: string) => void
  onRetry: () => void
}

export function ChatList({
  chats,
  activeChatId,
  status,
  error,
  pollError,
  onSelect,
  onRetry,
}: ChatListProps) {
  const notice = pollError ? (
    <p className={styles.notice} role="status">
      {pollError}
    </p>
  ) : null

  if (status === 'loading') {
    return (
      <>
        {notice}
        <Loader label="Загружаем чаты…" />
      </>
    )
  }

  if (status === 'error') {
    return (
      <>
        {notice}
        <div className={styles.error} role="alert">
          {error ?? 'Не удалось загрузить чаты'}
          <button className={styles.retry} type="button" onClick={onRetry}>
            Повторить
          </button>
        </div>
      </>
    )
  }

  if (chats.length === 0) {
    return (
      <>
        {notice}
        <p className={styles.empty}>Чатов пока нет. Создайте первый кнопкой «+»</p>
      </>
    )
  }

  return (
    <div className={styles.list}>
      {notice}
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
