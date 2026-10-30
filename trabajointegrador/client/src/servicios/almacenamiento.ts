/**
 * @file Adaptador de almacenamiento persistente. Usa `expo-secure-store` en
 *       nativo (cifrado por el sistema operativo) y `localStorage` en web,
 *       donde SecureStore no está disponible.
 * @module client/src/servicios/almacenamiento
 */

import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const ES_WEB = Platform.OS === 'web';

/** Lee un valor persistido. Devuelve `null` si no existe. */
export async function obtener(clave: string): Promise<string | null> {
  try {
    if (ES_WEB) {
      if (typeof window === 'undefined') return null;
      return window.localStorage.getItem(clave);
    }
    return await SecureStore.getItemAsync(clave);
  } catch {
    return null;
  }
}

/** Guarda un valor persistido. */
export async function guardar(clave: string, valor: string): Promise<void> {
  try {
    if (ES_WEB) {
      if (typeof window === 'undefined') return;
      window.localStorage.setItem(clave, valor);
      return;
    }
    await SecureStore.setItemAsync(clave, valor);
  } catch {
    /* almacenamiento no disponible: la sesión queda sólo en memoria */
  }
}

/** Elimina un valor persistido. */
export async function eliminar(clave: string): Promise<void> {
  try {
    if (ES_WEB) {
      if (typeof window === 'undefined') return;
      window.localStorage.removeItem(clave);
      return;
    }
    await SecureStore.deleteItemAsync(clave);
  } catch {
    /* ignorado */
  }
}

/** Claves de almacenamiento usadas por la aplicación. */
export const CLAVES = {
  /** Preferencia de tema (claro/oscuro). */
  tema: 'retenes.tema',
  /** Token de acceso JWT. */
  accessToken: 'retenes.access_token',
  /** Token de refresco JWT. */
  refreshToken: 'retenes.refresh_token',
  /** Datos del usuario autenticado. */
  usuario: 'retenes.usuario'
} as const;
