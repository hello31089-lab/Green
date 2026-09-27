import type { ChangeEvent } from 'react'
import styles from './SearchBar.module.css'

export interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function SearchBar({ value, onChange, placeholder = 'Search' }: SearchBarProps) {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value)
  }

  return (
    <div className={styles.searchBar}>
      <input
        className={styles.input}
        type="search"
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
          aria-label="Clear"
        >
          &times;
        </button>
      )}
    </div>
  )
}

export default SearchBar
