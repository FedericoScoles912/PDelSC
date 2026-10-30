/**
 * Constantes compartidas por ambos sistemas.
 */

/** Claves de localStorage. Prefijo `uas.` (user-auth-system). */
export const STORAGE_KEYS = {
  TOKEN: 'uas.token',
  THEME: 'uas.theme',
  SYSTEM: 'uas.system',
};

/** Identificadores de los dos sistemas de frontend paralelos. */
export const SYSTEMS = {
  ROUTER: 'router', // Sistema A - navegación con React Router
  STATE: 'state', // Sistema B - navegación con useState
};

/** Etiquetas legibles para mostrar en la UI. */
export const SYSTEM_LABELS = {
  [SYSTEMS.ROUTER]: 'Sistema A · React Router',
  [SYSTEMS.STATE]: 'Sistema B · useState',
};

/** Todos los sistemas válidos (para validar el parámetro `system`). */
export const SYSTEM_IDS = Object.values(SYSTEMS);

/** Normaliza un valor arbitrario a un sistema válido (por defecto: router). */
export function normalizeSystem(value) {
  return SYSTEM_IDS.includes(value) ? value : SYSTEMS.ROUTER;
}

/** Mensajes genéricos reutilizados en la UI. */
export const MESSAGES = {
  NETWORK_ERROR: 'No pudimos conectar con el servidor. Verificá tu conexión.',
  SESSION_EXPIRED: 'Tu sesión expiró. Volvé a iniciar sesión.',
};
