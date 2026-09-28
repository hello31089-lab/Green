import type { Chat } from '../types/chat'
import { readItem, writeItem } from './safeStorage'

const CHATS_KEY = 'green-api-chats'
const CONTACTS_KEY = 'green-api-contacts'
const VERSION = 3

/**
 * `GetChats` не отдаёт текст последнего сообщения, поэтому превью берётся
 * только из локального кэша и обновить его нечем. А сообщения могли удалить
 * на телефоне — через сутки превью считаем устаревшим и убираем.
 */
const PREVIEW_TTL_MS = 24 * 60 * 60 * 1000

interface StoredChats {
  version: number
  chats: Chat[]
}

/**
 * `GetChats` не отдаёт ни последнего сообщения, ни счётчика непрочитанных,
 * поэтому список чатов храним локально и дополняем ответом API. Сообщения
 * не сохраняем: их источник истины — `GetChatHistory`.
 */

function isChat(value: unknown): value is Chat {
  if (typeof value !== 'object' || value === null) return false
  const chat = value as Partial<Chat>
  return typeof chat.id === 'string' && typeof chat.name === 'string'
}

function parseChats(raw: string | null): Chat[] {
  if (!raw) return []

  try {
    const parsed = JSON.parse(raw) as Partial<StoredChats>
    if (parsed.version !== VERSION || !Array.isArray(parsed.chats)) return []
    return parsed.chats
      .filter(isChat)
      .map((chat) => ({ ...chat, unreadCount: chat.unreadCount ?? 0 }))
      .map(dropStalePreview)
  } catch {
    return []
  }
}

function dropStalePreview(chat: Chat): Chat {
  if (chat.lastMessageAt === undefined) return chat
  if (Date.now() - chat.lastMessageAt * 1000 < PREVIEW_TTL_MS) return chat
  const rest = { ...chat }
  delete rest.lastMessage
  delete rest.lastMessageAt
  return rest
}

export function loadChats(): Chat[] {
  return parseChats(readItem(CHATS_KEY))
}

export function saveChats(chats: Chat[]): boolean {
  const payload: StoredChats = { version: VERSION, chats }
  return writeItem(CHATS_KEY, JSON.stringify(payload))
}

/**
 * Кэш «номер → chatId». `CheckAccount` расходует квоту тарифа (100 проверок
 * в месяц на Developer), а `chatId` между сессиями не меняется, поэтому
 * повторно проверять уже известные номера не нужно.
 */
export function loadContacts(): Record<string, string> {
  const raw = readItem(CONTACTS_KEY)
  if (!raw) return {}

  try {
    const parsed: unknown = JSON.parse(raw)
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) return {}

    const result: Record<string, string> = {}
    for (const [phone, chatId] of Object.entries(parsed)) {
      if (typeof chatId === 'string' && chatId) result[phone] = chatId
    }
    return result
  } catch {
    return {}
  }
}

export function saveContact(phone: string, chatId: string): void {
  writeItem(CONTACTS_KEY, JSON.stringify({ ...loadContacts(), [phone]: chatId }))
}

export function findContact(phone: string): string | null {
  return loadContacts()[phone] ?? null
}
