import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { Chat, ChatMessage, ChatState } from '../types/chat'
import { loadChatState, saveChatState } from '../lib/storage'
import { ChatsContext } from './chatsContext'
import type { ChatsContextValue } from './chatsContext'

export interface ChatsProviderProps {
  children: ReactNode
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
}

export function ChatsProvider({ children }: ChatsProviderProps) {
  const [state, setState] = useState<ChatState>(loadChatState)

  useEffect(() => {
    saveChatState(state)
  }, [state])

  const addChat = useCallback((name: string) => {
    const id = crypto.randomUUID()
    const chat: Chat = {
      id,
      name,
      lastMessage: 'Нет сообщений',
      lastMessageAt: formatTime(new Date()),
      unreadCount: 0,
    }
    setState((current) => ({
      chats: [chat, ...current.chats],
      messages: { ...current.messages, [id]: [] },
    }))
    return id
  }, [])

  const sendMessage = useCallback((chatId: string, text: string) => {
    setState((current) => {
      const message: ChatMessage = {
        id: crypto.randomUUID(),
        chatId,
        authorId: 'me',
        text,
        timestamp: formatTime(new Date()),
        direction: 'out',
        status: 'sent',
      }
      return {
        chats: current.chats.map((chat) =>
          chat.id === chatId
            ? { ...chat, lastMessage: text, lastMessageAt: message.timestamp, unreadCount: 0 }
            : chat,
        ),
        messages: {
          ...current.messages,
          [chatId]: [...(current.messages[chatId] ?? []), message],
        },
      }
    })
  }, [])

  const getChat = useCallback(
    (chatId: string) => state.chats.find((chat) => chat.id === chatId),
    [state.chats],
  )

  const getMessages = useCallback(
    (chatId: string) => state.messages[chatId] ?? [],
    [state.messages],
  )

  const value = useMemo<ChatsContextValue>(
    () => ({ chats: state.chats, getChat, getMessages, addChat, sendMessage }),
    [state.chats, getChat, getMessages, addChat, sendMessage],
  )

  return <ChatsContext value={value}>{children}</ChatsContext>
}
