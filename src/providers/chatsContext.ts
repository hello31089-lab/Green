import { createContext } from 'react'
import type { Chat, ChatMessage } from '../types/chat'

export type LoadStatus = 'loading' | 'ready' | 'error'

export interface CreateChatResult {
  ok: boolean
  chatId?: string
  error?: string
}

export interface ChatsContextValue {
  chats: Chat[]
  /** Статус загрузки списка чатов. */
  status: LoadStatus
  /** Ошибка загрузки списка, показывается в сайдбаре. */
  error: string | null
  isCreating: boolean
  getChat: (chatId: string) => Chat | undefined
  getMessages: (chatId: string) => ChatMessage[]
  getHistoryStatus: (chatId: string) => LoadStatus
  getHistoryError: (chatId: string) => string | null
  reload: () => void
  /** Сообщает провайдеру, какой чат открыт: сбрасывает счётчик непрочитанных. */
  setActive: (chatId: string | null) => void
  /** Создаёт чат по номеру телефона через `CheckAccount`. */
  createChatByPhone: (input: string) => Promise<CreateChatResult>
  /** Загружает историю и снимает счётчик непрочитанных. */
  openChat: (chatId: string) => void
  sendMessage: (chatId: string, text: string) => Promise<void>
}

export const ChatsContext = createContext<ChatsContextValue | null>(null)
