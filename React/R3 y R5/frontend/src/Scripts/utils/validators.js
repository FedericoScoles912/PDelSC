export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Valida email (devolución simple booleana).
 * @param {string} value
 */
export const isEmail = (value) => typeof value === 'string' && EMAIL_RE.test(value.trim());

/**
 * Valida que una contraseña tenga min 8 chars, al menos una letra y un número.
 * @param {string} value
 */
export function isValidPassword(value) {
  if (typeof value !== 'string') return false;
  if (value.length < 8 || value.length > 128) return false;
  if (!/[A-Za-z]/.test(value)) return false;
  if (!/[0-9]/.test(value)) return false;
  return true;
}

/**
 * Valida displayName (2-100 caracteres).
 */
export function isValidDisplayName(value) {
  if (typeof value !== 'string') return false;
  const t = value.trim();
  return t.length >= 2 && t.length <= 100;
}

/**
 * Normaliza un error devuelto por axios/interceptors a un formato consumible por forms.
 * @param {any} err
 * @returns {{message: string, fields?: Record<string,string>}}
 */
export function normalizeError(err) {
  const data = err?.response?.data;
  const message =
    (typeof data?.error === 'string' && data.error) ||
    (typeof err?.message === 'string' ? err.message : 'Ocurrió un error inesperado');
  const fields = data?.details && typeof data.details === 'object'
    ? Object.fromEntries(
        Object.entries(data.details).map(([k, v]) => [k, typeof v === 'string' ? v : 'Inválido'])
      )
    : undefined;
  return { message, fields };
}

/**
 * Lee el hash OAuth (formato #at=B64::u=B64) y limpia la URL.
 * @returns {{accessToken?: string, user?: any} | null}
 */
export function readOAuthHash() {
  if (typeof window === 'undefined') return null;
  const raw = window.location.hash || '';
  if (!raw || !raw.startsWith('#')) return null;
  const sep = encodeURIComponent('::');
  const parts = raw.slice(1).split(sep);
  if (parts.length !== 2) return null;
  const atPart = parts[0].startsWith('at=') ? parts[0].slice(3) : null;
  const uPart = parts[1].startsWith('u=') ? parts[1].slice(2) : null;
  if (!atPart) return null;
  try {
    const accessToken = atob(atPart.replace(/-/g, '+').replace(/_/g, '/'));
    const user = uPart ? JSON.parse(atob(uPart.replace(/-/g, '+').replace(/_/g, '/'))) : undefined;
    history.replaceState(null, '', window.location.pathname + window.location.search);
    return { accessToken, user };
  } catch (e) {
    return null;
  }
}

/**
 * Delay util (ms).
 */
export const delay = (ms) => new Promise((r) => setTimeout(r, ms));
