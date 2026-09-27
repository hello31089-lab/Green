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
import type { GreenApiCredentials, StateInstanceResponse } from '../types/greenApi'
import { CredentialsContext } from './CredentialsContext'
import type { CredentialsContextValue, CredentialsStatus } from './CredentialsContext'

export interface CredentialsProviderProps {
  children: ReactNode
}

const AUTHORIZED = 'authorized'

const KNOWN_STATUSES = new Set([400, 401, 403, 404, 429, 466, 502])

type VerifyResult =
  { ok: true; state: string } | { ok: false; state: string | null; message: string }

/** Превращает ответ GREEN-API в понятное пользователю сообщение. */
function describeFailure(status: number, instanceState: string | null): string {
  if (instanceState === 'unauthorized') {
    return 'Инстанс не авторизован в мессенджере. Отсканируйте QR-код в личном кабинете GREEN-API.'
  }
  if (instanceState === 'qr') {
    return 'Инстанс ждёт авторизацию по QR-коду. Отсканируйте его в личном кабинете GREEN-API.'
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
    case 502:
      return 'GREEN-API недоступен. Попробуйте позже.'
    default:
      return status > 0
        ? `GREEN-API вернул ошибку ${status}.`
        : 'Нет связи с сервером. Проверьте подключение.'
  }
}

function toMessage(thrown: unknown, instanceState: string | null): string {
  if (thrown instanceof GreenApiError) {
    if (KNOWN_STATUSES.has(thrown.status) || thrown.status === 0) {
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
  const [instanceState, setInstanceState] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const verify = useCallback(async (values: GreenApiCredentials): Promise<VerifyResult> => {
    let response: StateInstanceResponse | null

    try {
      response = await getStateInstance(values)
    } catch (thrown) {
      return { ok: false, state: null, message: toMessage(thrown, null) }
    }

    const state = response?.stateInstance ?? null

    if (state !== AUTHORIZED) {
      return { ok: false, state, message: describeFailure(200, state) }
    }

    return { ok: true, state }
  }, [])

  // Если учётные данные были сохранены ранее, подтверждаем их перед входом.
  useEffect(() => {
    if (!stored) return

    let cancelled = false

    void (async () => {
      const result = await verify(stored)
      if (cancelled) return

      if (result.ok) {
        setInstanceState(result.state)
        setStatus('authorized')
        return
      }

      setInstanceState(result.state)
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
        setInstanceState(result.state)
        setStatus('anonymous')
        setError(result.message)
        return null
      }

      saveCredentials(normalized)
      setCredentials(normalized)
      setInstanceState(result.state)
      setStatus('authorized')
      return null
    },
    [verify],
  )

  const signOut = useCallback(() => {
    clearCredentials()
    setCredentials(null)
    setInstanceState(null)
    setError(null)
    setStatus('anonymous')
  }, [])

  const value: CredentialsContextValue = {
    credentials,
    status,
    instanceState,
    error,
    authorize,
    signOut,
  }

  return <CredentialsContext value={value}>{children}</CredentialsContext>
}
