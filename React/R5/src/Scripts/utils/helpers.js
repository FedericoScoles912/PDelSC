/**
 * Helpers genéricos (sin dependencias externas).
 */

/**
 * Une clases CSS ignorando valores falsy.
 * Evita instalar `clsx`/`classnames` para algo tan simple.
 */
export function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

/** Iniciales de un nombre, para el avatar de respaldo. Máximo 2 letras. */
export function getInitials(name) {
  if (!name || typeof name !== 'string') return '?';

  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((part) => part[0]?.toUpperCase() ?? '').join('') || '?';
}

/** Fecha legible (ej: "12 mar 2026"). */
export function formatDate(value, locale = 'es-AR') {
  if (!value) return '';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  return new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

/** Navega a una URL absoluta (se usa para redirigir al proveedor OAuth). */
export function goTo(url) {
  window.location.assign(url);
}

/** Programa opcional: true si el valor es un objeto plano no nulo. */
export function isPlainObject(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
