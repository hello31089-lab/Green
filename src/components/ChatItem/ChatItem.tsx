import type { Chat } from '../../types/chat'
import { Avatar } from '../Avatar'
import { VerifiedBadge } from '../VerifiedBadge'
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

  return (
    <button
      type="button"
      className={classes}
      onClick={handleClick}
      aria-current={isActive ? 'true' : undefined}
    >
      <Avatar name={chat.name} kind={chat.avatar} src={chat.avatarUrl} />

      <span className={styles.body}>
        <span className={styles.nameRow}>
          <span className={styles.name}>{chat.name}</span>
          {chat.verified && <VerifiedBadge />}
        </span>
        <span className={styles.preview}>{chat.lastMessage}</span>
      </span>

      <span className={styles.meta}>
        <span className={styles.time}>{chat.lastMessageAt}</span>
        {chat.unreadCount > 0 && <span className={styles.badge}>{chat.unreadCount}</span>}
      </span>
    </button>
  )
}

export default ChatItem
