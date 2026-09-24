/**
 * Utilidad para formatear una fecha ISO a string legible en español.
 * @param {string} isoFecha - Fecha en formato ISO 8601
 * @returns {string} Fecha formateada, ej. "15 sep. 2024, 09:30"
 */
export function formatearFecha(isoFecha) {
  try {
    const fecha = new Date(isoFecha);
    return fecha.toLocaleString('es-AR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return 'Fecha no disponible';
  }
}

/**
 * Trunca un string a la cantidad máxima de caracteres indicada.
 * @param {string} texto - Texto a truncar
 * @param {number} max - Cantidad máxima de caracteres
 * @returns {string} Texto truncado con "..." al final si corresponde
 */
export function truncarTexto(texto, max = 120) {
  if (!texto || typeof texto !== 'string') return '';
  if (texto.length <= max) return texto;
  return texto.slice(0, max).trimEnd() + '...';
}

/**
 * Genera un id único basado en timestamp + random.
 * Alternativa a crypto.randomUUID() para entornos donde no esté disponible.
 * @returns {string}
 */
export function generarId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}
