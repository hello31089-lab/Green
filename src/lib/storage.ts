import type { ChatState } from '../types/chat'
import { mockChatState } from '../mock/chats'
import { readItem, writeItem } from './safeStorage'

const STORAGE_KEY = 'chats'
const VERSION = 2

interface StoredChatState {
  version: number
  state: ChatState
}

function isChatState(value: unknown): value is ChatState {
  if (typeof value !== 'object' || value === null) return false
  const state = value as Partial<ChatState>
  return Array.isArray(state.chats) && typeof state.messages === 'object' && state.messages !== null
}

export function loadChatState(): ChatState {
  const raw = readItem(STORAGE_KEY)
  if (!raw) return structuredClone(mockChatState)

  try {
    const parsed = JSON.parse(raw) as Partial<StoredChatState>
    if (parsed.version !== VERSION || !isChatState(parsed.state)) {
      return structuredClone(mockChatState)
    }
    return parsed.state
  } catch {
    return structuredClone(mockChatState)
  }
}

export function saveChatState(state: ChatState): boolean {
  const payload: StoredChatState = { version: VERSION, state }
  return writeItem(STORAGE_KEY, JSON.stringify(payload))
}
