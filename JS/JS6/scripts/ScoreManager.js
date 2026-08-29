/**
 * @class ScoreManager
 * @description Maneja la comunicación con la API REST del backend para scores.
 *   Usa fetch() con async/await. Maneja errores de red con try/catch
 *   y delega la notificación al UIController (popup tipo 'error').
 *   Cuando saveScore falla, guarda el score en sessionStorage como respaldo
 *   para no perder los datos del jugador.
 *
 * @example
 *   const sm = new ScoreManager('http://localhost:3000', ui);
 *   const scores = await sm.getScores();
 *   const saved  = await sm.saveScore('Ana', 150, 25);
 */
export class ScoreManager {

  /** @type {string} URL base del servidor (sin trailing slash). */
  #baseUrl;

  /** @type {import('./UIController.js').UIController|null} */
  #ui;

  /** @type {string} Clave de sessionStorage para scores pendientes. */
  static PENDING_KEY = 'ahorcado_pending_score';

  /**
   * @param {string} [baseUrl] URL base del servidor, ej: "http://localhost:3000".
   *   Si se omite, usa window.location.origin (para cuando los estáticos son servidos
   *   por el mismo servidor).
   * @param {object|null} [uiController] Instancia de UIController para mostrar popups de error.
   */
  constructor(baseUrl, uiController = null) {
    if (baseUrl) {
      this.#baseUrl = baseUrl.replace(/\/$/, '');
    } else {
      this.#baseUrl = (typeof window !== 'undefined' && window.location?.origin) || '';
    }
    this.#ui = uiController || null;
  }

  /**
   * GET /api/scores — lista de scores ordenados (máx 20).
   * @async
   * @returns {Promise<Array<{id:number,nombre:string,puntos:number,tiempo:number,fecha:string}>>}
   * @throws {Error} Si falla la conexión o el servidor devuelve error estructurado.
   */
  async getScores() {
    try {
      const url = `${this.#baseUrl}/api/scores`;
      const res = await fetch(url, { method: 'GET', headers: { Accept: 'application/json' } });
      const ct  = res.headers.get('content-type') || '';
      const body = ct.includes('application/json') ? await res.json() : null;

      if (!res.ok) {
        const msg = body?.message || `Error ${res.status} al obtener scores.`;
        throw new Error(msg);
      }
      return Array.isArray(body) ? body : [];
    } catch (err) {
      const msg = err?.message || 'No se pudo conectar con el servidor.';
      if (this.#ui && typeof this.#ui.showPopup === 'function') {
        // No mostramos popup aquí de forma predeterminada para no ser intrusivos
        // al cargar la tabla. El consumidor puede decidir.
      }
      throw new Error(msg);
    }
  }

  /**
   * POST /api/scores — guarda un nuevo score.
   *   En caso de error, guarda el score en sessionStorage como respaldo.
   *
   * @async
   * @param {string} nombre Nombre del jugador (máx 60 chars).
   * @param {number} puntos Puntuación (entero ≥ 0).
   * @param {number} tiempo Tiempo en segundos (entero ≥ 0).
   * @returns {Promise<{id:number,nombre:string,puntos:number,tiempo:number,fecha:string}>}
   *   Score guardado con su id y fecha.
   * @throws {Error} Si falla la validación del servidor o la conexión.
   */
  async saveScore(nombre, puntos, tiempo) {
    const payload = {
      nombre: String(nombre || '').trim().slice(0, 60),
      puntos: Number(puntos) | 0,
      tiempo: Number(tiempo) | 0,
    };

    try {
      const url = `${this.#baseUrl}/api/scores`;
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const ct = res.headers.get('content-type') || '';
      const body = ct.includes('application/json') ? await res.json() : null;

      if (!res.ok) {
        const msg = body?.message || `Error ${res.status} al guardar el score.`;
        throw new Error(msg);
      }

      ScoreManager.#clearPending();
      return body;
    } catch (err) {
      ScoreManager.#setPending(payload);
      const msg = err?.message || 'Error de conexión al guardar. El score se guardó temporalmente en tu navegador.';
      if (this.#ui && typeof this.#ui.showPopup === 'function') {
        this.#ui.showPopup('No se pudo guardar el score', msg, 'error');
      }
      throw new Error(msg);
    }
  }

  /**
   * Devuelve el score pendiente (si hubo un fallo previo) o null.
   * @returns {null|{nombre:string,puntos:number,tiempo:number}}
   */
  static getPending() {
    try {
      const raw = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem(this.PENDING_KEY) : null;
      if (!raw) return null;
      const obj = JSON.parse(raw);
      if (!obj || typeof obj.nombre !== 'string') return null;
      return obj;
    } catch (_) {
      return null;
    }
  }

  /**
   * Guarda un score como pendiente en sessionStorage.
   * @param {{nombre:string,puntos:number,tiempo:number}} payload
   * @private
   */
  static #setPending(payload) {
    try {
      sessionStorage.setItem(this.PENDING_KEY, JSON.stringify(payload));
    } catch (_) { /* storage no disponible */ }
  }

  /**
   * Limpia el score pendiente.
   * @private
   */
  static #clearPending() {
    try {
      sessionStorage.removeItem(this.PENDING_KEY);
    } catch (_) { /* storage no disponible */ }
  }
}
