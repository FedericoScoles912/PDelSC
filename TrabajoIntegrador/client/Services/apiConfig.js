/**
 * apiConfig.js
 * URL base de la API. En Expo, las variables EXPO_PUBLIC_* se leen de .env.
 *
 * IMPORTANTE (Expo Go en teléfono físico): 'localhost' apunta al teléfono,
 * no a la PC. Definí en client/.env:
 *   EXPO_PUBLIC_API_URL=http://192.168.x.x:4000/api/v1
 */
import { Platform } from 'react-native';

const DEFAULT_BASE = Platform.select({
  // Emulador Android: 10.0.2.2 es el host
  android: 'http://10.0.2.2:4000/api/v1',
  default: 'http://localhost:4000/api/v1',
});

export const API_URL = (process.env.EXPO_PUBLIC_API_URL || DEFAULT_BASE).replace(/\/$/, '');

/** Origen del backend (sin /api/v1), útil para armar redirects OAuth. */
export const API_ORIGIN = API_URL.replace(/\/api\/v1$/, '');

export const ENDPOINTS = {
  login: '/auth/login',
  register: '/auth/register',
  social: (proveedor) => `/auth/social/${proveedor}`,
  refresh: '/auth/refresh',
  logout: '/auth/logout',
  me: '/auth/me',
  password: '/auth/password',
  dashboard: '/dashboard',
  alertas: '/dashboard/alertas',
  productos: '/productos',
  productosBuscar: '/productos/buscar',
  categoria: '/categorias',
  usuarios: '/usuarios',
  roles: '/roles',
  movimientos: '/movimientos',
  movimientosUltimos: '/movimientos/ultimos',
  precios: '/precios',
  reportes: '/reportes',
  import: '/import',
  auditoria: '/auditoria',
  config: '/configuracion',
};

export default { API_URL, API_ORIGIN, ENDPOINTS };
