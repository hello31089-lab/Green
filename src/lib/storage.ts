import type { ChatState } from '../types/chat'
import { mockChatState } from '../mock/chats'

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
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return structuredClone(mockChatState)
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
  try {
    const payload: StoredChatState = { version: VERSION, state }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
    return true
  } catch {
    return false
  }
}
