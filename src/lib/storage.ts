import type { ChatState } from '../types/chat'
import { mockChatState } from '../mock/chats'

const STORAGE_KEY = 'chats'

function isChatState(value: unknown): value is ChatState {
  if (typeof value !== 'object' || value === null) return false
  const state = value as Partial<ChatState>
  return Array.isArray(state.chats) && typeof state.messages === 'object' && state.messages !== null
}

export function loadChatState(): ChatState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return structuredClone(mockChatState)
    const parsed: unknown = JSON.parse(raw)
    return isChatState(parsed) ? parsed : structuredClone(mockChatState)
  } catch {
    return structuredClone(mockChatState)
  }
}

export function saveChatState(state: ChatState): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    return true
  } catch {
    return false
  }
}

export function clearChatState(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    return
  }
}
