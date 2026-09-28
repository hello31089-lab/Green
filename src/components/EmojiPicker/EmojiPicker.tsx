import { useEffect, useRef } from 'react'
import styles from './EmojiPicker.module.css'

const EMOJIS = [
  '😀',
  '😃',
  '😄',
  '😁',
  '😆',
  '😅',
  '🤣',
  '😂',
  '🙂',
  '🙃',
  '😉',
  '😊',
  '😇',
  '🥰',
  '😍',
  '🤩',
  '😘',
  '😗',
  '😋',
  '😜',
  '🤪',
  '😝',
  '🤑',
  '🤗',
  '🤔',
  '🤨',
  '😐',
  '😴',
  '😢',
  '😭',
  '😤',
  '😡',
]

export interface EmojiPickerProps {
  onPick: (emoji: string) => void
  onClose: () => void
}

export function EmojiPicker({ onPick, onClose }: EmojiPickerProps) {
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (!panelRef.current?.contains(event.target as Node)) onClose()
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose])

  return (
    <div className={styles.panel} ref={panelRef} role="dialog" aria-label="Эмодзи">
      {EMOJIS.map((emoji) => (
        <button
          key={emoji}
          className={styles.item}
          type="button"
          aria-label={emoji}
          onClick={() => onPick(emoji)}
        >
          {emoji}
        </button>
      ))}
    </div>
  )
}

export default EmojiPicker
