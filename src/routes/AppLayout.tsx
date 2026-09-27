import { useCallback, useEffect, useState } from 'react'
import { Outlet, useMatch, useNavigate } from 'react-router-dom'
import { NewChatDialog } from '../components/NewChatDialog'
import { Sidebar } from '../components/Sidebar'
import { useChats } from '../hooks/useChats'
import styles from './AppLayout.module.css'

export function AppLayout() {
  const navigate = useNavigate()
  const match = useMatch('/chat/:chatId')
  const activeChatId = match?.params.chatId ?? null
  const { chats, status, error, pollError, isCreating, createChatByPhone, setActive, reload } =
    useChats()
  const [isDialogOpen, setDialogOpen] = useState(false)

  useEffect(() => {
    setActive(activeChatId)
  }, [activeChatId, setActive])

  // Идентификатор чата — это JID вроде `79526670710-1611399404@g.us`.
  // Символ `@` в сегменте пути допустим, поэтому кодировать его нельзя:
  // react-router не декодирует параметр, и `encodeURIComponent` превратил бы
  // идентификатор в `...%40g.us`, по которому чат больше не находится.
  const openChat = useCallback((chatId: string) => navigate(`/chat/${chatId}`), [navigate])

  const handleSelectChat = useCallback((chatId: string) => openChat(chatId), [openChat])

  const handleAddChat = useCallback(() => setDialogOpen(true), [])

  const handleCreate = useCallback(
    async (phone: string) => {
      const result = await createChatByPhone(phone)
      if (!result.ok || !result.chatId) return result

      setDialogOpen(false)
      openChat(result.chatId)
      return result
    },
    [createChatByPhone, openChat],
  )

  return (
    <div className={styles.layout}>
      <Sidebar
        chats={chats}
        activeChatId={activeChatId ?? undefined}
        status={status}
        error={error}
        pollError={pollError}
        onSelectChat={handleSelectChat}
        onAddChat={handleAddChat}
        onRetry={reload}
      />
      <Outlet />

      {isDialogOpen && (
        <NewChatDialog
          isSubmitting={isCreating}
          onSubmit={handleCreate}
          onClose={() => setDialogOpen(false)}
        />
      )}
    </div>
  )
}

export default AppLayout
