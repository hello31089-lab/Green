import { useState } from 'react'
import styles from './Loader.module.css'

const LOADER_URL = import.meta.env.VITE_LOADER_URL

export interface LoaderProps {
  label: string
}

/** Показывает гифку из `VITE_LOADER_URL`, а без неё — обычный текст. */
export function Loader({ label }: LoaderProps) {
  const [failed, setFailed] = useState(false)

  if (!LOADER_URL || failed) return <p className={styles.text}>{label}</p>

  return (
    <img className={styles.image} src={LOADER_URL} alt={label} onError={() => setFailed(true)} />
  )
}

export default Loader
