import type { ChatMessage } from '../../types/chat'
import styles from './MessageBubble.module.css'

export interface MessageBubbleProps {
  message: ChatMessage
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isOutgoing = message.direction === 'out'
  const classes = [styles.bubble, isOutgoing ? styles.outgoing : styles.incoming]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={classes}>
      <p className={styles.text}>{message.text}</p>
      <span className={styles.time}>{message.timestamp}</span>
    </div>
  )
}

export default MessageBubble
