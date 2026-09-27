const timeFormatter = new Intl.DateTimeFormat('ru-RU', {
  hour: '2-digit',
  minute: '2-digit',
})

/** Время сообщения в переписке: «16:38». */
export function formatTime(date: Date): string {
  return timeFormatter.format(date)
}

/** Время в списке чатов: сегодня — «16:38», вчера — «вчера», иначе — «3 июн.». */
export function formatChatTime(date: Date, now = new Date()): string {
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  const startOfDate = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()
  const dayDiff = Math.round((startOfToday - startOfDate) / 86_400_000)

  if (dayDiff === 0) return timeFormatter.format(date)
  if (dayDiff === 1) return 'вчера'

  return new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'short' })
    .format(date)
    .replace(/\s*г\.$/, '')
}
