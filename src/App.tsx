import { BrowserRouter } from 'react-router-dom'
import './App.css'
import { AppRoutes } from './routes/AppRoutes'
import { ChatsProvider } from './providers/ChatsProvider'
import { CredentialsProvider } from './providers/CredentialsProvider'

function App() {
  return (
    <BrowserRouter>
      <CredentialsProvider>
        <ChatsProvider>
          <AppRoutes />
        </ChatsProvider>
      </CredentialsProvider>
    </BrowserRouter>
  )
}

export default App
