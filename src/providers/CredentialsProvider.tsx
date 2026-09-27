import { useCallback, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { GreenApiError, getStateInstance } from '../api/greenApi'
import {
  clearCredentials,
  loadCredentials,
  normalizeCredentials,
  saveCredentials,
  validateCredentials,
} from '../lib/credentials'
import type { CredentialsErrors } from '../lib/credentials'
import type { GreenApiCredentials, InstanceState, StateInstanceResponse } from '../types/greenApi'
import { CredentialsContext } from './CredentialsContext'
import type { CredentialsContextValue, CredentialsStatus } from './CredentialsContext'

export interface CredentialsProviderProps {
  children: ReactNode
}

const AUTHORIZED: InstanceState = 'authorized'

const KNOWN_STATUSES = new Set([400, 401, 403, 404, 429, 466, 469, 502])

/** Ответ пришёл не от нашего прокси — значит не смонтирован, а не неверные данные. */
const PROXY_MISSING_STATUSES = new Set([404, 405])

type VerifyResult = { ok: true } | { ok: false; message: string }

/**
 * Ошибки `GetStateInstance` для неавторизованного инстанса приходят
 * с кодом 200 и заполненным `stateInstance`, поэтому состояние важнее кода.
 */
const STATE_MESSAGES: Record<InstanceState, string> = {
  notAuthorized: 'Инстанс не авторизован в MAX. Отсканируйте QR-код в личном кабинете GREEN-API.',
  starting: 'Инстанс запускается. Это занимает до 5 минут, попробуйте позже.',
  blocked:
    'Аккаунт MAX заблокирован. После перезапуска инстанса он вернётся в статус «не авторизован».',
  suspended:
    'На аккаунте временные ограничения: отправка возможна только номерам, сохранившим ваш номер в контактах.',
  pendingPassword: 'Для завершения авторизации нужен пароль двухфакторной аутентификации.',
  authorized: '',
}

function describeState(state: InstanceState): string | null {
  return STATE_MESSAGES[state] || null
}

/** Превращает ответ GREEN-API в понятное пользователю сообщение. */
function describeFailure(status: number, instanceState: InstanceState | null): string {
  if (instanceState) {
    const message = describeState(instanceState)
    if (message) return message
  }

  switch (status) {
    case 400:
      return 'GREEN-API отклонил запрос. Проверьте формат учётных данных.'
    case 401:
    case 403:
      return 'Неверный idInstance или apiTokenInstance.'
    case 404:
      return 'Инстанс с таким idInstance не найден.'
    case 429:
      return 'Превышен лимит запросов. Подождите минуту и повторите попытку.'
    case 466:
      return 'Исчерпан лимит тарифа MAX Developer.'
    case 469:
      return 'Слишком много проверок номеров подряд. Сделайте паузу примерно на 2 часа.'
    case 502:
      return 'GREEN-API недоступен. Попробуйте позже.'
    default:
      return status > 0
        ? `GREEN-API вернул ошибку ${status}.`
        : 'Нет связи с сервером. Проверьте подключение.'
  }
}

function toMessage(thrown: unknown, instanceState: InstanceState | null): string {
  if (thrown instanceof GreenApiError) {
    // Сообщение прокси важнее стандартной расшифровки: оно точнее
    // описывает, что именно сломалось на его стороне.
    if (PROXY_MISSING_STATUSES.has(thrown.status) || thrown.status === 0) {
      return thrown.message || describeFailure(thrown.status, instanceState)
    }
    if (KNOWN_STATUSES.has(thrown.status)) {
      return describeFailure(thrown.status, instanceState)
    }
    return thrown.message || describeFailure(thrown.status, instanceState)
  }
  return describeFailure(0, instanceState)
}

export function CredentialsProvider({ children }: CredentialsProviderProps) {
  // Читаем localStorage один раз: и начальное состояние, и проверка ниже
  // используют одно и то же значение.
  const [stored] = useState<GreenApiCredentials | null>(loadCredentials)

  const [credentials, setCredentials] = useState<GreenApiCredentials | null>(stored)
  const [status, setStatus] = useState<CredentialsStatus>(stored ? 'checking' : 'anonymous')
  const [error, setError] = useState<string | null>(null)

  const verify = useCallback(async (values: GreenApiCredentials): Promise<VerifyResult> => {
    let response: StateInstanceResponse | null

    try {
      response = await getStateInstance(values)
    } catch (thrown) {
      return { ok: false, message: toMessage(thrown, null) }
    }

    const state = response?.stateInstance ?? null

    if (state !== AUTHORIZED) {
      return { ok: false, message: describeFailure(200, state) }
    }

    return { ok: true }
  }, [])

  useEffect(() => {
    if (!stored) return

    let cancelled = false

    void (async () => {
      const result = await verify(stored)
      if (cancelled) return

      if (result.ok) {
        setStatus('authorized')
        return
      }

      setError(result.message)
      setStatus('anonymous')
    })()

    return () => {
      cancelled = true
    }
  }, [stored, verify])

  const authorize = useCallback(
    async (values: GreenApiCredentials): Promise<CredentialsErrors | null> => {
      const normalized = normalizeCredentials(values)
      const fieldErrors = validateCredentials(normalized)
      if (Object.keys(fieldErrors).length > 0) return fieldErrors

      setError(null)
      setStatus('checking')

      const result = await verify(normalized)

      if (!result.ok) {
        setStatus('anonymous')
        setError(result.message)
        return null
      }

      saveCredentials(normalized)
      setCredentials(normalized)
      setStatus('authorized')
      return null
    },
    [verify],
  )

  const signOut = useCallback(() => {
    clearCredentials()
    setCredentials(null)
    setError(null)
    setStatus('anonymous')
  }, [])

  const value: CredentialsContextValue = {
    credentials,
    status,
    error,
    authorize,
    signOut,
  }

  return <CredentialsContext value={value}>{children}</CredentialsContext>
}
