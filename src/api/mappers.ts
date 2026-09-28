import type { Chat, ChatMessage, ChatMessageStatus, ChatType } from '../types/chat'
import type {
  CheckAccountResponse,
  GreenApiChat,
  GreenApiHistoryMessage,
  GreenApiNotification,
} from '../types/greenApi'

const CHAT_TYPES: readonly string[] = ['user', 'group', 'channel', 'bot']

const TYPE_LABELS: Record<ChatType, string> = {
  user: 'Личный чат',
  group: 'Группа',
  channel: 'Канал',
  bot: 'Бот',
}

/** Типы сообщений, которые мы показываем. ТЗ ограничено текстом. */
const TEXT_TYPES: readonly string[] = ['textMessage', 'extendedTextMessage']

export function toChatType(value: string | undefined): ChatType {
  return CHAT_TYPES.includes(value ?? '') ? (value as ChatType) : 'user'
}

export function typeLabel(type: ChatType): string {
  return TYPE_LABELS[type]
}

/**
 * Приводит идентификатор к строке. В MAX и WhatsApp он приходит JID-строкой,
 * но в части ответов это число, и вызов строкового метода на числе упал бы.
 * Ноль отбрасывается: в API он означает «значения нет», как в `phoneNumber`.
 */
function readId(value: string | number | undefined): string {
  if (typeof value === 'string') return value.trim()
  if (typeof value === 'number' && Number.isFinite(value) && value !== 0) return String(value)
  return ''
}

function readPhone(value: number | string | undefined): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value) && value > 0) return value
  if (typeof value === 'string') {
    const digits = value.replace(/\D/g, '')
    if (digits.length === 11 || digits.length === 12) return Number(digits)
  }
  return undefined
}

/**
 * Достаёт номер из идентификатора чата. У личного чата JID выглядит как
 * `79991234567@c.us`, а у группы локальная часть — это
 * `79526670710-1611399404`, где номер создателя группы, а не номер чата.
 * Поэтому номер берётся только из 11–12 цифр подряд.
 */
export function phoneFromJid(jid: string | undefined): number | undefined {
  if (!jid) return undefined
  const local = jid.split('@')[0] ?? ''
  return /^\d{11,12}$/.test(local) ? Number(local) : undefined
}

function unreadOf(value: number | undefined): number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0 ? Math.floor(value) : 0
}

/**
 * Приводит чат из `GetChats` к модели приложения. Возвращает `null`, если
 * в ответе нет идентификатора: такой чат нельзя ни открыть, ни отправить в
 * него сообщение, поэтому он просто отбрасывается.
 */
export function mapChat(source: GreenApiChat): Chat | null {
  // В MAX идентификатор лежит в поле `id`, в других ответах — в `chatId`.
  const id = readId(source.id ?? source.chatId)
  if (!id) return null

  const phoneNumber = readPhone(source.phoneNumber) ?? phoneFromJid(id)

  return {
    id,
    name: source.name?.trim() || formatPhone(phoneNumber) || 'Чат',
    type: toChatType(source.type),
    phoneNumber,
    // В ответе `GetChats` счётчик непрочитанных есть, в отличие от
    // `GetChatHistory`, поэтому доверяем значению от API.
    unreadCount: unreadOf(source.unreadCount),
  }
}

/** Достаёт текст сообщения независимо от того, обычное оно или с превью ссылки. */
function textOf(source: GreenApiHistoryMessage): string {
  if (source.textMessage) return source.textMessage
  if (source.extendedTextMessage?.text) return source.extendedTextMessage.text
  return source.caption ?? ''
}

export function isTextMessage(source: GreenApiHistoryMessage): boolean {
  if (source.typeMessage) return TEXT_TYPES.includes(source.typeMessage)
  // У поля typeMessage нет значения — доверяем наличию текста.
  return Boolean(textOf(source))
}

function statusOf(source: GreenApiHistoryMessage): ChatMessageStatus {
  if (source.statusMessage === 'read') return 'read'
  if (source.statusMessage === 'delivered') return 'delivered'
  return 'sent'
}

/**
 * `GetChatHistory` сортирует по убыванию времени и отдаёт все типы
 * сообщений, поэтому нетекстовые отбрасываются, а порядок разворачивается
 * в хронологический.
 */
export function mapHistory(source: GreenApiHistoryMessage[], chatId: string): ChatMessage[] {
  return source
    .filter(isTextMessage)
    .map((message) => mapHistoryMessage(message, chatId))
    .filter((message): message is ChatMessage => message !== null)
    .sort((a, b) => a.timestamp - b.timestamp)
}

