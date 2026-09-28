import { useEffect, useRef, useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import type { Chat, ChatMessage } from '../../types/chat'
import type { LoadStatus } from '../../providers/chatsContext'
import { formatPhone, typeLabel } from '../../api/mappers'
import { Avatar } from '../Avatar'
import { ButtonItem } from '../ButtonItem'
import { MessageBubble } from '../MessageBubble'
import styles from './ChatView.module.css'

export interface ChatViewProps {
  chat: Chat
  messages: ChatMessage[]
  historyStatus: LoadStatus
  historyError: string | null
  onSend: (text: string) => void
  onBack?: () => void
}

//TODO
// function StickerIcon() {
//   return (
//     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
//       <rect x="3" y="3" width="18" height="18" rx="5" />
//       <circle cx="9" cy="10" r="1.4" fill="currentColor" stroke="none" />
//       <circle cx="15" cy="10" r="1.4" fill="currentColor" stroke="none" />
//       <path d="M8.5 15c1 1.2 2.2 1.8 3.5 1.8s2.5-.6 3.5-1.8" strokeLinecap="round" />
//     </svg>
//   )
// }

// function ClipIcon() {
//   return (
//     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
//       <path
//         d="M20 11.5 12 19.5a4.5 4.5 0 0 1-6.4-6.4l8-8a3 3 0 0 1 4.3 4.3l-8 8a1.5 1.5 0 0 1-2.2-2.1l7.3-7.3"
//         strokeLinecap="round"
//         strokeLinejoin="round"
//       />
//     </svg>
//   )
// }

function SmileIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <circle cx="9" cy="10" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="15" cy="10" r="1.2" fill="currentColor" stroke="none" />
      <path d="M8.5 14.5c1 1.3 2.2 2 3.5 2s2.5-.7 3.5-2" strokeLinecap="round" />
    </svg>
  )
}
//TODO
// function SearchIcon() {
//   return (
//     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
//       <circle cx="11" cy="11" r="7" />
//       <path d="M20 20l-3.5-3.5" strokeLinecap="round" />
//     </svg>
//   )
// }

// function MenuIcon() {
//   return (
//     <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
//       <circle cx="5" cy="12" r="1.8" />
//       <circle cx="12" cy="12" r="1.8" />
//       <circle cx="19" cy="12" r="1.8" />
//     </svg>
//   )
// }

function ComposerAction({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <button className={styles.composerAction} type="button" aria-label={label} title={label}>
      {icon}
    </button>
  )
}

export function ChatView({
  chat,
  messages,
  historyStatus,
  historyError,
  onSend,
  onBack,
}: ChatViewProps) {
  const [draft, setDraft] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)
  const subtitle = formatPhone(chat.phoneNumber) || typeLabel(chat.type)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const text = draft.trim()
    if (!text) return
    onSend(text)
    setDraft('')
  }

  return (
    <section className={styles.view}>
      <header className={styles.header}>
        <span className={styles.back}>
          <ButtonItem icon="←" label="Назад" shape="circle" size="sm" onClick={onBack} />
        </span>
        <Avatar name={chat.name} size="sm" />
        <div className={styles.headerBody}>
          <span className={styles.headerName}>{chat.name}</span>
          <span className={styles.headerSubtitle}>{subtitle}</span>
        </div>
      </header>

      <div className={styles.messages}>
        {historyError && (
          <p className={styles.historyError} role="alert">
            {historyError}
          </p>
        )}
        {!historyError && historyStatus === 'loading' && (
          <p className={styles.empty}>Загружаем переписку…</p>
        )}
        {!historyError && historyStatus !== 'loading' && messages.length === 0 && (
          <p className={styles.empty}>Начните общение</p>
        )}
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        <div ref={bottomRef} />
      </div>

      <form className={styles.composer} onSubmit={handleSubmit}>
        <input
          className={styles.input}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Сообщение"
          aria-label="Сообщение"
        />
        <ComposerAction icon={<SmileIcon />} label="Эмодзи" />
        <ButtonItem
          icon="↑"
          label="Отправить"
          size="sm"
          type="submit"
          shape="circle"
          variant="primary"
          disabled={!draft.trim()}
        />
      </form>
    </section>
  )
}

export default ChatView
