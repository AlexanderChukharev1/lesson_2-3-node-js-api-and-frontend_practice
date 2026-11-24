import { fileURLToPath } from 'node:url'

// Путь считается от файла модуля, а не от случайной текущей папки терминала.
export const dataDir = fileURLToPath(new URL('../data/', import.meta.url))
export const dataFile = fileURLToPath(new URL('../data/bookings.json', import.meta.url))
export const failFile = fileURLToPath(new URL('../data/.fail-next-write', import.meta.url))
