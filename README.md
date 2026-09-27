# MAX-чат через GREEN-API

Прототип интерфейса мессенджера MAX (https://web.max.ru/) для отправки и получения
текстовых сообщений через [GREEN-API](https://green-api.com/max).

Стек: React 19 + TypeScript + Vite, сборка и деплой — Vercel.

## Возможности

- Подключение к инстансу GREEN-API по `idInstance` и `apiTokenInstance`
- Проверка инстанса через `GetStateInstance` перед входом
- Список чатов с поиском, непрочитанными счётчиками и статусами
- Переписка, оформленная как в MAX: пузыри, карточка кода, тёмная тема
- Адаптивная вёрстка: на мобильных список чатов уезжает вбок

## Запуск

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # tsc -b && vite build
npm run preview
npm run lint
npm run format
```

## Переменные окружения

Обязательных переменных нет: пользователь вводит учётные данные инстанса
в интерфейсе, они сохраняются в `localStorage` браузера.
`.env.example` — заготовка на случай, если понадобится инстанс по умолчанию.

## Как устроена интеграция

Браузер не ходит в GREEN-API напрямую. Все запросы идут через serverless-функцию
`api/green-api.ts` (Vercel), потому что:

1. GREEN-API не отдаёт CORS-заголовки для cross-origin вызовов из браузера.
2. `apiTokenInstance` входит в путь URL GREEN-API — напрямую из клиента он
   осел бы в истории браузера и в devtools.

Клиент шлёт `POST /api/green-api` с заголовками `x-green-id-instance`,
`x-green-token` и телом `{ method, payload }`. Функция держит белый список
методов, собирает URL GREEN-API и проксирует ответ как есть.

Обработчик лежит в `server/greenApiProxy.ts`. Его используют обе точки входа:
`api/green-api.ts` — serverless-функция на Vercel, и dev-сервер Vite
(плагин `greenApiDevProxy` в `vite.config.ts`). Поэтому `npm run dev` тоже
работает: Vite монтирует тот же обработчик на `/api/green-api`.
Без этого плагина подключение инстанса падало бы с 404 — serverless-функции
выполняет только Vercel, обычный Vite про `/api` ничего не знает.

| Задача               | Метод GREEN-API                              |
| -------------------- | -------------------------------------------- |
| Проверка инстанса    | `GetStateInstance`                           |
| Отправка текста      | `SendMessage`                                |
| Входящие уведомления | `ReceiveNotification` + `DeleteNotification` |

Для приёма сообщений в настройках инстанса `webhookUrl` должен быть пустым,
а `incomingWebhook` / `outgoingWebhook` / `stateWebhook` — включены
(настраивается в личном кабинете или через `SetSettings`).

## Деплой на Vercel

```bash
npx vercel
```

`vercel.json` содержит rewrite для SPA, чтобы `/chat/:id` переживал перезагрузку
страницы. Функция `api/green-api.ts` задеплоится как serverless-функция.

## Ограничения прототипа

- Токен хранится в `localStorage`, то есть доступен скриптам на этой странице.
  Для продакшена нужны serverless-сессии или бэкенд.
- `idInstance` и `apiTokenInstance` передаются в serverless-функцию из браузера
  пользователя. Это токен самого пользователя, секретов приложения в репозитории нет.
- Состояние чатов пока хранится в `localStorage` и заполняется моками
  из `src/mock/chats.ts`; переход на реальные данные GREEN-API — следующий шаг.
