import { useMemo, useState } from 'react'
import type { Chat } from '../../types/chat'
import { ChatList } from '../ChatList'
import { SearchBar } from '../SearchBar'
import styles from './Sidebar.module.css'

export interface SidebarProps {
  chats: Chat[]
  activeChatId?: string
  onSelectChat: (chatId: string) => void
}

export function Sidebar({ chats, activeChatId, onSelectChat }: SidebarProps) {
  const [query, setQuery] = useState('')

  const filteredChats = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    if (!normalized) return chats
    return chats.filter((chat) => chat.name.toLowerCase().includes(normalized))
  }, [chats, query])

  return (
    <aside className={styles.sidebar}>
      <SearchBar value={query} onChange={setQuery} placeholder="Найти чат" />
      <ChatList chats={filteredChats} activeChatId={activeChatId} onSelect={onSelectChat} />
    </aside>
  )
}

export default Sidebar
