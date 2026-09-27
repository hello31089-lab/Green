import { useContext } from 'react'
import { CredentialsContext } from '../providers/CredentialsContext'

export function useCredentials() {
  const context = useContext(CredentialsContext)
  if (!context) {
    throw new Error('useCredentials должен вызываться внутри CredentialsProvider')
  }
  return context
}
