import { formatPhone, typeLabel } from '../../api/mappers'
import type { Chat } from '../../types/chat'
import { formatChatTime } from '../../lib/datetime'
import { Avatar } from '../Avatar'
import styles from './ChatItem.module.css'

export interface ChatItemProps {
  chat: Chat
  isActive?: boolean
  onSelect: (chatId: string) => void
}

export function ChatItem({ chat, isActive = false, onSelect }: ChatItemProps) {
  const handleClick = () => onSelect(chat.id)
  const classes = [
    styles.item,
    isActive ? styles.active : '',
    chat.unreadCount > 0 ? styles.unread : '',
  ]
    .filter(Boolean)
    .join(' ')

  // `GetChats` не отдаёт превью: до первого сообщения показываем номер,
  // а если он скрыт — тип чата.
  const preview = chat.lastMessage || formatPhone(chat.phoneNumber) || typeLabel(chat.type)

  return (
    <button
      type="button"
      className={classes}
      onClick={handleClick}
      aria-current={isActive ? 'true' : undefined}
    >
      <Avatar name={chat.name} />

      <span className={styles.body}>
        <span className={styles.nameRow}>
          <span className={styles.name}>{chat.name}</span>
        </span>
        <span className={styles.preview}>{preview}</span>
      </span>

      <span className={styles.meta}>
        {chat.lastMessageAt !== undefined && (
          <span className={styles.time}>{formatChatTime(new Date(chat.lastMessageAt * 1000))}</span>
        )}
        {chat.unreadCount > 0 && <span className={styles.badge}>{chat.unreadCount}</span>}
      </span>
    </button>
  )
}

export default ChatItem
