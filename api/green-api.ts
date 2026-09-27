/**
 * Точка входа serverless-функции для Vercel.
 *
 * Сам обработчик лежит в `server/greenApiProxy.ts`, потому что его же
 * монтирует dev-сервер Vite (см. `vite.config.ts`) — иначе `npm run dev`
 * отдавал бы 404 на `/api/green-api` и подключение инстанса не работало бы.
 */

export { greenApiHandler as default } from '../server/greenApiProxy.js'
