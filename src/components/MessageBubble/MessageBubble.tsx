import { formatTime } from '../../lib/datetime'
import type { ChatMessage } from '../../types/chat'
import styles from './MessageBubble.module.css'

export interface MessageBubbleProps {
  message: ChatMessage
}

const STATUS_GLYPHS: Partial<Record<ChatMessage['status'], string>> = {
  sending: '🕐',
  sent: '✓',
  delivered: '✓✓',
  read: '✓✓',
  failed: '⚠',
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isOutgoing = message.direction === 'out'
  const classes = [
    styles.bubble,
    isOutgoing ? styles.outgoing : styles.incoming,
    message.status === 'failed' ? styles.failed : '',
  ]
    .filter(Boolean)
    .join(' ')

  const glyph = STATUS_GLYPHS[message.status]

  return (
    <div className={classes}>
      <p className={styles.text}>{message.text}</p>
      <span className={styles.time}>
        {message.timestamp > 0 ? formatTime(new Date(message.timestamp * 1000)) : ''}
        {glyph && (
          <span className={styles.status} title={STATUS_TITLES[message.status]}>
            {glyph}
          </span>
        )}
      </span>
    </div>
  )
}

const STATUS_TITLES: Record<ChatMessage['status'], string> = {
  sending: 'Отправляется',
  sent: 'Отправлено',
  delivered: 'Доставлено',
  read: 'Прочитано',
  failed: 'Не отправлено',
}

export default MessageBubble