function mapHistoryMessage(source: GreenApiHistoryMessage, chatId: string): ChatMessage | null {
  const id = source.idMessage
  const text = textOf(source)
  if (!id || !text) return null

  return {
    id,
    chatId,
    authorId: source.senderId ?? '',
    authorName: source.senderContactName || source.senderName || undefined,
    text,
    timestamp: source.timestamp ?? 0,
    direction: source.type === 'outgoing' ? 'out' : 'in',
    status: source.type === 'outgoing' ? statusOf(source) : 'read',
  }
}

export interface IncomingText {
  message: ChatMessage
  chat: Chat
}

/**
 * Разбирает входящее уведомление. Возвращает `null`, если это не входящее
 * текстовое сообщение: остальные типы (`stateInstanceChanged`,
 * `outgoingMessageStatus`, медиа и прочее) приложению не нужны, но
 * подтверждать их всё равно обязательно — иначе они вернутся в очередь.
 */
export function mapIncomingNotification(notification: GreenApiNotification): IncomingText | null {
  const body = notification.body
  if (!body || body.typeWebhook !== 'incomingMessageReceived') return null

  const messageData = body.messageData
  if (!messageData || !TEXT_TYPES.includes(messageData.typeMessage ?? '')) return null

  const text = messageData.textMessageData?.textMessage
  // Как и в `GetChats`, идентификатор чата приходит в поле `id`.
  const chatId = readId(body.senderData?.id ?? body.senderData?.chatId)
  const id = body.idMessage
  if (!text || !chatId || !id) return null

  const type = toChatType(body.senderData?.chatType)
  const phoneNumber = readPhone(body.senderData?.senderPhoneNumber) ?? phoneFromJid(chatId)
  const name =
    body.senderData?.senderContactName ||
    body.senderData?.senderName ||
    formatPhone(phoneNumber) ||
    'Чат'

  return {
    message: {
      id,
      chatId,
      authorId: body.senderData?.sender ?? '',
      authorName: body.senderData?.senderContactName || body.senderData?.senderName || undefined,
      text,
      timestamp: body.timestamp ?? 0,
      direction: 'in',
      status: 'read',
    },
    chat: {
      id: chatId,
      name,
      type,
      phoneNumber,
      lastMessage: text,
      lastMessageAt: body.timestamp ?? 0,
      unreadCount: 0,
    },
  }
}

function hasAccount(
  value: CheckAccountResponse,
): value is { exist: true; chatId?: string; id?: string; fromCache?: boolean } {
  return 'exist' in value && value.exist === true
}

function isRejected(value: CheckAccountResponse): value is { status: false; reason: string } {
  return 'status' in value && value.status === false
}

/** Приводит ответ `CheckAccount` к единому виду: нашли аккаунт или нет. */
export function readCheckAccount(
  response: CheckAccountResponse | null,
): { exists: true; chatId: string } | { exists: false; reason: string } {
  if (!response) return { exists: false, reason: 'Пустой ответ от GREEN-API' }

  if (isRejected(response)) {
    return { exists: false, reason: response.reason || 'Номер не найден' }
  }

  // Идентификатор приходит либо как `chatId`, либо как `id`: в MAX это JID
  // вида `79526670710-1611399404@g.us`, а в Telegram — число, поэтому читаем
  // оба поля.
  const chatId = hasAccount(response) ? readId(response.chatId ?? response.id) : ''
  if (chatId) return { exists: true, chatId }

  return { exists: false, reason: 'На этом номере нет аккаунта' }
}

export function formatPhone(phone: number | string | undefined): string {
  if (!phone) return ''
  const digits = String(phone).replace(/\D/g, '')
  if (digits.length !== 11 && digits.length !== 12) return digits

  // Россия: +7 999 123-45-67. Беларусь: +375 29 123-45-67.
  return digits.length === 11
    ? `+${digits[0]} ${digits.slice(1, 4)} ${digits.slice(4, 7)}-${digits.slice(7, 9)}-${digits.slice(9)}`
    : `+${digits.slice(0, 3)} ${digits.slice(3, 5)} ${digits.slice(5, 8)}-${digits.slice(8, 10)}-${digits.slice(10)}`
}

export interface PhoneCheck {
  digits: string
  error?: string
}

/**
 * Приводит введённый номер к виду, который принимает GREEN-API:
 * 11 или 12 цифр, префикс `7` (РФ) или `375` (РБ). Ведущая восьмёрка
 * заменяется на семёрку — так номер вводят чаще всего.
 */
export function normalizePhone(input: string): PhoneCheck {
  let digits = input.replace(/\D/g, '')

  if (digits.length === 11 && digits.startsWith('8')) {
    digits = `7${digits.slice(1)}`
  }

  if (digits.length !== 11 && digits.length !== 12) {
    return { digits, error: 'Номер должен содержать 11 или 12 цифр' }
  }

  const prefix = digits.length === 12 ? '375' : '7'
  if (!digits.startsWith(prefix)) {
    return { digits, error: 'Поддерживаются только номера России (7) и Беларуси (375)' }
  }

  return { digits }
}
