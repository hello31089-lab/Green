/**
 * Доступ к localStorage может бросить исключение: приватный режим браузера,
 * отключённые куки, переполнение квоты. Все обращения к хранилищу идут
 * через эти обёртки, чтобы не дублировать try/catch и не ронять приложение.
 */

export function readItem(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

export function writeItem(key: string, value: string): boolean {
  try {
    localStorage.setItem(key, value)
    return true
  } catch {
    return false
  }
}

export function removeItem(key: string): void {
  try {
    localStorage.removeItem(key)
  } catch {
    // хранилище недоступно — молча продолжаем работу в памяти
  }
}
