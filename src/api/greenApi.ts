import type {
  CheckAccountResponse,
  DeleteNotificationResponse,
  GreenApiChat,
  GreenApiCredentials,
  GreenApiErrorPayload,
  GreenApiHistoryMessage,
  GreenApiNotification,
  SendMessageResponse,
  StateInstanceResponse,
} from '../types/greenApi'

export const GREEN_API_METHODS = [
  'getStateInstance',
  'getAccountSettings',
  'sendMessage',
  'receiveNotification',
  'deleteNotification',
  'checkAccount',
  'setSettings',
  'getChats',
  'getChatHistory',
] as const

export type GreenApiMethod = (typeof GREEN_API_METHODS)[number]

const PROXY_URL = '/api/green-api'
const ID_INSTANCE_HEADER = 'x-green-id-instance'
const TOKEN_HEADER = 'x-green-token'

/** Таймаут ожидания уведомления в GREEN-API: от 5 до 60 секунд. */
export const RECEIVE_TIMEOUT_SECONDS = 20

export class GreenApiError extends Error {
  readonly status: number
  readonly payload: GreenApiErrorPayload | null

  constructor(message: string, status: number, payload: GreenApiErrorPayload | null = null) {
    super(message)
    this.name = 'GreenApiError'
    this.status = status
    this.payload = payload
  }
}

function readErrorMessage(payload: unknown, fallback: string): string {
  if (typeof payload !== 'object' || payload === null) return fallback
  const record = payload as GreenApiErrorPayload
  if (typeof record.message === 'string' && record.message) return record.message
  if (typeof record.error === 'string' && record.error) return record.error
  if (typeof record.reason === 'string' && record.reason) return record.reason
  if (record.invokeStatus?.description) return record.invokeStatus.description
  if (record.correspondentsStatus?.description) return record.correspondentsStatus.description
  return fallback
}

async function call<T>(
  method: GreenApiMethod,
  credentials: GreenApiCredentials,
  payload: Record<string, unknown> = {},
  signal?: AbortSignal,
): Promise<T | null> {
  let response: Response

  try {
    response = await fetch(PROXY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        [ID_INSTANCE_HEADER]: credentials.idInstance,
        [TOKEN_HEADER]: credentials.apiTokenInstance,
      },
      body: JSON.stringify({ method, ...payload }),
      signal,
    })
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error
    throw new GreenApiError('Нет связи с прокси. Проверьте подключение к сети.', 0)
  }

  const text = await response.text()
  const data: unknown = text ? safeParse(text) : null

  if (!response.ok) {
    // Тело не JSON — ответил не наш прокси, а сам Vite / хостинг.
    // Значит, функция не смонтирована, а не проблема в учётных данных.
    if (data === null && (response.status === 404 || response.status === 405)) {
      throw new GreenApiError(
        'Прокси GREEN-API не найден. Запустите проект через `npm run dev` или `npx vercel dev`.',
        response.status,
      )
    }

    throw new GreenApiError(
      readErrorMessage(data, `Запрос завершился с кодом ${response.status}`),
      response.status,
      typeof data === 'object' && data !== null ? (data as GreenApiErrorPayload) : null,
    )
  }

  return (data ?? null) as T | null
}

function safeParse(text: string): unknown {
  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}

export function getStateInstance(
  credentials: GreenApiCredentials,
  signal?: AbortSignal,
): Promise<StateInstanceResponse | null> {
  return call<StateInstanceResponse>('getStateInstance', credentials, {}, signal)
}

export function getChats(
  credentials: GreenApiCredentials,
  signal?: AbortSignal,
): Promise<GreenApiChat[] | null> {
  return call<GreenApiChat[]>('getChats', credentials, {}, signal)
}

/**
 * Проверяет, есть ли на номере аккаунт MAX, и отдаёт `chatId` для отправки.
 * Каждый вызов расходует квоту тарифа, поэтому результат стоит кэшировать.
 */
export function checkAccount(
  credentials: GreenApiCredentials,
  phoneNumber: number,
  signal?: AbortSignal,
): Promise<CheckAccountResponse | null> {
  return call<CheckAccountResponse>('checkAccount', credentials, { phoneNumber }, signal)
}

/**
 * Идентификатор чата отправляется под двумя именами. В `GetChats` MAX
 * отдаёт его в поле `id`, тогда как методы истории и отправки в документации
 * описаны с `chatId`. Значение одно и то же — JID, а лишние поля API
 * игнорирует, поэтому такой вызов работает с обоими контрактами.
 */
function chatRef(chatId: string): Record<string, string> {
  return { chatId, id: chatId }
}

export function getChatHistory(
  credentials: GreenApiCredentials,
  chatId: string,
  count = 100,
  signal?: AbortSignal,
): Promise<GreenApiHistoryMessage[] | null> {
  return call<GreenApiHistoryMessage[]>(
    'getChatHistory',
    credentials,
    { ...chatRef(chatId), count },
    signal,
  )
}

export function sendMessage(
  credentials: GreenApiCredentials,
  chatId: string,
  message: string,
  signal?: AbortSignal,
): Promise<SendMessageResponse | null> {
  return call<SendMessageResponse>(
    'sendMessage',
    credentials,
    { ...chatRef(chatId), message },
    signal,
  )
}

/**
 * Забирает одно уведомление из очереди. Возвращает `null`, если за
 * `receiveTimeout` секунд очередь осталась пустой — это штатная ситуация,
 * а не ошибка.
 */
export async function receiveNotification(
  credentials: GreenApiCredentials,
  signal?: AbortSignal,
): Promise<GreenApiNotification | null> {
  const result = await call<GreenApiNotification>(
    'receiveNotification',
    credentials,
    { receiveTimeout: RECEIVE_TIMEOUT_SECONDS },
    signal,
  )

  if (!result || typeof result !== 'object' || !result.body) return null
  return result
}

/** Подтверждает обработку уведомления, иначе оно вернётся в очередь. */
export function deleteNotification(
  credentials: GreenApiCredentials,
  receiptId: number,
  signal?: AbortSignal,
): Promise<DeleteNotificationResponse | null> {
  return call<DeleteNotificationResponse>('deleteNotification', credentials, { receiptId }, signal)
}
