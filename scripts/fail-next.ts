import { mkdir, writeFile, rm } from 'node:fs/promises'
import { config } from '../server/config.ts'
import { dataDir, failFile } from '../server/paths.ts'

// Шаг 12: управление одним локальным учебным сбоем, без изменения заявок.
if (process.argv.includes('--clear')) {
  await rm(failFile, { force: true })
  console.log('Маркер сбоя удалён.')
} else {
  if (config.storage !== 'file') {
    console.error('Сначала выполните шаги 7–8: этот опыт требует файлового хранилища.')
    process.exit(1)
  }
  await mkdir(dataDir, { recursive: true })
  await writeFile(failFile, 'fail once before writing\n', 'utf8')
  console.log('Следующая запись завершится ошибкой. GET не потребляет маркер.')
}
