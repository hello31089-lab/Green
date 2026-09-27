import { useNavigate, useParams } from 'react-router-dom'
import { ChatView } from '../../components/ChatView'
import { Sidebar } from '../../components/Sidebar'
import { useChats } from '../../hooks/useChats'
import styles from './Chat.module.css'

export function Chat() {
  const { chatId = '' } = useParams()
  const navigate = useNavigate()
  const { chats, getChat, getMessages, addChat, sendMessage } = useChats()

  const handleAddChat = () => {
    const id = addChat(`Чат ${chats.length + 1}`)
    navigate(`/chat/${id}`)
  }

  if (!getChat(chatId)) {
    return (
      <div className={styles.page}>
        <Sidebar
          chats={chats}
          onSelectChat={(id) => navigate(`/chat/${id}`)}
          onAddChat={handleAddChat}
        />
        <div className={styles.notFound}>
          <p className={styles.notFoundTitle}>Такого чата нет</p>
          <p className={styles.notFoundText}>
            Чат с адресом <code>{chatId}</code> не найден в localStorage
          </p>
          <button className={styles.backLink} type="button" onClick={() => navigate('/')}>
            ← Вернуться к чатам
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <Sidebar
        chats={chats}
        activeChatId={chatId}
        onSelectChat={(id) => navigate(`/chat/${id}`)}
        onAddChat={handleAddChat}
      />
      <ChatView
        chat={getChat(chatId)}
        messages={getMessages(chatId)}
        onSend={(text) => sendMessage(chatId, text)}
        onBack={() => navigate('/')}
      />
    </div>
  )
}

export default Chat
