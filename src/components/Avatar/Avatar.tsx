import styles from './Avatar.module.css'

export interface AvatarProps {
  name: string
  size?: 'md' | 'sm'
  className?: string
}

export function Avatar({ name, size = 'md', className }: AvatarProps) {
  const classes = [styles.avatar, styles[size], className].filter(Boolean).join(' ')
  const letter = name.trim().charAt(0).toUpperCase() || '?'

  return (
    <span className={classes}>
      <span className={styles.letter}>{letter}</span>
    </span>
  )
}

export default Avatar
