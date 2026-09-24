/**
 * Genera un ID numérico único.
 * Útil para listas de tareas, etc.
 *
 * @returns {number} ID entero único basado en timestamp + aleatorio
 */
export function generarId() {
  return Date.now() + Math.floor(Math.random() * 1000);
}

/**
 * Limita un número entre un mínimo y un máximo.
 *
 * @param {number} valor - Valor a clamp
 * @param {number} min - Límite inferior
 * @param {number} max - Límite superior
 * @returns {number}
 */
export function clamp(valor, min, max) {
  return Math.min(Math.max(valor, min), max);
}

/**
 * Capitaliza la primera letra de un string.
 *
 * @param {string} texto
 * @returns {string}
 */
export function capitalizar(texto) {
  if (!texto || typeof texto !== 'string') return '';
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}
