import { useContext } from 'react'
import { ChatsContext } from '../providers/chatsContext'

export function useChats() {
  const context = useContext(ChatsContext)
  if (!context) {
    throw new Error('useChats должен вызываться внутри ChatsProvider')
  }
  return context
}
