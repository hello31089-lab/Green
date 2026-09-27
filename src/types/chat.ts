/** Тип чата в MAX. `GetChats` отдаёт эти значения в поле `type`. */
export type ChatType = 'user' | 'group' | 'channel' | 'bot'

export type MessageStatus = 'sending' | 'sent' | 'read'

/**
 * Состояния сообщения в интерфейсе. GREEN-API отдаёт `statusMessage`
 * со значениями `sent` / `delivered` / `read` — `delivered` для нас
 * неотличим от `sent`, отдельного значка доставки в макете нет.
 */
export type ChatMessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed'

export interface ChatMessage {
  id: string
  chatId: string
  authorId: string
  authorName?: string
  text: string
  /** UNIX-время в секундах. Форматируется только при отрисовке. */
  timestamp: number
  direction: 'in' | 'out'
  status: ChatMessageStatus
  /** Добавлено оптимистично и ещё не подтверждено `SendMessage`. */
  pending?: boolean
}

/**
 * Чат в приложении. `id` — это `chatId` из GREEN-API.
 * `lastMessage` и `unreadCount` API не отдаёт: держим их локально
 * и восстанавливаем из хранилища, чтобы список не выглядел пустым
 * после перезагрузки страницы.
 */
export interface Chat {
  id: string
  name: string
  type: ChatType
  /** `0` у групп и скрытых номеров — в модели это `undefined`. */
  phoneNumber?: number
  lastMessage?: string
  /** UNIX-время в секундах. */
  lastMessageAt?: number
  unreadCount: number
}
