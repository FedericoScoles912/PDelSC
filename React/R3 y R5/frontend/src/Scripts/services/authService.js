import api from './api.js';

/**
 * Servicio centralizado de autenticación.
 * Todas las llamadas usan Axios a través de la instancia configurada en api.js.
 */

/**
 * Registro por email + password.
 * @param {{email:string, password:string, confirmPassword:string, displayName:string, username?:string}} payload
 */
export async function register(payload) {
  const { data } = await api.post('/auth/register', payload);
  return data;
}

/**
 * Login tradicional.
 * @param {{email:string, password:string}} payload
 */
export async function login(payload) {
  const { data } = await api.post('/auth/login', payload);
  return data;
}

/**
 * Intenta renovar la sesión usando el refresh token cookie (auto-login).
 */
export async function refreshSession() {
  const { data } = await api.post('/auth/refresh');
  return data;
}

/**
 * Logout (dispositivo actual).
 */
export async function logout() {
  try {
    const { data } = await api.post('/auth/logout');
    return data;
  } catch (_err) {
    return { ok: true };
  }
}

/**
 * Logout global (todos los dispositivos).
 */
export async function logoutAll() {
  try {
    const { data } = await api.post('/auth/logout-all');
    return data;
  } catch (_err) {
    return { ok: true };
  }
}

/**
 * Obtiene el perfil completo del usuario logueado.
 */
export async function getMe() {
  const { data } = await api.get('/user/me');
  return data;
}

/**
 * Actualiza el perfil del usuario.
 * @param {{displayName?:string, username?:string|null}} payload
 */
export async function updateMe(payload) {
  const { data } = await api.patch('/user/me', payload);
  return data;
}

/**
 * Cambio de contraseña.
 */
export async function changePassword(payload) {
  const { data } = await api.post('/user/change-password', payload);
  return data;
}

/**
 * Lista proveedores OAuth configurados.
 */
export async function listOAuthProviders() {
  const { data } = await api.get('/oauth');
  return data;
}

/**
 * URL de inicio de OAuth para un proveedor (redirect flow).
 * @param {string} provider 'google' | 'meta' | 'github' | 'twitter' | 'discord' | 'twitch'
 * @param {string} redirect Ruta a la que volver tras OAuth (ej /dashboard)
 */
export function buildOAuthUrl(provider, redirect = '/dashboard') {
  const base = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const params = new URLSearchParams({ redirect });
  return `${base}/oauth/${encodeURIComponent(provider)}?${params.toString()}`;
}

const authService = {
  register, login, refreshSession, logout, logoutAll,
  getMe, updateMe, changePassword, listOAuthProviders, buildOAuthUrl,
};
export default authService;
