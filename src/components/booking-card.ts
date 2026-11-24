import type { Booking } from '../models/booking.ts'

// Готовая карточка из 2–2: данные внутрь, событие с id наружу.
// Шаг 10: API вызывается в main.ts; компонент не знает адреса сервера.
export class BookingCard extends HTMLElement {
  private current: Booking | null = null
  private pending = false
  private nameText = document.createElement('h3')
  private seatsText = document.createElement('p')
  private statusText = document.createElement('span')
  private groupText = document.createElement('p')
  private button = document.createElement('button')

  constructor() {
    super()
    const style = document.createElement('style')
    style.textContent = `
      :host { display:block; min-width:0; font-family:inherit; }
      article { border:1px solid #d7dfd6; border-radius:12px; padding:18px; background:#fff; color:#263b31; }
      h3 { margin:0 0 10px; overflow-wrap:anywhere; font-size:19px; }
      p { margin:8px 0; } span { display:inline-block; font-size:13px; background:#edf2e8; padding:4px 9px; border-radius:20px; }
      button { margin-top:8px; background:var(--booking-accent,#315b47); color:white; border:0; border-radius:7px; padding:9px 14px; font:inherit; cursor:pointer; }
      button:disabled { background:#e4e8e0; color:#576453; cursor:default; }
      button:focus-visible { outline:3px solid #a15c00; outline-offset:3px; }
    `
    const article = document.createElement('article')
    this.button.type = 'button'
    article.append(this.nameText, this.statusText, this.seatsText, this.groupText, this.button)
    this.attachShadow({ mode: 'open' }).append(style, article)
    this.render()
  }
  set booking(value: Booking) { this.current = value; this.render() }
  set busy(value: boolean) { this.pending = value; this.render() }

  private render() {
    const booking = this.current
    this.nameText.textContent = booking?.name ?? 'Ожидаю данные'
    this.seatsText.textContent = booking ? `Участников: ${booking.seats}` : ''
    this.statusText.textContent = booking?.status === 'confirmed' ? 'Подтверждена' : 'Новая'
    this.groupText.textContent = booking ? (booking.seats === 1 ? 'Индивидуально' : 'Группа') : ''
    this.button.textContent = booking?.status === 'confirmed' ? 'Подтверждено' : 'Подтвердить'
    this.button.disabled = !booking || booking.status === 'confirmed' || this.pending
  }
  private onConfirm = () => {
    if (!this.current || this.pending || this.current.status === 'confirmed') return
    this.dispatchEvent(new CustomEvent('booking-confirm', {
      detail: { id: this.current.id }, bubbles: true,
    }))
  }
  connectedCallback() { this.button.addEventListener('click', this.onConfirm) }
  disconnectedCallback() { this.button.removeEventListener('click', this.onConfirm) }
}
customElements.define('booking-card', BookingCard)
