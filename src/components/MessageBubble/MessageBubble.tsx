import type { ChatMessage } from '../../types/chat'
import styles from './MessageBubble.module.css'

export interface MessageBubbleProps {
  message: ChatMessage
  onCopyCode?: (code: string) => void
}

function LockGlyph() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17 9V7a5 5 0 0 0-10 0v2H5v12h14V9h-2Zm-8-2a3 3 0 1 1 6 0v2H9V7Zm3 6a1.6 1.6 0 0 1 1 2.8V17h-2v-1.2A1.6 1.6 0 0 1 12 13Z" />
    </svg>
  )
}

function CopyIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <rect x="9" y="9" width="11" height="11" rx="2" />
      <path d="M15 5H6a2 2 0 0 0-2 2v9" strokeLinecap="round" />
    </svg>
  )
}

function CodeCard({ message, onCopyCode }: MessageBubbleProps) {
  return (
    <div className={styles.card}>
      <div className={styles.cardCover}>
        <span className={styles.cardIcon}>
          <LockGlyph />
        </span>
      </div>
      <div className={styles.cardBody}>
        <p className={styles.cardBrand}>MAX</p>
        <p className={styles.cardTitle}>{message.text}</p>
        {message.note && <p className={styles.cardNote}>{message.note}</p>}
        {message.code && <p className={styles.cardCode}>Код: {message.code}</p>}
        <div className={styles.cardFoot}>
          <span className={styles.time}>{message.timestamp}</span>
        </div>
        {message.code && (
          <button className={styles.copy} type="button" onClick={() => onCopyCode?.(message.code!)}>
            <CopyIcon />
            Скопировать код
          </button>
        )}
      </div>
    </div>
  )
}

export function MessageBubble({ message, onCopyCode }: MessageBubbleProps) {
  const isOutgoing = message.direction === 'out'
  const classes = [styles.bubble, isOutgoing ? styles.outgoing : styles.incoming]
    .filter(Boolean)
    .join(' ')

  if (message.variant === 'code') {
    return (
      <div className={classes}>
        <CodeCard message={message} onCopyCode={onCopyCode} />
      </div>
    )
  }

  return (
    <div className={classes}>
      <p className={styles.text}>{message.text}</p>
      <span className={styles.time}>{message.timestamp}</span>
    </div>
  )
}

export default MessageBubble
