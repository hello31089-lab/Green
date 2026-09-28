import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { Auth } from '../pages/Auth'
import { ErrorBoundary } from '../components/ErrorBoundary'
import { Loader } from '../components/Loader'
import { useCredentials } from '../hooks/useCredentials'
import styles from './AppRoutes.module.css'

const AuthenticatedRoutes = lazy(() => import('./AuthenticatedRoutes'))

function Splash({ label }: { label: string }) {
  return (
    <div className={styles.splash} role="status">
      <Loader label={label} />
    </div>
  )
}

/** Пускает в приложение только с валидными учётными данными GREEN-API. */
function RequireCredentials() {
  const { status } = useCredentials()
  const location = useLocation()

  if (status === 'checking') return <Splash label="Проверяем инстанс…" />
  if (status !== 'authorized') {
    return <Navigate to="/auth" replace state={{ from: location.pathname }} />
  }

  return (
    <ErrorBoundary title="Чат не загрузился">
      <Suspense fallback={<Splash label="Загружаем чат…" />}>
        <AuthenticatedRoutes />
      </Suspense>
    </ErrorBoundary>
  )
}

function AuthRoute() {
  const { status } = useCredentials()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from ?? '/'

  if (status === 'checking') return <Splash label="Проверяем инстанс…" />
  if (status === 'authorized') return <Navigate to={from} replace />

  return <Auth redirectTo={from} />
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/auth" element={<AuthRoute />} />
      <Route element={<RequireCredentials />}>
        <Route path="*" element={<AuthenticatedRoutes />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
