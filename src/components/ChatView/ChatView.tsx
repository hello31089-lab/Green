import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import type { Chat, ChatMessage } from '../../types/chat'
import { ButtonItem } from '../ButtonItem'
import styles from './ChatView.module.css'

export interface ChatViewProps {
  chat?: Chat
  messages: ChatMessage[]
  onSend: (text: string) => void
}

export function ChatView({ chat, messages, onSend }: ChatViewProps) {
  const [draft, setDraft] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

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

  if (!chat) {
    return <section className={styles.placeholder}>Выберите чат для общения</section>
  }

  return (
    <section className={styles.view}>
      <header className={styles.header}>
        <h2 className={styles.title}>{chat.name}</h2>
      </header>

      <div className={styles.messages}>
        {messages.map((message) => (
          <div
            key={message.id}
            className={`${styles.message} ${message.direction === 'out' ? styles.outgoing : styles.incoming}`}
          >
            {message.text}
            <span className={styles.time}>{message.timestamp}</span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <form className={styles.composer} onSubmit={handleSubmit}>
        <input
          className={styles.input}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Введите сообщение"
          aria-label="Сообщение"
        />
        <ButtonItem
          icon="➤"
          label="Отправить"
          type="submit"
          shape="rounded"
          variant="primary"
          disabled={!draft.trim()}
        />
      </form>
    </section>
  )
}

export default ChatView
