import { createContext } from 'react'
import type { GreenApiCredentials } from '../types/greenApi'
import type { CredentialsErrors } from '../lib/credentials'

export type CredentialsStatus = 'checking' | 'anonymous' | 'authorized'

export interface CredentialsContextValue {
  credentials: GreenApiCredentials | null
  status: CredentialsStatus
  instanceState: string | null
  error: string | null
  authorize: (values: GreenApiCredentials) => Promise<CredentialsErrors | null>
  signOut: () => void
}

export const CredentialsContext = createContext<CredentialsContextValue | null>(null)
