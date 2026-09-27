import { Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from './AppLayout'
import { Home } from '../pages/Home'
import { Chat } from '../pages/Chat'

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/chat/:chatId" element={<Chat />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
