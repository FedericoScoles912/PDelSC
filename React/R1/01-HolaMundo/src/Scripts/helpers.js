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

/**
 * Expresión regular: solo letras (incluye tildes, ñ, ü y espacios/apóstrofes).
 * Pensada para nombres de personas en español.
 */
export const SOLO_LETRAS_REGEX = /^[A-Za-zÁÉÍÓÚáéíóúÑñÜü´'’\s-]*$/;

/**
 * Elimina de un texto todo carácter que no sea letra (válida para nombres).
 * Mantiene tildes, ñ, ü, espacios, guiones y apóstrofes.
 *
 * @param {string} texto - Entrada a limpiar
 * @returns {string} Texto filtrado sin caracteres inválidos
 */
export function filtrarSoloLetras(texto) {
  if (!texto || typeof texto !== 'string') return '';
  const invalidos = /[^A-Za-zÁÉÍÓÚáéíóúÑñÜü´'’\s-]/g;
  return texto.replace(invalidos, '');
}

/**
 * Valida que un texto contenga SÓLO letras (y espacios).
 *
 * @param {string} texto
 * @returns {boolean} `true` si es válido, `false` en caso contrario
 */
export function esSoloLetras(texto) {
  if (!texto || typeof texto !== 'string') return false;
  return SOLO_LETRAS_REGEX.test(texto);
}
