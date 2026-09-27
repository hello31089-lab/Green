import { useMemo, useState } from 'react'
import type { Chat } from '../../types/chat'
import { ButtonItem } from '../ButtonItem'
import { ChatList } from '../ChatList'
import { SearchBar } from '../SearchBar'
import { Title } from '../Title'
import { useTheme } from '../../hooks/useTheme'
import styles from './Sidebar.module.css'

export interface SidebarProps {
  chats: Chat[]
  activeChatId?: string
  onSelectChat: (chatId: string) => void
  onAddChat?: () => void
}

export function Sidebar({ chats, activeChatId, onSelectChat, onAddChat }: SidebarProps) {
  const [query, setQuery] = useState('')
  const { theme, toggleTheme } = useTheme()

  const filteredChats = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    if (!normalized) return chats
    return chats.filter((chat) => chat.name.toLowerCase().includes(normalized))
  }, [chats, query])

  const isDark = theme === 'dark'

  return (
    <aside className={styles.sidebar}>
      <header className={styles.header}>
        <Title />
        <ButtonItem
          icon={isDark ? '☀' : '☾'}
          label={isDark ? 'Светлая тема' : 'Тёмная тема'}
          shape="circle"
          size="sm"
          onClick={toggleTheme}
        />
        <ButtonItem icon="+" label="Добавить чат" shape="rounded" size="sm" onClick={onAddChat} />
      </header>
      <SearchBar value={query} onChange={setQuery} placeholder="Найти чат" />
      <ChatList chats={filteredChats} activeChatId={activeChatId} onSelect={onSelectChat} />
    </aside>
  )
}

export default Sidebar
