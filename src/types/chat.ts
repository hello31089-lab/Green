export type MessageVariant = 'text' | 'code'

export interface ChatMessage {
  id: string
  chatId: string
  authorId: string
  text: string
  timestamp: string
  direction: 'in' | 'out'
  status: 'sending' | 'sent' | 'read'
  variant?: MessageVariant
  note?: string
  code?: string
}

export type ChatAvatar = 'logo' | 'lock' | 'letter'

export interface Chat {
  id: string
  name: string
  avatarUrl?: string
  avatar?: ChatAvatar
  verified?: boolean
  subtitle?: string
  lastMessage: string
  lastMessageAt: string
  unreadCount: number
}

export interface ChatState {
  chats: Chat[]
  messages: Record<string, ChatMessage[]>
}
