import { Route, Routes } from 'react-router-dom'
import { ChatsProvider } from '../providers/ChatsProvider'
import { AppLayout } from './AppLayout'
import { Home } from '../pages/Home'
import { Chat } from '../pages/Chat'

export function AuthenticatedRoutes() {
  return (
    <ChatsProvider>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/chat/:chatId" element={<Chat />} />
        </Route>
      </Routes>
    </ChatsProvider>
  )
}

export default AuthenticatedRoutes
