import type { ChatAvatar } from '../../types/chat'
import styles from './Avatar.module.css'

export interface AvatarProps {
  name: string
  kind?: ChatAvatar
  src?: string
  size?: 'md' | 'sm'
  className?: string
}

function LockGlyph() {
  return (
    <svg className={styles.glyph} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17 9V7a5 5 0 0 0-10 0v2H5v12h14V9h-2Zm-8-2a3 3 0 1 1 6 0v2H9V7Zm3 6a1.6 1.6 0 0 1 1 2.8V17h-2v-1.2A1.6 1.6 0 0 1 12 13Z" />
    </svg>
  )
}

export function Avatar({ name, kind = 'letter', src, size = 'md', className }: AvatarProps) {
  const classes = [styles.avatar, styles[size], className].filter(Boolean).join(' ')

  return (
    <span className={classes}>
      {src ? (
        <img className={styles.image} src={src} alt="" />
      ) : kind === 'logo' ? (
        <span className={styles.logo}>M</span>
      ) : kind === 'lock' ? (
        <LockGlyph />
      ) : (
        <span className={styles.letter}>{name.charAt(0).toUpperCase()}</span>
      )}
    </span>
  )
}

export default Avatar
