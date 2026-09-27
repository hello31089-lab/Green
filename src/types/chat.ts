/**
 * Тип чата. `GetChats` отдаёт эти значения в поле `type` одинаково для
 * MAX, WhatsApp и Telegram.
 */
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
 * Чат в приложении. `id` — это идентификатор из GREEN-API, то есть JID
 * вида `79991234567@c.us` или `79526670710-1611399404@g.us`.
 * `unreadCount` приходит из `GetChats`, а `lastMessage` API не отдаёт
 * ни в одном методе, поэтому превью держим локально и восстанавливаем
 * из хранилища, чтобы список не выглядел пустым после перезагрузки.
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
