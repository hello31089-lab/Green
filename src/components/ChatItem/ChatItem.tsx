import type { Chat } from '../../types/chat'
import styles from './ChatItem.module.css'

export interface ChatItemProps {
  chat: Chat
  isActive?: boolean
  onSelect: (chatId: string) => void
}

export function ChatItem({ chat, isActive = false, onSelect }: ChatItemProps) {
  const handleClick = () => onSelect(chat.id)

  return (
    <button
      type="button"
      className={`${styles.item} ${isActive ? styles.active : ''}`}
      onClick={handleClick}
      aria-current={isActive}
    >
      <span className={styles.avatar}>
        {chat.avatarUrl ? <img src={chat.avatarUrl} alt="" /> : chat.name.charAt(0)}
      </span>
      <span className={styles.body}>
        <span className={styles.name}>{chat.name}</span>
        <span className={styles.lastMessage}>{chat.lastMessage}</span>
      </span>
      <span className={styles.meta}>
        <span className={styles.time}>{chat.lastMessageAt}</span>
        {chat.unreadCount > 0 && <span className={styles.badge}>{chat.unreadCount}</span>}
      </span>
    </button>
  )
}

export default ChatItem
