import { defineConfig } from 'vite'

// Готово: браузер обращается к своему /api, Vite передаёт запрос серверу Node.js.
// Шаг 11: при остановленном API ошибка может прийти от этого proxy.
const proxy = { '/api': 'http://127.0.0.1:3001' }
export default defineConfig({
  server: { host: '127.0.0.1', port: 5173, strictPort: true, proxy },
  preview: { host: '127.0.0.1', port: 4173, strictPort: true, proxy },
})
