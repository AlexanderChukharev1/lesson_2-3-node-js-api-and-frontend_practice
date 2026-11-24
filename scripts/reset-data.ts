import { mkdir, writeFile, rename, rm } from 'node:fs/promises'
import { createConnection } from 'node:net'
import { initialBookings } from '../src/models/booking.ts'
import { dataDir, dataFile, failFile } from '../server/paths.ts'

if (!process.argv.includes('--yes')) {
  console.log('Сброс заменит data/bookings.json исходными Анной и Иваном.')
  console.log('Остановите API. Затем: npm run data:reset -- --yes')
  process.exit(1)
}
const running = await new Promise<boolean>((resolve) => {
  const socket = createConnection({ host: '127.0.0.1', port: 3001 })
  socket.once('connect', () => { socket.destroy(); resolve(true) })
  socket.once('error', () => resolve(false))
  socket.setTimeout(1000, () => { socket.destroy(); resolve(true) })
})
if (running) {
  console.error('Порт 3001 занят. Сначала остановите API; сброс не выполнен.')
  process.exit(1)
}
await mkdir(dataDir, { recursive: true })
await writeFile(dataFile + '.tmp', JSON.stringify(initialBookings(), null, 2) + '\n', 'utf8')
await rename(dataFile + '.tmp', dataFile)
await rm(failFile, { force: true })
console.log('Учебные данные сброшены: 2 заявки, 2 участника. Код не изменён.')
