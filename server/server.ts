import { createServer } from 'node:http'
import { config } from './config.ts'
import { createStore } from './storage/index.ts'
import { routeBookings } from './routes/bookings.ts'
import { HttpError, sendJson } from './http.ts'

const store = createStore(config.storage)
// Готово: API доступен только на локальном компьютере.
const server = createServer((req, res) => {
  void (async () => {
    try {
      const url = new URL(req.url ?? '/', 'http://127.0.0.1:3001')
      // Проверяем корректность кодирования до извлечения id.
      try { decodeURIComponent(url.pathname) }
      catch { throw new HttpError(400, 'BAD_URL', 'Некорректный адрес запроса.') }
      if (url.pathname === '/api/health' && req.method === 'GET') {
        sendJson(res, 200, { data: { ok: true, storage: config.storage } })
        return
      }
      await routeBookings(req, res, url.pathname, store)
    } catch (error) {
      if (res.destroyed || res.writableEnded) return
      const status = error instanceof HttpError ? error.status : 500
      if (status === 500) console.error('Ошибка API:', error)
      sendJson(res, status, { error: {
        code: error instanceof HttpError ? error.code : 'INTERNAL',
        message: error instanceof HttpError ? error.message : 'Не удалось выполнить операцию. Проверьте терминал API.',
      } })
    }
  })()
})
server.requestTimeout = 15_000
server.on('error', (error) => {
  console.error('API не запущен. Проверьте, свободен ли порт 3001.', error.message)
  process.exitCode = 1
})
server.listen(3001, '127.0.0.1', () => {
  console.log('API: http://127.0.0.1:3001 · хранилище: ' + config.storage)
  console.log('После правок server/ остановите процесс Ctrl+C и запустите снова.')
})
