import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ChatView } from '../../components/ChatView'
import { useChats } from '../../hooks/useChats'
import styles from './Chat.module.css'

export function Chat() {
  const { chatId = '' } = useParams()
  const navigate = useNavigate()
  const { status, getChat, getMessages, getHistoryStatus, getHistoryError, openChat, sendMessage } =
    useChats()

  const chat = getChat(chatId)
  const historyStatus = getHistoryStatus(chatId)
  const historyError = getHistoryError(chatId)
  const isListLoading = status === 'loading'

  useEffect(() => {
    openChat(chatId)
  }, [chatId, openChat])

  if (!chat) {
    if (isListLoading) {
      return <p className={styles.notFoundText}>Загружаем переписку…</p>
    }

    return (
      <div className={styles.notFound}>
        <p className={styles.notFoundTitle}>Такого чата нет</p>
        <p className={styles.notFoundText}>
          Переписка с идентификатором <code>{chatId}</code> не найдена. Откройте чат из списка или
          создайте новый.
        </p>
        <button className={styles.backLink} type="button" onClick={() => navigate('/')}>
          ← Вернуться к чатам
        </button>
      </div>
    )
  }

  return (
    <ChatView
      chat={chat}
      messages={getMessages(chatId)}
      historyStatus={historyStatus}
      historyError={historyError}
      onSend={(text) => void sendMessage(chatId, text)}
      onBack={() => navigate('/')}
    />
  )
}

export default Chat
