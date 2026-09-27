import { createContext } from 'react'
import type { Chat, ChatMessage } from '../types/chat'

export interface ChatsContextValue {
  chats: Chat[]
  getChat: (chatId: string) => Chat | undefined
  getMessages: (chatId: string) => ChatMessage[]
  addChat: (name: string) => string
  sendMessage: (chatId: string, text: string) => void
}

export const ChatsContext = createContext<ChatsContextValue | null>(null)
