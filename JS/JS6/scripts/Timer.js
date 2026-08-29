/**
 * @class Timer
 * @description Cronómetro ascendente simple. Cuenta segundos jugados.
 *   Cada 1s emite un CustomEvent 'timer:tick' en el `document`, con
 *   `detail = { seconds, formatted }`. Puede pausarse, resumirse y resetearse.
 *
 * @example
 *   const t = new Timer();
 *   document.addEventListener('timer:tick', (e) => {
 *     console.log(e.detail.seconds, e.detail.formatted); // 1, "00:01"
 *   });
 *   t.start();
 */
export class Timer {

  /** @type {number} Interval id (o 0 si no está corriendo). */
  #intervalId = 0;

  /** @type {number} Segundos contados. */
  #seconds = 0;

  /** @type {boolean} Si el cronómetro está activo. */
  #running = false;

  /**
   * Devuelve el tiempo en formato MM:SS (o HH:MM:SS si ≥ 1 hora).
   * @param {number} totalSeconds
   * @returns {string}
   */
  static format(totalSeconds) {
    const s = Math.max(0, totalSeconds | 0);
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    const pad = (n) => String(n).padStart(2, '0');
    return h > 0 ? `${pad(h)}:${pad(m)}:${pad(sec)}` : `${pad(m)}:${pad(sec)}`;
  }

  /**
   * Comienza a correr el cronómetro desde el valor actual.
   * Emite 'timer:tick' cada segundo.
   * @fires document#timer:tick
   */
  start() {
    if (this.#running) return;
    this.#running = true;
    this.#emit();
    this.#intervalId = window.setInterval(() => {
      this.#seconds++;
      this.#emit();
    }, 1000);
  }

  /**
   * Detiene el cronómetro pero conserva los segundos.
   */
  stop() {
    if (this.#intervalId) {
      clearInterval(this.#intervalId);
      this.#intervalId = 0;
    }
    this.#running = false;
  }

  /**
   * Pone a cero el cronómetro (y lo detiene si estaba corriendo).
   */
  reset() {
    this.stop();
    this.#seconds = 0;
    this.#emit();
  }

  /**
   * Resetea y comienza a contar desde cero de inmediato.
   */
  restart() {
    this.reset();
    this.start();
  }

  /**
   * @returns {number} Segundos acumulados.
   */
  getSeconds() {
    return this.#seconds;
  }

  /**
   * @returns {string} Tiempo formateado como MM:SS (o HH:MM:SS).
   */
  getFormattedTime() {
    return Timer.format(this.#seconds);
  }

  /**
   * @returns {boolean} Si el cronómetro está corriendo actualmente.
   */
  isRunning() {
    return this.#running;
  }

  /**
   * Emite el evento 'timer:tick' por el document.
   * @private
   */
  #emit() {
    document.dispatchEvent(new CustomEvent('timer:tick', {
      detail: {
        seconds: this.#seconds,
        formatted: this.getFormattedTime(),
      },
    }));
  }
}
