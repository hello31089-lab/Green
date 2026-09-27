import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import type { Chat, ChatMessage } from '../types/chat'
import {
  GreenApiError,
  checkAccount,
  deleteNotification,
  getChatHistory,
  getChats,
  receiveNotification,
  sendMessage as sendMessageRequest,
} from '../api/greenApi'
import {
  formatPhone,
  mapChat,
  mapHistory,
  mapIncomingNotification,
  normalizePhone,
  readCheckAccount,
} from '../api/mappers'
import { createId } from '../lib/id'
import { findContact, loadChats, saveChats, saveContact } from '../lib/storage'
import { useCredentials } from '../hooks/useCredentials'
import { ChatsContext } from './chatsContext'
import type { ChatsContextValue, CreateChatResult, LoadStatus } from './chatsContext'

export interface ChatsProviderProps {
  children: ReactNode
}

interface HistoryState {
  status: LoadStatus
  error: string | null
}

/** Пауза между опросами очереди, чтобы не упираться в лимит частоты запросов. */
const POLL_PAUSE_MS = 500
const HISTORY_LIMIT = 100

function describeError(thrown: unknown, fallback: string): string {
  if (thrown instanceof GreenApiError) return thrown.message || fallback
  if (thrown instanceof Error && thrown.message) return thrown.message
  return fallback
}

/** Наложение патча без затирания полей, которых в патче нет. */
function mergeDefined(base: Chat, patch: Partial<Chat>): Chat {
  const merged: Chat = { ...base }
  if (patch.name !== undefined) merged.name = patch.name
  if (patch.type !== undefined) merged.type = patch.type
  if (patch.phoneNumber !== undefined) merged.phoneNumber = patch.phoneNumber
  if (patch.lastMessage !== undefined) merged.lastMessage = patch.lastMessage
  if (patch.lastMessageAt !== undefined) merged.lastMessageAt = patch.lastMessageAt
  if (patch.unreadCount !== undefined) merged.unreadCount = patch.unreadCount
  return merged
}

/**
 * Ответ `GetChats` содержит только `chatId`, `name`, `type` и `phoneNumber`,
 * поэтому локальные чаты (созданные по номеру) добавляются в список, а для
 * известных чатов сохраняются превью и счётчик непрочитанных.
 */
