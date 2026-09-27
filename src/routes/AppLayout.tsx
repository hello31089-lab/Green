import { useCallback } from 'react'
import { Outlet, useMatch, useNavigate } from 'react-router-dom'
import { Sidebar } from '../components/Sidebar'
import { useChats } from '../hooks/useChats'
import styles from './AppLayout.module.css'

export function AppLayout() {
  const navigate = useNavigate()
  const match = useMatch('/chat/:chatId')
  const activeChatId = match?.params.chatId
  const { chats, addChat } = useChats()

  const handleSelectChat = useCallback((chatId: string) => navigate(`/chat/${chatId}`), [navigate])

  const handleAddChat = useCallback(() => {
    const id = addChat(`Чат ${chats.length + 1}`)
    navigate(`/chat/${id}`)
  }, [addChat, chats.length, navigate])

  return (
    <div className={styles.layout}>
      <Sidebar
        chats={chats}
        activeChatId={activeChatId}
        onSelectChat={handleSelectChat}
        onAddChat={handleAddChat}
      />
      <Outlet />
    </div>
  )
}

export default AppLayout
