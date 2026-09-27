import { useNavigate, useParams } from 'react-router-dom'
import { ChatView } from '../../components/ChatView'
import { useChats } from '../../hooks/useChats'
import styles from './Chat.module.css'

export function Chat() {
  const { chatId = '' } = useParams()
  const navigate = useNavigate()
  const { getChat, getMessages, sendMessage } = useChats()

  const chat = getChat(chatId)

  if (!chat) {
    return (
      <div className={styles.notFound}>
        <p className={styles.notFoundTitle}>Такого чата нет</p>
        <p className={styles.notFoundText}>
          Переписка с адресом <code>{chatId}</code> не найдена
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
      onSend={(text) => sendMessage(chatId, text)}
      onBack={() => navigate('/')}
    />
  )
}

export default Chat
