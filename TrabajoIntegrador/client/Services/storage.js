/**
 * storage.js
 * Persistencia de la sesión.
 *  - Android/iOS: expo-secure-store (cifrado por el sistema).
 *  - Web: localStorage (SecureStore no está disponible en web).
 */
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const KEY = 'retenes.session';

const webStorage = {
  getItem: (k) => Promise.resolve(globalThis.localStorage?.getItem(k) ?? null),
  setItem: (k, v) => Promise.resolve(globalThis.localStorage?.setItem(k, v)),
  removeItem: (k) => Promise.resolve(globalThis.localStorage?.removeItem(k)),
};

const nativeStorage = {
  getItem: (k) => SecureStore.getItemAsync(k),
  setItem: (k, v) => SecureStore.setItemAsync(k, v),
  removeItem: (k) => SecureStore.deleteItemAsync(k),
};

const store = Platform.OS === 'web' ? webStorage : nativeStorage;

/** Guarda { accessToken, refreshToken, usuario }. */
export async function saveSession(session) {
  try {
    await store.setItem(KEY, JSON.stringify(session));
  } catch {
    /* noop: si falla la persistencia la sesión sigue en memoria */
  }
}

/** @returns {Promise<{accessToken?:string, refreshToken?:string, usuario?:object}|null>} */
export async function loadSession() {
  try {
    const raw = await store.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export async function clearSession() {
  try {
    await store.removeItem(KEY);
  } catch {
    /* noop */
  }
}

export default { saveSession, loadSession, clearSession };
