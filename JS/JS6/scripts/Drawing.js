/**
 * @class Drawing
 * @description Renderiza progresivamente el dibujo SVG del ahorcado.
 *   Se apoya en grupos <g class="hangman-part stage-{n}"> del HTML.
 *   Estados (stages):
 *     0 → sin partes visibles (solo loader, o stage-1 puede ser la horca).
 *     1 → horca (base + poste + travesaño + cuerda).
 *     2 → cabeza.
 *     3 → cuerpo.
 *     4 → brazo izquierdo.
 *     5 → brazo derecho.
 *     6 → piernas.
 *   La clase sólo manipula la presencia de la clase `.hangman-visible`
 *   y una pequeña demora entre partes para apreciar la animación SVG.
 *
 * @example
 *   const svg = document.getElementById('hangmanSvg');
 *   const d = new Drawing(svg);
 *   d.setStage(3);   // horca + cabeza + cuerpo visibles.
 */
export class Drawing {

  /** @type {SVGSVGElement|null} */
  #svg;

  /** @type {Map<number, SVGElement>} stage → element */
  #parts = new Map();

  /** @type {number} Estado actual (0..6). */
  #stage = 0;

  /**
   * @param {SVGSVGElement|HTMLElement} svgElement Elemento SVG con las partes.
   * @throws {Error} Si el elemento no existe o no contiene las partes esperadas.
   */
  constructor(svgElement) {
    if (!svgElement) throw new Error('Drawing requiere un elemento SVG.');
    this.#svg = svgElement;
    for (let i = 1; i <= 6; i++) {
      const el = svgElement.querySelector(`.stage-${i}`);
      if (el) this.#parts.set(i, el);
    }
    this.reset();
  }

  /**
   * Devuelve el estado actual del dibujo.
   * @returns {number} Entero 0..6.
   */
  getStage() {
    return this.#stage;
  }

  /**
   * Oculta todas las partes y deja el dibujo en stage 0.
   * Nota: el stage 1 (horca) se mostrará cuando setStage(1) o superior.
   * Pero por convención la horca suele verse desde el comienzo para dar
   * contexto visual. Este método permite elegir el comportamiento.
   *
   * @param {boolean} [showGallows=true] Si es true, muestra la horca (stage=1).
   */
  reset(showGallows = true) {
    this.#parts.forEach(el => el.classList.remove('hangman-visible'));
    this.#stage = 0;
    if (showGallows) this.setStage(1, { immediate: true });
  }

  /**
   * Avanza o retrocede el dibujo hasta el stage indicado.
   * Cada parte con delay (opcional) para apreciar la animación SVG.
   *
   * @param {number} stage Valor 0..6 (6 = hombre completo).
   * @param {{immediate?: boolean}} [opts]
   * @returns {Promise<void>} Resuelve cuando terminan las animaciones.
   */
  async setStage(stage, opts = {}) {
    const target = Math.max(0, Math.min(6, stage | 0));
    const immediate = !!opts.immediate;

    if (target === this.#stage) return;

    if (target < this.#stage) {
      for (let s = this.#stage; s > target; s--) {
        const el = this.#parts.get(s);
        if (el) el.classList.remove('hangman-visible');
      }
      this.#stage = target;
      return;
    }

    for (let s = this.#stage + 1; s <= target; s++) {
      const el = this.#parts.get(s);
      if (el) {
        el.classList.remove('hangman-visible');
        void el.getBoundingClientRect();
        el.classList.add('hangman-visible');
        if (!immediate) await Drawing.#sleep(320);
      }
    }
    this.#stage = target;
  }

  /**
   * Avanza exactamente una etapa (un intento fallido).
   * @returns {Promise<number>} El nuevo stage.
   */
  async nextStage() {
    const nxt = Math.min(6, this.#stage + 1);
    await this.setStage(nxt);
    return this.#stage;
  }

  /**
   * @param {number} ms
   * @returns {Promise<void>}
   * @private
   */
  static #sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
  }
}
