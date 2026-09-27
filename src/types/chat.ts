export interface ChatMessage {
  id: string
  chatId: string
  authorId: string
  text: string
  timestamp: string
  direction: 'in' | 'out'
  status: 'sending' | 'sent' | 'read'
}

export interface Chat {
  id: string
  name: string
  avatarUrl?: string
  lastMessage: string
  lastMessageAt: string
  unreadCount: number
}

export interface ChatUser {
  id: string
  name: string
  avatarUrl?: string
}

export interface ChatState {
  chats: Chat[]
  messages: Record<string, ChatMessage[]>
}