function mergeChats(remote: Chat[], local: Chat[]): Chat[] {
  const localById = new Map(local.map((chat) => [chat.id, chat]))
  const merged: Chat[] = []

  for (const chat of remote) {
    const saved = localById.get(chat.id)
    localById.delete(chat.id)
    merged.push(saved ? mergeDefined(saved, chat) : chat)
  }

  for (const orphan of localById.values()) {
    merged.push(orphan)
  }

  return merged.sort((a, b) => (b.lastMessageAt ?? 0) - (a.lastMessageAt ?? 0))
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function ChatsProvider({ children }: ChatsProviderProps) {
  const { credentials } = useCredentials()
  const [chats, setChats] = useState<Chat[]>(() => loadChats())
  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>({})
  const [history, setHistory] = useState<Record<string, HistoryState>>({})
  const [status, setStatus] = useState<LoadStatus>('loading')
  const [error, setError] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [reloadToken, setReloadToken] = useState(0)

  const loadedChats = useRef<Set<string>>(new Set())
  const activeChatId = useRef<string | null>(null)
  const chatsRef = useRef<Chat[]>(chats)

  useEffect(() => {
    chatsRef.current = chats
  }, [chats])

  useEffect(() => {
    saveChats(chats)
  }, [chats])

  useEffect(() => {
    if (!credentials) return

    const controller = new AbortController()
    const { signal } = controller

    setStatus('loading')
    void (async () => {
      try {
        const remote = await getChats(credentials, signal)
        if (signal.aborted) return
        setChats((current) => mergeChats((remote ?? []).map(mapChat), current))
        setStatus('ready')
        setError(null)
      } catch (thrown) {
        if (signal.aborted) return
        setStatus('error')
        setError(describeError(thrown, 'Не удалось загрузить список чатов'))
      }
    })()

    return () => controller.abort()
  }, [credentials, reloadToken])

  const reload = useCallback(() => setReloadToken((token) => token + 1), [])

  const upsertChat = useCallback((patch: Partial<Chat> & { id: string }) => {
    setChats((current) => {
      const existing = current.find((chat) => chat.id === patch.id)
      if (!existing) {
        return [{ unreadCount: 0, ...patch } as Chat, ...current]
      }
      return current.map((chat) => (chat.id === patch.id ? mergeDefined(chat, patch) : chat))
    })
  }, [])

  const appendMessage = useCallback((message: ChatMessage) => {
    setMessages((current) => {
      const list = current[message.chatId] ?? []
      if (list.some((item) => item.id === message.id)) return current
      return { ...current, [message.chatId]: [...list, message] }
    })
  }, [])

  const setActive = useCallback((chatId: string | null) => {
    activeChatId.current = chatId
    if (!chatId) return
    setChats((current) =>
      current.map((chat) => (chat.id === chatId ? { ...chat, unreadCount: 0 } : chat)),
    )
  }, [])

  const openChat = useCallback(
    (chatId: string) => {
      if (!credentials || !chatId) return

      if (loadedChats.current.has(chatId)) return
      loadedChats.current.add(chatId)

      const controller = new AbortController()
      setHistory((current) => ({ ...current, [chatId]: { status: 'loading', error: null } }))

      void (async () => {
        try {
          const raw = await getChatHistory(credentials, chatId, HISTORY_LIMIT, controller.signal)
          if (controller.signal.aborted) return

          const list = mapHistory(raw ?? [], chatId)
          setMessages((current) => ({ ...current, [chatId]: list }))

          const last = list[list.length - 1]
          if (last) {
            upsertChat({ id: chatId, lastMessage: last.text, lastMessageAt: last.timestamp })
          }

          setHistory((current) => ({ ...current, [chatId]: { status: 'ready', error: null } }))
        } catch (thrown) {
          if (controller.signal.aborted) return
          // Снимаем отметку, чтобы повторное открытие чата попробовало снова.
          loadedChats.current.delete(chatId)
          setHistory((current) => ({
            ...current,
            [chatId]: {
              status: 'error',
              error: describeError(thrown, 'Не удалось загрузить переписку'),
            },
          }))
        }
      })()
    },
    [credentials, upsertChat],
  )

  const createChatByPhone = useCallback(
    async (input: string): Promise<CreateChatResult> => {
      if (!credentials) return { ok: false, error: 'Инстанс не подключён' }

      const { digits, error: phoneError } = normalizePhone(input)
      if (phoneError) return { ok: false, error: phoneError }

      setIsCreating(true)
      try {
        // `chatId` между сессиями не меняется, поэтому уже известные номера
        // повторно не проверяем: каждый CheckAccount расходует квоту тарифа.
        let chatId = findContact(digits)

        if (!chatId) {
          const result = readCheckAccount(await checkAccount(credentials, Number(digits)))
          if (!result.exists) return { ok: false, error: result.reason }
          chatId = result.chatId
          saveContact(digits, chatId)
        }

        upsertChat({
          id: chatId,
          name: formatPhone(Number(digits)),
          type: 'user',
          phoneNumber: Number(digits),
        })

        return { ok: true, chatId }
      } catch (thrown) {
        return { ok: false, error: describeError(thrown, 'Не удалось создать чат') }
      } finally {
        setIsCreating(false)
      }
    },
    [credentials, upsertChat],
  )

  const sendMessage = useCallback(
    async (chatId: string, text: string) => {
      if (!credentials) return

      const localId = `local-${createId()}`
      const timestamp = Math.floor(Date.now() / 1000)

      appendMessage({
        id: localId,
        chatId,
        authorId: '',
        text,
        timestamp,
        direction: 'out',
        status: 'sending',
        pending: true,
      })
      upsertChat({ id: chatId, lastMessage: text, lastMessageAt: timestamp })

      const patch = (id: string, status: ChatMessage['status']) => {
        setMessages((current) => ({
          ...current,
          [chatId]: (current[chatId] ?? []).map((message) =>
            message.id === id ? { ...message, status, pending: false } : message,
          ),
        }))
      }

      try {
        const serverId = (await sendMessageRequest(credentials, chatId, text))?.idMessage
        if (serverId) {
          setMessages((current) => ({
            ...current,
            [chatId]: (current[chatId] ?? []).map((message) =>
              message.id === localId ? { ...message, id: serverId, status: 'sent' } : message,
            ),
          }))
        } else {
          patch(localId, 'sent')
        }
      } catch {
        patch(localId, 'failed')
      }
    },
    [appendMessage, credentials, upsertChat],
  )

  // Очередь уведомлений. Любое уведомление нужно подтверждать, даже если
  // приложению оно не понадобилось, иначе оно вернётся в очередь.
  useEffect(() => {
    if (!credentials) return

    const controller = new AbortController()
    const { signal } = controller

    void (async () => {
      while (!signal.aborted) {
        try {
          const notification = await receiveNotification(credentials, signal)
          if (signal.aborted) break

          if (notification?.receiptId === undefined) {
            // Очередь пуста. Обычно GREEN-API держит запрос открытым до
            // receiveTimeout, но пауза страхует от частого опроса.
            await wait(POLL_PAUSE_MS)
            continue
          }

          void deleteNotification(credentials, notification.receiptId, signal).catch(
            () => undefined,
          )

          const incoming = mapIncomingNotification(notification)
          if (!incoming) continue

          appendMessage(incoming.message)
          upsertChat({
            id: incoming.chat.id,
            name: incoming.chat.name,
            type: incoming.chat.type,
            phoneNumber: incoming.chat.phoneNumber,
            lastMessage: incoming.message.text,
            lastMessageAt: incoming.message.timestamp,
            // В открытом чате сообщение сразу на экране — счётчик не растёт.
            unreadCount:
              activeChatId.current === incoming.chat.id
                ? 0
                : (chatsRef.current.find((chat) => chat.id === incoming.chat.id)?.unreadCount ??
                    0) + 1,
          })
        } catch (thrown) {
          if (signal.aborted) break
          // Ошибка не должна ронять опрос: у GREEN-API есть лимит частоты
          // запросов, поэтому просто ждём и пробуем снова.
          await wait(
            thrown instanceof GreenApiError && thrown.status === 429
              ? POLL_PAUSE_MS * 4
              : POLL_PAUSE_MS,
          )
        }
      }
    })()

    return () => controller.abort()
  }, [appendMessage, credentials, upsertChat])

  const getChat = useCallback((chatId: string) => chats.find((chat) => chat.id === chatId), [chats])
  const getMessages = useCallback((chatId: string) => messages[chatId] ?? [], [messages])
  const getHistoryStatus = useCallback(
    (chatId: string) => history[chatId]?.status ?? 'loading',
    [history],
  )
  const getHistoryError = useCallback((chatId: string) => history[chatId]?.error ?? null, [history])

  const value = useMemo<ChatsContextValue>(
    () => ({
      chats,
      status,
      error,
      isCreating,
      getChat,
      getMessages,
      getHistoryStatus,
      getHistoryError,
      reload,
      setActive,
      createChatByPhone,
      openChat,
      sendMessage,
    }),
    [
      chats,
      status,
      error,
      isCreating,
      getChat,
      getMessages,
      getHistoryStatus,
      getHistoryError,
      reload,
      setActive,
      createChatByPhone,
      openChat,
      sendMessage,
    ],
  )

  return <ChatsContext value={value}>{children}</ChatsContext>
}
