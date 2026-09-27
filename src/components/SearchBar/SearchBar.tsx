import type { ChangeEvent } from 'react'
import styles from './SearchBar.module.css'

export interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

function SearchIcon() {
  return (
    <svg
      className={styles.icon}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.5-3.5" strokeLinecap="round" />
    </svg>
  )
}

export function SearchBar({ value, onChange, placeholder = 'Найти' }: SearchBarProps) {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value)
  }

  return (
    <div className={styles.searchBar}>
      <SearchIcon />
      <input
        className={styles.input}
        type="text"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        aria-label={placeholder}
      />
      {value && (
        <button
          className={styles.clear}
          type="button"
          onClick={() => onChange('')}
          aria-label="Очистить"
        >
          &times;
        </button>
      )}
    </div>
  )
}

export default SearchBar
