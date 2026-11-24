import type { Booking } from '../../src/models/booking.ts'
import { initialBookings } from '../../src/models/booking.ts'
import { readBookings, writeBookings } from './file-bookings.ts'

// Готовая инфраструктура. Студенты работают с list/add/confirm, а не пишут очередь.
// Один процесс выполняет весь цикл чтение → изменение → запись последовательно.
export function createStore(mode: 'memory' | 'file') {
  let memory = initialBookings()
  let tail: Promise<unknown> = Promise.resolve()
  function serial<T>(operation: () => Promise<T>): Promise<T> {
    const next = tail.then(operation)
    tail = next.catch(() => undefined) // Ошибка одной записи не останавливает очередь.
    return next
  }
  const read = async () => mode === 'file' ? readBookings() : structuredClone(memory)
  const write = async (rows: Booking[]) => {
    if (mode === 'file') await writeBookings(rows)
    else memory = structuredClone(rows)
  }
  return {
    list: () => serial(read),
    add: (booking: Booking) => serial(async () => {
      const rows = await read()
      await write([...rows, booking])
      return booking
    }),
    confirm: (id: string) => serial(async (): Promise<Booking | null> => {
      const rows = await read()
      const index = rows.findIndex(row => row.id === id)
      if (index < 0) return null
      if (rows[index].status === 'confirmed') return rows[index]
      const updated: Booking = { ...rows[index], status: 'confirmed' }
      rows[index] = updated
      await write(rows)
      return updated
    }),
  }
}
export type BookingStore = ReturnType<typeof createStore>
