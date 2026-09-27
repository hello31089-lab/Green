import type { ChatState } from '../types/chat'

export const mockChatState: ChatState = {
  chats: [
    {
      id: 'chat-1',
      name: 'Мама',
      lastMessage: 'Обед готов, не забывай поесть',
      lastMessageAt: '12:40',
      unreadCount: 2,
    },
    {
      id: 'chat-2',
      name: 'Green API Support',
      lastMessage: 'Ваш инстанс готов к работе',
      lastMessageAt: '11:15',
      unreadCount: 0,
    },
    {
      id: 'chat-3',
      name: 'Анна',
      lastMessage: 'Скинь ссылку на макет, пж',
      lastMessageAt: '09:02',
      unreadCount: 1,
    },
    {
      id: 'chat-4',
      name: 'Frontend Team',
      lastMessage: 'Пул на мержа через 10 минут',
      lastMessageAt: 'Вчера',
      unreadCount: 0,
    },
  ],
  messages: {
    'chat-1': [
      {
        id: 'msg-1',
        chatId: 'chat-1',
        authorId: 'chat-1',
        text: 'Привет! Ты не забыл про врача?',
        timestamp: '12:38',
        direction: 'in',
        status: 'read',
      },
      {
        id: 'msg-2',
        chatId: 'chat-1',
        authorId: 'me',
        text: 'Нет, записался на пятницу',
        timestamp: '12:39',
        direction: 'out',
        status: 'read',
      },
      {
        id: 'msg-3',
        chatId: 'chat-1',
        authorId: 'chat-1',
        text: 'Обед готов, не забывай поесть',
        timestamp: '12:40',
        direction: 'in',
        status: 'sent',
      },
    ],
    'chat-2': [
      {
        id: 'msg-4',
        chatId: 'chat-2',
        authorId: 'chat-2',
        text: 'Здравствуйте! Ваш инстанс готов к работе',
        timestamp: '11:14',
        direction: 'in',
        status: 'read',
      },
      {
        id: 'msg-5',
        chatId: 'chat-2',
        authorId: 'me',
        text: 'Спасибо, всё работает',
        timestamp: '11:15',
        direction: 'out',
        status: 'read',
      },
    ],
    'chat-3': [
      {
        id: 'msg-6',
        chatId: 'chat-3',
        authorId: 'chat-3',
        text: 'Скинь ссылку на макет, пж',
        timestamp: '09:02',
        direction: 'in',
        status: 'sent',
      },
    ],
    'chat-4': [],
  },
}
