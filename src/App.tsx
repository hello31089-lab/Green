import { BrowserRouter } from 'react-router-dom'
import './App.css'
import { AppRoutes } from './routes/AppRoutes'
import { ChatsProvider } from './providers/ChatsProvider'

function App() {
  return (
    <BrowserRouter>
      <ChatsProvider>
        <AppRoutes />
      </ChatsProvider>
    </BrowserRouter>
  )
}

export default App
