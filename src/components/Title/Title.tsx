import styles from './Title.module.css'

export interface TitleProps {
  text?: string
}

export function Title({ text = 'Чаты' }: TitleProps) {
  return <h1 className={styles.title}>{text}</h1>
}

export default Title
