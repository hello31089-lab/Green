import type { ReactNode } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { AppLayout } from './AppLayout'
import { Home } from '../pages/Home'
import { Chat } from '../pages/Chat'
import { Auth } from '../pages/Auth'
import { useCredentials } from '../hooks/useCredentials'

function Splash() {
  return (
    <div
      style={{
        display: 'grid',
        placeItems: 'center',
        height: '100%',
        color: 'var(--color-text-secondary)',
      }}
    >
      Загружаем чат…
    </div>
  )
}

/** Пускает в приложение только с валидными учётными данными GREEN-API. */
function RequireCredentials({ children }: { children: ReactNode }) {
  const { status } = useCredentials()
  const location = useLocation()

  if (status === 'checking') return <Splash />
  if (status !== 'authorized') {
    return <Navigate to="/auth" replace state={{ from: location.pathname }} />
  }

  return children
}

/** Если инстанс уже подключён, форма авторизации не нужна. */
function AuthRoute() {
  const { status } = useCredentials()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from ?? '/'

  if (status === 'checking') return <Splash />
  if (status === 'authorized') return <Navigate to={from} replace />

  return <Auth redirectTo={from} />
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/auth" element={<AuthRoute />} />
      <Route
        element={
          <RequireCredentials>
            <AppLayout />
          </RequireCredentials>
        }
      >
        <Route path="/" element={<Home />} />
        <Route path="/chat/:chatId" element={<Chat />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
