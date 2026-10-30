/**
 * Navegación del Sistema B.
 *
 * NO usa React Router: las "rutas" son simplemente nombres de vista que el
 * componente raíz guarda en un useState. Este módulo concentra las constantes
 * y la única lectura de la URL que existe en el sistema (la de entrada).
 */

/** Vistas disponibles. */
export const VIEWS = {
  LOGIN: 'login',
  REGISTER: 'register',
  DASHBOARD: 'dashboard',
  PROFILE: 'profile',
  OAUTH: 'oauth',
};

/** Vistas que exigen sesión iniciada. */
export const PROTECTED_VIEWS = [VIEWS.DASHBOARD, VIEWS.PROFILE];

/** Vistas que sólo tienen sentido sin sesión. */
export const PUBLIC_VIEWS = [VIEWS.LOGIN, VIEWS.REGISTER];

/**
 * Vista inicial deducida de la URL con la que se entra a la aplicación.
 *
 * Es el único momento en que se mira la URL: el backend redirige a
 * /auth/callback (retorno de OAuth) o a /profile (retorno de vinculación), y
 * a partir de ahí la navegación es 100% estado interno.
 */
export function resolveInitialView() {
  const { pathname, search } = window.location;
  const params = new URLSearchParams(search);

  // Retorno del proveedor: trae `code` (éxito/pendiente) o `error`.
  if (pathname === '/auth/callback' || params.has('code') || params.has('error')) {
    return VIEWS.OAUTH;
  }

  if (pathname === '/profile') return VIEWS.PROFILE;
  if (pathname === '/login') return VIEWS.LOGIN;
  if (pathname === '/register') return VIEWS.REGISTER;

  return VIEWS.DASHBOARD;
}
