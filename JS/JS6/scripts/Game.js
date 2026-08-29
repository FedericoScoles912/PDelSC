/**
 * @class Game
 * @description Modelo puro del estado de una partida del ahorcado.
 *   No toca el DOM. Recibe la palabra en mayúsculas por constructor (o reset).
 *   Expone métodos para adivinar letras, consultar el display,
 *   contar errores, detectar fin de partida y calcular puntos.
 *   Intentos permitidos: 6 (por lo tanto 7 estados SVG de 0 a 6).
 *
 * @example
 *   const game = new Game("AHORCADO");
 *   game.guess("A");             // → { correct: true, gameOver: false, won: false }
 *   game.getDisplayWord();       // → ["A","_","_","_","A","_","A","_"]
 *   game.getAttemptsLeft();      // → 6
 */
export class Game {

  /** @type {string} Palabra original (mayúsculas, sin tildes). */
  #word;

  /** @type {Set<string>} Letras que forman la palabra. */
  #wordLetters;

  /** @type {Set<string>} Letras correctas ya adivinadas. */
  #correct;

  /** @type {Set<string>} Letras incorrectas ya intentadas. */
  #wrong;

  /** @type {boolean} Si la partida está ganada. */
  #won;

  /** @type {boolean} Si la partida está perdida. */
  #lost;

  /** @type {number} Máximo de errores permitidos. */
  static MAX_ATTEMPTS = 6;

  /**
   * @param {string} word Palabra objetivo (se normaliza a mayúsculas y sin tildes).
   * @throws {Error} Si la palabra es vacía o no contiene letras válidas.
   */
  constructor(word) {
    this.reset(word);
  }

  /**
   * Normaliza una cadena: quita tildes, pasa a mayúsculas, deja sólo A-Z y Ñ.
   * @param {string} s
   * @returns {string}
   * @private
   */
  #normalize(s) {
    if (typeof s !== 'string') return '';
    return s
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toUpperCase()
      .replace(/[^A-ZÑ]/g, '');
  }

  /**
   * Reinicia el estado del juego con una nueva palabra.
   * @param {string} newWord Nueva palabra objetivo.
   * @throws {Error} Si la palabra es inválida.
   */
  reset(newWord) {
    const w = this.#normalize(newWord);
    if (w.length === 0) {
      throw new Error('Game.reset requiere una palabra no vacía con letras válidas.');
    }
    this.#word = w;
    this.#wordLetters = new Set([...w]);
    this.#correct = new Set();
    this.#wrong = new Set();
    this.#won = false;
    this.#lost = false;
  }

  /**
   * Intenta adivinar una letra.
   * @param {string} letter Letra (de 1 carácter, sensible a mayúsculas).
   * @returns {{ correct: boolean, alreadyUsed: boolean, gameOver: boolean, won: boolean }}
   *   - correct:      true si la letra pertenece a la palabra.
   *   - alreadyUsed:  true si la letra ya había sido probada antes.
   *   - gameOver:     true si la partida terminó (ganó o perdió).
   *   - won:          true si la partida se ganó con este movimiento.
   */
  guess(letter) {
    const L = this.#normalize(letter).charAt(0);
    if (!L) return { correct: false, alreadyUsed: false, gameOver: this.#isOver(), won: this.#won };

    const alreadyUsed = this.#correct.has(L) || this.#wrong.has(L);
    if (this.#isOver() || alreadyUsed) {
      return { correct: false, alreadyUsed, gameOver: this.#isOver(), won: this.#won };
    }

    if (this.#wordLetters.has(L)) {
      this.#correct.add(L);
      if (this.#allRevealed()) this.#won = true;
      return { correct: true, alreadyUsed: false, gameOver: this.#isOver(), won: this.#won };
    }

    this.#wrong.add(L);
    if (this.#wrong.size >= Game.MAX_ATTEMPTS) this.#lost = true;
    return { correct: false, alreadyUsed: false, gameOver: this.#isOver(), won: false };
  }

  /**
   * @returns {boolean} true si todas las letras de la palabra fueron reveladas.
   * @private
   */
  #allRevealed() {
    for (const l of this.#wordLetters) {
      if (!this.#correct.has(l)) return false;
    }
    return true;
  }

  /**
   * @returns {boolean} true si la partida terminó.
   * @private
   */
  #isOver() {
    return this.#won || this.#lost;
  }

  /**
   * Devuelve la palabra como array, con letras reveladas y '_' para las ocultas.
   * @example palabra "HOLA", acertó "O" → ['_','O','_','_']
   * @returns {string[]}
   */
  getDisplayWord() {
    return [...this.#word].map(l => (this.#correct.has(l) ? l : '_'));
  }

  /**
   * @returns {string[]} Array con letras incorrectas, en orden de inserción.
   */
  getWrongGuesses() {
    return [...this.#wrong];
  }

  /**
   * @returns {string[]} Array con letras correctas, en orden de inserción.
   */
  getCorrectGuesses() {
    return [...this.#correct];
  }

  /**
   * @returns {number} Intentos restantes (0..6).
   */
  getAttemptsLeft() {
    return Math.max(0, Game.MAX_ATTEMPTS - this.#wrong.size);
  }

  /**
   * @returns {number} Errores cometidos (estado del dibujo SVG, 0..6).
   */
  getStage() {
    return this.#wrong.size;
  }

  /**
   * @returns {string} La palabra completa original.
   */
  getWord() {
    return this.#word;
  }

  /**
   * @returns {boolean} Si la partida está ganada.
   */
  isWon() {
    return this.#won;
  }

  /**
   * @returns {boolean} Si la partida está perdida.
   */
  isLost() {
    return this.#lost;
  }

  /**
   * Calcula los puntos finales de una partida GANADA.
   * Fórmula:
   *   base = 100
   *   descuento = -10 por error
   *   bonus por tiempo:
   *     < 30s  → +50
   *     30-60  → +25
   *     60-120 → +10
   *     >120   → +0
   * Si la partida no fue ganada, devuelve 0.
   *
   * @param {number} seconds Tiempo total jugado, en segundos.
   * @returns {number} Puntos enteros no negativos.
   */
  calculatePoints(seconds = 0) {
    if (!this.#won) return 0;
    const base = 100;
    const disc = this.#wrong.size * 10;
    const sec  = typeof seconds === 'number' && seconds >= 0 ? seconds : 0;
    let bonus = 0;
    if (sec < 30)       bonus = 50;
    else if (sec < 60)  bonus = 25;
    else if (sec < 120) bonus = 10;
    return Math.max(0, base - disc + bonus);
  }
}
