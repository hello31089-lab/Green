import type { GreenApiCredentials } from '../types/greenApi'
import { readItem, removeItem, writeItem } from './safeStorage'

const STORAGE_KEY = 'green-api-credentials'

const ID_PATTERN = /^\d{6,12}$/
const TOKEN_PATTERN = /^[A-Za-z0-9]{16,}$/

export type CredentialsErrors = Partial<Record<keyof GreenApiCredentials, string>>

export function validateCredentials(values: Partial<GreenApiCredentials>): CredentialsErrors {
  const errors: CredentialsErrors = {}

  const idInstance = values.idInstance?.trim() ?? ''
  const apiTokenInstance = values.apiTokenInstance?.trim() ?? ''

  if (!idInstance) {
    errors.idInstance = 'Укажите idInstance'
  } else if (!ID_PATTERN.test(idInstance)) {
    errors.idInstance = 'Только цифры, от 6 до 12 символов'
  }

  if (!apiTokenInstance) {
    errors.apiTokenInstance = 'Укажите apiTokenInstance'
  } else if (!TOKEN_PATTERN.test(apiTokenInstance)) {
    errors.apiTokenInstance = 'Только латинские буквы и цифры, от 16 символов'
  }

  return errors
}

function isCredentials(value: unknown): value is GreenApiCredentials {
  if (typeof value !== 'object' || value === null) return false
  return Object.keys(validateCredentials(value as GreenApiCredentials)).length === 0
}

export function normalizeCredentials(values: Partial<GreenApiCredentials>): GreenApiCredentials {
  return {
    idInstance: values.idInstance?.trim() ?? '',
    apiTokenInstance: values.apiTokenInstance?.trim() ?? '',
  }
}

export function loadCredentials(): GreenApiCredentials | null {
  const raw = readItem(STORAGE_KEY)
  if (!raw) return null

  try {
    const parsed: unknown = JSON.parse(raw)
    return isCredentials(parsed) ? parsed : null
  } catch {
    return null
  }
}

export function saveCredentials(credentials: GreenApiCredentials): boolean {
  return writeItem(STORAGE_KEY, JSON.stringify(credentials))
}

export function clearCredentials(): void {
  removeItem(STORAGE_KEY)
}
