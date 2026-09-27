export interface GreenApiCredentials {
  idInstance: string
  apiTokenInstance: string
}

export type GreenApiErrorPayload = {
  status?: string
  message?: string
  error?: string
  [key: string]: unknown
}

/** Ответ `GetStateInstance`. */
export interface StateInstanceResponse {
  stateInstance?: 'authorized' | 'unauthorized' | 'qr' | 'yandex_api'
  status?: string
  account?: {
    me?: boolean
    pushName?: string
    wid?: string
  }
  settings?: Record<string, unknown>
}

/** Ответ `SendMessage`. */
export interface SendMessageResponse {
  idMessage?: string
}

/** Ответ `CheckAccount`. */
export interface CheckAccountResponse {
  status?: string
  exists?: boolean
}

export interface GreenApiNotification {
  receiptId?: string
  type?: string
  timestamp?: number
  body?: {
    idMessage?: string
    chatId?: string
    senderId?: string
    senderName?: string
    type?: string
    text?: string
    status?: string
    timestamp?: number
  }
}
