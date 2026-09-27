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
 * Состояние инстанса MAX. Значения — как в ответе `GetStateInstance`.
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
 * Идентификатор приходит в поле `id` и имеет вид JID:
 * `79991234567@c.us` для личного чата и `79526670710-1611399404@g.us`
 * для группы. Поле `chatId` в MAX не используется, но оставлено как
 * запасной вариант: по нему можно опознать ответ другой версии API.
 *
 * Остальные поля приходят не у всех чатов: у группы номера нет, у
 * архивного стоит `archive`, а `unreadCount` MAX, в отличие от
 * `GetChatHistory`, действительно отдаёт.
 */
export interface GreenApiChat {
  id?: string
  chatId?: string
  name?: string
  type?: string
  archive?: boolean
  ephemeralExpiration?: number
  ephemeralSettingTimestamp?: number
  unreadCount?: number
  /** Заполняется не всегда; иначе номер берётся из JID. */
  phoneNumber?: number
}

/**
 * Ответ `CheckAccount` — объединение двух форм.
 * Либо аккаунт найден и приходит идентификатор чата, либо причина
 * отказа в `reason`. Идентификатор, как и в `GetChats`, является JID.
 */
export type CheckAccountResponse =
  | { exist: true; chatId?: string; id?: string; fromCache?: boolean }
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
 * Поля помечены необязательными, потому что документация MAX расходится
 * сама с собой: например, `senderId` есть в примерах, но отсутствует
 * в таблице полей.
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
    /** Идентификатор чата. В MAX приходит в поле `id`, как JID. */
    id?: string
    chatId?: string
    chatName?: string
    chatType?: string
    sender?: string
    senderName?: string
    senderType?: string
    senderContactName?: string
    senderPhoneNumber?: number
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
