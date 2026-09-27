import type { ButtonHTMLAttributes, ReactNode } from 'react'
import styles from './ButtonItem.module.css'

export type ButtonItemShape = 'rounded' | 'circle'
export type ButtonItemSize = 'sm' | 'md'
export type ButtonItemVariant = 'ghost' | 'primary' | 'surface'

export interface ButtonItemProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  icon: ReactNode
  onClick?: () => void
  label?: string
  shape?: ButtonItemShape
  size?: ButtonItemSize
  variant?: ButtonItemVariant
}

export function ButtonItem({
  icon,
  onClick,
  label,
  shape = 'rounded',
  size = 'md',
  variant = 'ghost',
  className,
  type = 'button',
  ...rest
}: ButtonItemProps) {
  const classes = [styles.item, styles[size], styles[shape], styles[variant], className]
    .filter(Boolean)
    .join(' ')

  return (
    <button
      type={type}
      className={classes}
      onClick={onClick}
      aria-label={label}
      title={label}
      {...rest}
    >
      {icon}
    </button>
  )
}

export default ButtonItem
