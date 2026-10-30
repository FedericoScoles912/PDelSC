import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { Breakpoint } from '../types';

/**
 * Constantes de configuración global
 */

/** Puerto donde escucha el backend Express (ver backend/.env → PORT) */
const API_PORT: number = 3000;

/** Hosts que, dentro de un dispositivo, apuntan al propio dispositivo y no a la PC */
const LOOPBACK_HOSTS: string[] = ['localhost', '127.0.0.1', '0.0.0.0', '::1'];

/** Extrae el host sin puerto de una URL, p. ej. "http://10.0.11.139:3000/api" → "10.0.11.139" */
const extractHost = (url?: string): string | null => {
  const match = url?.match(/^[a-z]+:\/\/([^/:]+)/i);
  return match ? match[1] : null;
};

/**
 * Resuelve la URL base de la API.
 *
 * - Expo Web: usa "localhost" del navegador.
 * - Android/iOS: "localhost" apunta al propio dispositivo, por lo que la conexión
 *   falla (java.net.ConnectException). En su lugar se reutiliza el host del servidor
 *   de desarrollo de Expo, que es la IP de la PC en la red local.
 *
 * EXPO_PUBLIC_API_URL permite forzar otro host (backend remoto, túnel, etc.);
 * solo se ignora en el dispositivo si apunta a localhost.
 */
const resolveApiBaseUrl = (): string => {
  const explicitUrl = process.env.EXPO_PUBLIC_API_URL;
  const fallbackUrl = `http://localhost:${API_PORT}/api`;

  if (Platform.OS === 'web') {
    return explicitUrl || fallbackUrl;
  }

  const explicitHost = extractHost(explicitUrl);
  const isLoopbackExplicit = !!explicitHost && LOOPBACK_HOSTS.includes(explicitHost);
  if (explicitUrl && !isLoopbackExplicit) {
    return explicitUrl;
  }

  // hostUri tiene el formato "10.0.11.139:8081" (host del bundler de Expo)
  const devHost = Constants.expoConfig?.hostUri?.split(':')[0];

  return devHost ? `http://${devHost}:${API_PORT}/api` : explicitUrl || fallbackUrl;
};

export const API_BASE_URL: string = resolveApiBaseUrl();

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
