import { useNavigate } from 'react-router-dom'
import { Sidebar } from '../../components/Sidebar'
import { useChats } from '../../hooks/useChats'
import styles from './Home.module.css'

export function Home() {
  const navigate = useNavigate()
  const { chats, addChat } = useChats()

  const handleAddChat = () => {
    const id = addChat(`Чат ${chats.length + 1}`)
    navigate(`/chat/${id}`)
  }

  return (
    <div className={styles.page}>
      <Sidebar
        chats={chats}
        onSelectChat={(id) => navigate(`/chat/${id}`)}
        onAddChat={handleAddChat}
      />
      <div className={styles.placeholder}>
        <p>Выберите чат, чтобы открыть переписку</p>
        <p className={styles.hint}>или создайте новый кнопкой «+»</p>
      </div>
    </div>
  )
}

export default Home
