export interface GreenApiCredentials {
  idInstance: string
  apiTokenInstance: string
}

export interface GreenApiErrorPayload {
  status?: string | boolean
  message?: string
  error?: string
  reason?: string
  /** Тело ошибки 466: квоты методов и количества чатов. */
  invokeStatus?: QuotaStatus
  correspondentsStatus?: QuotaStatus
  [key: string]: unknown
}

export interface QuotaStatus {
  method?: string
  used?: string | number
  total?: string | number
  status?: string
  description?: string
}

/**
 * Состояние инстанса. Значения — как в ответе `GetStateInstance`, и для
 * MAX, WhatsApp и Telegram набор одинаковый.
 * Важно: `notAuthorized`, а не `unauthorized`; `qr` в этом перечне отсутствует.
 */
export type InstanceState =
  'notAuthorized' | 'authorized' | 'blocked' | 'starting' | 'suspended' | 'pendingPassword'

export interface StateInstanceResponse {
  stateInstance?: InstanceState
}

/**
 * Элемент ответа `GetChats`.
 *
 * Формат идентификатора зависит от мессенджера: в MAX и WhatsApp это JID
 * (`79991234567@c.us` для личного чата, `79526670710-1611399404@g.us` для
 * группы), в Telegram — число. Поле тоже называется по-разному: в MAX
 * идентификатор приходит в `id`, а в части методов — в `chatId`. Поэтому
 * оба поля читаются, а неоднозначность разрешается в мапперах.
 *
 * Остальные поля приходят не у всех чатов: у группы номера нет, у
 * архивного стоит `archive`, а `unreadCount`, в отличие от
 * `GetChatHistory`, действительно отдаётся.
 */
export interface GreenApiChat {
  /**
   * Идентификатор приходит строкой (JID) у MAX и WhatsApp, но у части
   * методов и инстансов это число, поэтому тип расширен.
   */
  id?: string | number
  chatId?: string | number
  name?: string
  type?: string
  archive?: boolean
  ephemeralExpiration?: number
  ephemeralSettingTimestamp?: number
  unreadCount?: number
  /** Заполняется не всегда; иначе номер берётся из JID. */
  phoneNumber?: number | string
}

/**
 * Ответ `CheckAccount` — объединение двух форм.
 * Либо аккаунт найден и приходит идентификатор чата, либо причина
 * отказа в `reason`. Идентификатор, как и в `GetChats`, является JID.
 */
export type CheckAccountResponse =
  | { exist: true; chatId?: string | number; id?: string | number; fromCache?: boolean }
  | { status: false; reason: string }

export interface SendMessageResponse {
  idMessage?: string
}

export interface DeleteNotificationResponse {
  result?: boolean
  reason?: string
}

/**
 * Сообщение из `GetChatHistory`. Сортировка — по убыванию времени.
 * Поля помечены необязательными, потому что наборы полей различаются между
 * мессенджерами и версиями API: например, `senderId` есть в примерах, но
 * отсутствует в таблице полей.
 */
export interface GreenApiHistoryMessage {
  type?: 'incoming' | 'outgoing'
  idMessage?: string
  /** UNIX-время в секундах. */
  timestamp?: number
  /** Только для исходящих: `sent` | `delivered` | `read`. */
  statusMessage?: string
  sendByApi?: boolean
  typeMessage?: string
  chatId?: string
  chatType?: string
  /** Текст для `textMessage` и `extendedTextMessage`. */
  textMessage?: string
  extendedTextMessage?: {
    text?: string
    description?: string
    title?: string
  }
  senderId?: string
  senderName?: string
  senderType?: string
  senderContactName?: string
  caption?: string
  isForwarded?: boolean
  forwardingScore?: number
}

/** Конверт уведомления из `ReceiveNotification`. */
export interface GreenApiNotification {
  /** Числовой, уходит в путь при вызове `DeleteNotification`. */
  receiptId?: number
  body?: GreenApiNotificationBody
}

export interface GreenApiNotificationBody {
  /** `incomingMessageReceived` для входящего сообщения. */
  typeWebhook?: string
  instanceData?: {
    idInstance?: number
    wid?: string
    typeInstance?: string
  }
  timestamp?: number
  idMessage?: string
  senderData?: {
    /** Идентификатор чата: в MAX приходит в поле `id` и выглядит как JID. */
    id?: string | number
    chatId?: string | number
    chatName?: string
    chatType?: string
    sender?: string
    senderName?: string
    senderType?: string
    senderContactName?: string
    senderPhoneNumber?: number | string
  }
  messageData?: {
    /** `textMessage` для обычного текста. */
    typeMessage?: string
    textMessageData?: {
      textMessage?: string
      isForwarded?: boolean
      forwardingScore?: number
    }
  }
}
