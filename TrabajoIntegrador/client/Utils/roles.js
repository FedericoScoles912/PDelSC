/**
 * roles.js
 * Nombres de rol (deben coincidir EXACTAMENTE con los del backend).
 */
export const ROLES = {
  ADMIN: 'Administrador',
  DEPOSITO: 'Encargado de Deposito',
  VENDEDOR: 'Vendedor',
};

export const TODOS = [ROLES.ADMIN, ROLES.DEPOSITO, ROLES.VENDEDOR];
export const EDITORES = [ROLES.ADMIN, ROLES.DEPOSITO];

/** ¿El usuario tiene alguno de los roles indicados? */
export function hasRole(usuario, roles = []) {
  if (!usuario?.rol) return false;
  return roles.includes(usuario.rol);
}

/** Etiqueta legible del rol. */
export function rolLabel(rol) {
  if (rol === ROLES.ADMIN) return 'Administrador';
  if (rol === ROLES.DEPOSITO) return 'Encargado de Depósito';
  if (rol === ROLES.VENDEDOR) return 'Vendedor';
  return rol || '—';
}

export default { ROLES, TODOS, EDITORES, hasRole, rolLabel };
