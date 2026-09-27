import './App.css'
import { Chat } from './pages/Chat'

function App() {
  return (
    <>
      <Chat chats={[]} messages={[]} onSelectChat={() => {}} onSend={() => {}} />
    </>
  )
}

export default App
