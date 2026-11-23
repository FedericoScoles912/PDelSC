/**
 * @file Adaptador de almacenamiento persistente. Usa `expo-secure-store` en
 *       nativo (cifrado por el sistema operativo) y `localStorage` en web,
 *       donde SecureStore no está disponible.
 * @module client/src/servicios/almacenamiento
 */

import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const ES_WEB = Platform.OS === 'web';

/** Prefijo actual de las claves persistidas y prefijo histórico (versiones previas al renombrado a Stocker). */
const PREFIJO_ACTUAL = 'stocker.';
const PREFIJO_LEGADO = 'retenes.';

/** Lee un valor persistido. Devuelve `null` si no existe. */
async function leerCrudo(clave: string): Promise<string | null> {
  if (ES_WEB) {
    if (typeof window === 'undefined') return null;
    return window.localStorage.getItem(clave);
  }
  return SecureStore.getItemAsync(clave);
}

/**
 * Lee un valor persistido. Si no existe con el prefijo `stocker.` pero sí con el
 * prefijo histórico `retenes.`, lo migra de forma transparente para no cerrar
 * sesiones ni perder la configuración de instalaciones anteriores.
 */
export async function obtener(clave: string): Promise<string | null> {
  try {
    const valor = await leerCrudo(clave);
    if (valor !== null || !clave.startsWith(PREFIJO_ACTUAL)) return valor;

    const claveLegada = PREFIJO_LEGADO + clave.slice(PREFIJO_ACTUAL.length);
    const heredado = await leerCrudo(claveLegada);
    if (heredado !== null) {
      await guardar(clave, heredado);
      await eliminar(claveLegada);
    }
    return heredado;
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
  tema: 'stocker.tema',
  /** Token de acceso JWT. */
  accessToken: 'stocker.access_token',
  /** Token de refresco JWT. */
  refreshToken: 'stocker.refresh_token',
  /** Datos del usuario autenticado. */
  usuario: 'stocker.usuario',
  /** Lista de servidores desbloqueados con Código Único (ID) y contraseña en este dispositivo. */
  servidoresNegocio: 'stocker.servidores_autenticados_v2',
  /** ID del servidor de negocio actualmente autenticado. */
  servidorActivoId: 'stocker.servidor_activo_id_v2',
  /** Carrito de pedido a importadora por bajo stock. */
  carritoReposicion: 'stocker.carrito_reposicion',
  /** Preferencia de actualizaciones automáticas OTA. */
  autoUpdateOta: 'stocker.auto_update_ota'
} as const;
