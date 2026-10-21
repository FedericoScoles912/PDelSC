/**
 * navItems.js
 * Definición de las secciones de la app y qué roles pueden verlas.
 */
import { ROLES, TODOS, EDITORES } from '../Utils/roles';

export const NAV_ITEMS = [
  { name: 'Dashboard', label: 'Dashboard', icon: 'dashboard', roles: TODOS },
  { name: 'Productos', label: 'Productos', icon: 'productos', roles: TODOS },
  { name: 'Busqueda', label: 'Búsqueda por medidas', icon: 'search', roles: TODOS },
  { name: 'Movimientos', label: 'Movimientos', icon: 'movimientos', roles: TODOS },
  { name: 'Precios', label: 'Precios', icon: 'precios', roles: EDITORES },
  { name: 'Reportes', label: 'Reportes', icon: 'reportes', roles: TODOS },
  { name: 'Usuarios', label: 'Usuarios', icon: 'usuarios', roles: [ROLES.ADMIN] },
  { name: 'Auditoria', label: 'Auditoría', icon: 'auditoria', roles: [ROLES.ADMIN] },
  { name: 'Configuracion', label: 'Configuración', icon: 'config', roles: [ROLES.ADMIN] },
];

/** Filtra los ítems de navegación según el rol del usuario. */
export function itemsForRole(rol) {
  return NAV_ITEMS.filter((item) => item.roles.includes(rol));
}

export default { NAV_ITEMS, itemsForRole };
