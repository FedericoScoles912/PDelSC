import axios from 'axios';
import { API_BASE_URL, STORAGE_KEYS } from '../utils/constants.js';

/**
 * Cliente Axios configurado con base URL e interceptor para inyectar token Bearer.
 */
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Interceptor de solicitudes: adjunta el token JWT guardado en localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor de respuestas: normaliza errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const customError = {
      status: error.response?.status || 500,
      message: error.response?.data?.error || error.message || 'Error de conexión con el servidor',
      data: error.response?.data,
    };
    return Promise.reject(customError);
  }
);

export default api;
