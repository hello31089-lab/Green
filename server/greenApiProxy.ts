const API_URL = 'https://api.green-api.com'
const ID_INSTANCE_HEADER = 'x-green-id-instance'
const TOKEN_HEADER = 'x-green-token'

const ID_PATTERN = /^\d{6,12}$/
const TOKEN_PATTERN = /^[A-Za-z0-9]{16,}$/

interface MethodSpec {
  http: 'GET' | 'POST' | 'DELETE'
  path?: string[]
  query?: string[]
  body?: string[]
}

const METHODS: Record<string, MethodSpec> = {
  getStateInstance: { http: 'GET' },
  getAccountSettings: { http: 'GET' },

  // Тело проверяется API строго: лишние поля вызывают
  // "Validation failed. Details: '<поле>' is not allowed". Поэтому здесь
  // ровно те поля, которые принимает метод, ничего больше.
  sendMessage: { http: 'POST', body: ['chatId', 'message', 'typingTime', 'quotedMessageId'] },
  receiveNotification: { http: 'GET', query: ['receiveTimeout'] },
  deleteNotification: { http: 'DELETE', path: ['receiptId'] },

  checkAccount: { http: 'POST', body: ['phoneNumber', 'force'] },
  setSettings: {
    http: 'POST',
    body: ['webhookUrl', 'incomingWebhook', 'outgoingWebhook', 'stateWebhook'],
  },
  getChats: { http: 'GET' },
  getChatHistory: { http: 'POST', body: ['chatId', 'count'] },
}

export interface ProxyRequest {
  method?: string
  headers: Record<string, string | string[] | undefined>
  body?: unknown
}

export interface ProxyResponse {
  status: (code: number) => ProxyResponse
  setHeader: (name: string, value: string) => void
  json: (body: unknown) => void
}

function readHeader(headers: ProxyRequest['headers'], name: string): string | undefined {
  const raw = headers[name] ?? headers[name.toLowerCase()]
  return Array.isArray(raw) ? raw[0] : raw
}

function pickFields(
  payload: Record<string, unknown>,
  fields: string[] | undefined,
): Record<string, unknown> | undefined {
  if (!fields) return undefined
  const result: Record<string, unknown> = {}
  for (const field of fields) {
    if (payload[field] !== undefined) result[field] = payload[field]
  }
  return result
}

function buildUpstreamUrl(
  method: string,
  spec: MethodSpec,
  idInstance: string,
  token: string,
  payload: Record<string, unknown>,
): string {
  // `DeleteNotification` передаёт `receiptId` в пути, а не в теле.
  const suffix = (spec.path ?? [])
    .map((field) => payload[field])
    .filter((value): value is string | number => value !== undefined && value !== null)
    .map((value) => encodeURIComponent(String(value)))
    .join('/')

  const url = new URL(
    `${API_URL}/waInstance${idInstance}/${method}/${token}${suffix ? `/${suffix}` : ''}`,
  )

  for (const field of spec.query ?? []) {
    const value = payload[field]
    if (value !== undefined && value !== null) {
      url.searchParams.set(field, String(value))
    }
  }

  return url.toString()
}

export async function greenApiHandler(request: ProxyRequest, response: ProxyResponse) {
  response.setHeader('Cache-Control', 'no-store')

  if (request.method !== 'POST') {
    response.status(405).json({ status: 'error', message: 'Метод не поддерживается' })
    return
  }

  const idInstance = readHeader(request.headers, ID_INSTANCE_HEADER) ?? ''
  const token = readHeader(request.headers, TOKEN_HEADER) ?? ''

  if (!ID_PATTERN.test(idInstance) || !TOKEN_PATTERN.test(token)) {
    response.status(400).json({
      status: 'error',
      message: 'Некорректные учётные данные инстанса',
    })
    return
  }

  let body: Record<string, unknown>
  try {
    body =
      typeof request.body === 'string'
        ? (JSON.parse(request.body) as Record<string, unknown>)
        : ((request.body ?? {}) as Record<string, unknown>)
  } catch {
    response.status(400).json({ status: 'error', message: 'Тело запроса — не корректный JSON' })
    return
  }

  const methodName = typeof body.method === 'string' ? body.method : ''
  const spec = METHODS[methodName]

  if (!spec) {
    response.status(400).json({
      status: 'error',
      message: `Метод ${methodName || '(не указан)'} не разрешён`,
    })
    return
  }

  const url = buildUpstreamUrl(methodName, spec, idInstance, token, body)
  const requestBody = pickFields(body, spec.body)

  try {
    const upstream = await fetch(url, {
      method: spec.http,
      headers: { 'Content-Type': 'application/json' },
      body: spec.http === 'POST' ? JSON.stringify(requestBody ?? {}) : undefined,
    })

    // 204 — очередь уведомлений пуста, тела нет.
    if (upstream.status === 204) {
      response.status(200).json(null)
      return
    }

    const text = await upstream.text()
    const parsed = text ? safeJsonParse(text) : null

    response.status(upstream.status).json(parsed)
  } catch {
    response.status(502).json({
      status: 'error',
      message: 'GREEN-API недоступен. Попробуйте позже.',
    })
  }
}

function safeJsonParse(text: string): unknown {
  try {
    return JSON.parse(text)
  } catch {
    return { status: 'error', message: text }
  }
}
