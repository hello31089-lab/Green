import type { Chat } from '../../types/chat'
import { Sidebar } from '../../components/Sidebar'

export interface HomeProps {
  chats: Chat[]
  activeChatId?: string
  onSelectChat: (chatId: string) => void
}

export function Home({ chats, activeChatId, onSelectChat }: HomeProps) {
  return (
    <div style={{ display: 'flex', height: '100%' }}>
      <Sidebar chats={chats} activeChatId={activeChatId} onSelectChat={onSelectChat} />
    </div>
  )
}

export default Home
