import styles from './VerifiedBadge.module.css'

export interface VerifiedBadgeProps {
  size?: 'sm' | 'md'
}

export function VerifiedBadge({ size = 'sm' }: VerifiedBadgeProps) {
  return (
    <span
      className={`${styles.badge} ${styles[size]}`}
      title="Верифицирован"
      aria-label="Верифицирован"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true">
        <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  )
}

export default VerifiedBadge
