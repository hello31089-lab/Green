import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCredentials } from '../../hooks/useCredentials'
import type { CredentialsErrors } from '../../lib/credentials'
import type { GreenApiCredentials } from '../../types/greenApi'
import styles from './Auth.module.css'

export interface AuthProps {
  redirectTo?: string
}

interface FieldSpec {
  name: keyof GreenApiCredentials
  label: string
  placeholder: string
  hint: string
  inputMode: 'numeric' | 'text'
  autoComplete: string
}

const FIELDS: FieldSpec[] = [
  {
    name: 'idInstance',
    label: 'idInstance',
    placeholder: '110100001',
    hint: 'Числовой идентификатор инстанса из личного кабинета',
    inputMode: 'numeric',
    autoComplete: 'username',
  },
  {
    name: 'apiTokenInstance',
    label: 'apiTokenInstance',
    placeholder: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    hint: 'Токен инстанса из того же личного кабинета',
    inputMode: 'text',
    autoComplete: 'current-password',
  },
]

function FieldIcon({ name }: { name: string }) {
  if (name === 'idInstance') {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        aria-hidden="true"
      >
        <rect x="3" y="5" width="18" height="14" rx="3" />
        <path d="M8 10h8M8 14h5" strokeLinecap="round" />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <rect x="4" y="10" width="16" height="11" rx="3" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" strokeLinecap="round" />
    </svg>
  )
}

export function Auth({ redirectTo = '/' }: AuthProps) {
  const navigate = useNavigate()
  const { authorize, status, error } = useCredentials()

  const [values, setValues] = useState({ idInstance: '', apiTokenInstance: '' })
  const [fieldErrors, setFieldErrors] = useState<CredentialsErrors>({})
  const [isTokenVisible, setTokenVisible] = useState(false)

  const isChecking = status === 'checking'

  const handleChange = (name: keyof typeof values, value: string) => {
    setValues((current) => ({ ...current, [name]: value }))
    setFieldErrors((current) => (current[name] ? { ...current, [name]: undefined } : current))
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const errors = await authorize(values)
    if (errors) {
      setFieldErrors(errors)
      return
    }
    navigate(redirectTo, { replace: true })
  }

  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <div className={styles.brand}>
          <span className={styles.logo}>G</span>
          <div>
            <h1 className={styles.title}>Подключение к GREEN-API</h1>
            <p className={styles.subtitle}>Чаты MAX, WhatsApp и Telegram через ваш инстанс</p>
          </div>
        </div>

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          {FIELDS.map((field) => (
            <label key={field.name} className={styles.field}>
              <span className={styles.label}>{field.label}</span>
              <span className={styles.control}>
                <span className={styles.icon}>
                  <FieldIcon name={field.name} />
                </span>
                <input
                  className={styles.input}
                  type={field.name === 'apiTokenInstance' && !isTokenVisible ? 'password' : 'text'}
                  value={values[field.name]}
                  placeholder={field.placeholder}
                  inputMode={field.inputMode}
                  autoComplete={field.autoComplete}
                  spellCheck={false}
                  disabled={isChecking}
                  aria-invalid={Boolean(fieldErrors[field.name])}
                  aria-describedby={fieldErrors[field.name] ? `${field.name}-error` : undefined}
                  onChange={(event) => handleChange(field.name, event.target.value)}
                />
                {field.name === 'apiTokenInstance' && (
                  <button
                    className={styles.reveal}
                    type="button"
                    onClick={() => setTokenVisible((current) => !current)}
                    aria-label={isTokenVisible ? 'Скрыть токен' : 'Показать токен'}
                  >
                    {isTokenVisible ? 'Скрыть' : 'Показать'}
                  </button>
                )}
              </span>
              {fieldErrors[field.name] ? (
                <span className={styles.error} id={`${field.name}-error`}>
                  {fieldErrors[field.name]}
                </span>
              ) : (
                <span className={styles.hint}>{field.hint}</span>
              )}
            </label>
          ))}

          {error && (
            <p className={styles.banner} role="alert">
              {error}
            </p>
          )}

          <button className={styles.submit} type="submit" disabled={isChecking}>
            {isChecking ? 'Проверяем инстанс…' : 'Подключить'}
          </button>
        </form>

        <p className={styles.footer}>
          Учётные данные хранятся только в localStorage этого устройства. В GREEN-API они уходят
          отдельными заголовками через собственный прокси приложения, в адрес строки не попадают.
          Заберите их в{' '}
          <a href="https://console.green-api.com" target="_blank" rel="noreferrer">
            личном кабинете GREEN-API
          </a>
          .
        </p>
      </div>
    </main>
  )
}

export default Auth
