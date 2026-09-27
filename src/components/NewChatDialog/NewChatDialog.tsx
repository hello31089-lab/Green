import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import styles from './NewChatDialog.module.css'

export interface NewChatDialogProps {
  isSubmitting: boolean
  onSubmit: (phone: string) => Promise<{ ok: boolean; error?: string }>
  onClose: () => void
}

/**
 * Создание чата по номеру телефона. Номер проверяется через `CheckAccount`,
 * который возвращает `chatId` — по нему уже можно открыть переписку.
 */
export function NewChatDialog({ isSubmitting, onSubmit, onClose }: NewChatDialogProps) {
  const [phone, setPhone] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isSubmitting) onClose()
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [isSubmitting, onClose])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const result = await onSubmit(phone)
    if (!result.ok) {
      setError(result.error ?? 'Не удалось создать чат')
      return
    }

    setPhone('')
    setError(null)
  }

  const handleClose = () => {
    if (isSubmitting) return
    setPhone('')
    setError(null)
    onClose()
  }

  return (
    <div
      className={styles.backdrop}
      role="presentation"
      onClick={(event) => {
        if (event.target === event.currentTarget) handleClose()
      }}
    >
      <div
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="new-chat-title"
      >
        <div className={styles.header}>
          <div>
            <h2 className={styles.title} id="new-chat-title">
              Новый чат
            </h2>
            <p className={styles.subtitle}>
              Введите номер телефона. Если на нём есть аккаунт в мессенджере, откроется переписка с
              ним.
            </p>
          </div>
          <button
            className={styles.close}
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            aria-label="Закрыть"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <label className={styles.label} htmlFor="new-chat-phone">
            Номер телефона
          </label>
          <input
            id="new-chat-phone"
            className={styles.input}
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            autoFocus
            value={phone}
            placeholder="+7 999 123-45-67"
            disabled={isSubmitting}
            aria-invalid={Boolean(error)}
            onChange={(event) => {
              setPhone(event.target.value)
              setError(null)
            }}
          />

          {error ? (
            <p className={styles.error} role="alert">
              {error}
            </p>
          ) : (
            <p className={styles.hint}>Номера России (7) и Беларуси (375), 11 или 12 цифр.</p>
          )}

          <div className={styles.actions}>
            <button
              className={styles.cancel}
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Отмена
            </button>
            <button className={styles.submit} type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Проверяем…' : 'Найти'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default NewChatDialog
