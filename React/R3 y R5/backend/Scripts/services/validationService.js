const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Escapa caracteres peligrosos para prevenir XSS reflejado en mensajes de error.
 * @param {string} input
 */
export function escapeHtml(input) {
  if (typeof input !== 'string') return '';
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Valida y sanitiza un email.
 * @param {unknown} value
 * @returns {{valid: boolean, value?: string, error?: string}}
 */
export function validateEmail(value) {
  if (typeof value !== 'string') return { valid: false, error: 'Email requerido' };
  const trimmed = value.trim().toLowerCase();
  if (!trimmed) return { valid: false, error: 'Email requerido' };
  if (!EMAIL_RE.test(trimmed)) return { valid: false, error: 'Email inválido' };
  if (trimmed.length > 255) return { valid: false, error: 'Email demasiado largo' };
  return { valid: true, value: trimmed };
}

/**
 * Valida contraseña: mínimo 8 caracteres, al menos 1 letra y 1 número.
 * @param {unknown} value
 */
export function validatePassword(value) {
  if (typeof value !== 'string') return { valid: false, error: 'Contraseña requerida' };
  if (value.length < 8) return { valid: false, error: 'Mínimo 8 caracteres' };
  if (value.length > 128) return { valid: false, error: 'Máximo 128 caracteres' };
  if (!/[A-Za-z]/.test(value)) return { valid: false, error: 'Debe incluir al menos una letra' };
  if (!/[0-9]/.test(value)) return { valid: false, error: 'Debe incluir al menos un número' };
  return { valid: true, value };
}

/**
 * Valida confirmación de contraseña.
 */
export function validatePasswordConfirmation(value, password) {
  if (typeof value !== 'string') return { valid: false, error: 'Confirmación requerida' };
  if (value !== password) return { valid: false, error: 'Las contraseñas no coinciden' };
  return { valid: true, value };
}

/**
 * Valida un nombre de usuario / display name.
 */
export function validateDisplayName(value) {
  if (typeof value !== 'string') return { valid: false, error: 'Nombre requerido' };
  const trimmed = value.trim();
  if (!trimmed) return { valid: false, error: 'Nombre requerido' };
  if (trimmed.length < 2) return { valid: false, error: 'Mínimo 2 caracteres' };
  if (trimmed.length > 100) return { valid: false, error: 'Máximo 100 caracteres' };
  return { valid: true, value: trimmed };
}

/**
 * Valida username opcional.
 */
export function validateUsername(value) {
  if (value === undefined || value === null || value === '') return { valid: true, value: null };
  if (typeof value !== 'string') return { valid: false, error: 'Username inválido' };
  const trimmed = value.trim();
  if (!/^[A-Za-z0-9_-]{3,50}$/.test(trimmed)) {
    return { valid: false, error: 'Username debe tener 3-50 caracteres alfanuméricos, _ o -' };
  }
  return { valid: true, value: trimmed };
}

export function buildUserPayload(user) {
  return {
    id: user.id,
    email: user.email,
    username: user.username,
    displayName: user.display_name,
    avatarUrl: user.avatar_url,
  };
}
