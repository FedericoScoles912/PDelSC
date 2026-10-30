import { env } from './env.js';

const ALLOWED_SYSTEMS = ['router', 'state'];

/** Normaliza el sistema de frontend de destino (Sistema A o B). */
export function normalizeSystem(value) {
  return ALLOWED_SYSTEMS.includes(value) ? value : 'router';
}

/**
 * Construye una URL de redirección hacia el frontend.
 *
 * - `path` debe ser SIEMPRE relativo (empieza con '/'): así se evita un
 *   open redirect usando el backend como trampolín.
 * - El parámetro `system` indica a qué sistema (A: router, B: state) debe
 *   volver el SPA.
 */
export function buildFrontendUrl({ system, path = '/auth/callback', params = {} } = {}) {
  const safePath = typeof path === 'string' && path.startsWith('/') ? path : '/';

  const url = new URL(safePath, env.frontendUrl);
  url.searchParams.set('system', normalizeSystem(system));

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue;
    url.searchParams.set(key, String(value));
  }

  return url.toString();
}
