import axios from 'axios';

import { STORAGE_KEYS, MESSAGES } from '../utils/constants.js';

/** URL base de la API (Vite expone las variables con prefijo VITE_). */
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

/**
 * Cliente HTTP único para todo el frontend (ambos sistemas comparten servicios).
 *
 * - Inyecta el JWT desde localStorage en cada request.
 * - Normaliza los errores a un objeto Error con `status` y `data`, para que
 *   los componentes no tengan que conocer la forma cruda de Axios.
 */
export const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

/* Request: agrega el token si existe. */
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/* Response: convierte los errores de Axios en errores legibles. */
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status ?? 0;
    const data = error.response?.data ?? {};

    let message = data.message;
    if (!message) {
      message = error.code === 'ECONNABORTED' ? MESSAGES.NETWORK_ERROR : MESSAGES.NETWORK_ERROR;
      if (status === 401) message = MESSAGES.SESSION_EXPIRED;
    }

    const normalized = new Error(message);
    normalized.status = status;
    normalized.data = data; // body completo (incluye requiresEmail, profile, etc.)
    normalized.errors = Array.isArray(data.errors) ? data.errors : null;
    return Promise.reject(normalized);
  }
);
