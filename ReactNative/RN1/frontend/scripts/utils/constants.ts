import { Breakpoint } from '../types';

/**
 * Constantes de configuración global
 */

export const API_BASE_URL: string =
  process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

export const API_TIMEOUT_MS: number = 10000;

export const THEME_STORAGE_KEY: string = '@acceso_usuarios:theme_mode';

/**
 * Valores mínimos en píxeles equivalentes a la grilla de Bootstrap
 */
export const BREAKPOINT_VALUES: Record<Breakpoint, number> = {
  xs: 0,
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200,
  xxl: 1400,
};
