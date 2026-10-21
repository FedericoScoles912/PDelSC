/**
 * http.js
 * Cliente HTTP de bajo nivel (axios). Lo usan los thunks de auth y el
 * baseQuery de RTK Query. Aquí NO se adjunta el token: eso lo hace el baseQuery.
 */
import axios from 'axios';
import { API_URL } from './apiConfig';

export const rawApi = axios.create({
  baseURL: API_URL,
  timeout: 20000,
  headers: { 'Content-Type': 'application/json' },
});

/** Normaliza el error del backend a { status, message, details }. */
export function normalizeError(err) {
  const status = err?.response?.status ?? 0;
  const body = err?.response?.data;
  return {
    status,
    message: body?.error?.message || err?.message || 'Error de conexión con el servidor',
    details: body?.error?.details,
  };
}

export default rawApi;
