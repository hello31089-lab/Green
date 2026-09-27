import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import { defineConfig } from 'vite'
import type { Plugin } from 'vite'
import { greenApiHandler } from './server/greenApiProxy.js'
import type { ProxyRequest, ProxyResponse } from './server/greenApiProxy.js'

/**
 * Serverless-функции выполняет только Vercel, а `npm run dev` поднимает
 * обычный Vite, где `/api/green-api` ждал бы 404. Монтируем тот же
 * обработчик в dev-сервер, чтобы локальная разработка вела себя так же,
 * как прод.
 */
function greenApiDevProxy(): Plugin {
  return {
    name: 'green-api-dev-proxy',
    configureServer(server) {
      server.middlewares.use('/api/green-api', (req, res, next) => {
        if (req.method !== 'POST') {
          next()
          return
        }

        const chunks: Buffer[] = []
        req.on('data', (chunk: Buffer) => chunks.push(chunk))
        req.on('end', () => {
          const response: ProxyResponse = {
            status(code) {
              res.statusCode = code
              return response
            },
            setHeader(name, value) {
              res.setHeader(name, value)
            },
            json(body) {
              res.setHeader('Content-Type', 'application/json; charset=utf-8')
              res.end(JSON.stringify(body))
            },
          }

          const request: ProxyRequest = {
            method: req.method,
            headers: req.headers,
            body: Buffer.concat(chunks).toString('utf8'),
          }

          greenApiHandler(request, response).catch(() => {
            if (res.headersSent) return
            response.status(500).json({ status: 'error', message: 'Прокси не отработал' })
          })
        })
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), babel({ presets: [reactCompilerPreset()] }), greenApiDevProxy()],
})
