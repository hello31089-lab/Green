import type {
  CheckAccountResponse,
  GreenApiCredentials,
  GreenApiErrorPayload,
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

export function checkAccount(
  credentials: GreenApiCredentials,
  id: string,
  signal?: AbortSignal,
): Promise<CheckAccountResponse | null> {
  return call<CheckAccountResponse>('checkAccount', credentials, { id }, signal)
}

export function sendMessage(
  credentials: GreenApiCredentials,
  chatId: string,
  message: string,
  signal?: AbortSignal,
): Promise<SendMessageResponse | null> {
  return call<SendMessageResponse>('sendMessage', credentials, { chatId, message }, signal)
}

export function receiveNotification(credentials: GreenApiCredentials, signal?: AbortSignal) {
  return call<Record<string, unknown>>('receiveNotification', credentials, {}, signal)
}

export function deleteNotification(
  credentials: GreenApiCredentials,
  receiptId: string,
  signal?: AbortSignal,
) {
  return call<null>('deleteNotification', credentials, { receiptId }, signal)
}
