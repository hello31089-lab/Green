import { BrowserRouter } from 'react-router-dom'
import './App.css'
import { AppRoutes } from './routes/AppRoutes'
import { CredentialsProvider } from './providers/CredentialsProvider'

function App() {
  return (
    <BrowserRouter>
      <CredentialsProvider>
        <AppRoutes />
      </CredentialsProvider>
    </BrowserRouter>
  )
}

export default App
